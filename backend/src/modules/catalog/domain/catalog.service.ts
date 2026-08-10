import { Injectable } from "@nestjs/common";

import type {
  CreateBrandInput,
  CreateCategoryInput,
  CreateProductInput,
  ListProductsQuery,
} from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { ConflictError, NotFoundError } from "../../../common/errors/api-error";
import { decodeCursor, encodeCursor } from "../../../common/pagination/cursor";
import { PrismaService } from "../../../prisma/prisma.service";
import { IdentityPublicService } from "../../identity";

const DEFAULT_PAGE_SIZE = 20;

/** Builds a Postgres tsquery string that prefix-matches every word in `q`, e.g.
 *  "wireless mo" -> "wireless:* & mo:*" — this is what makes partial words match
 *  (searching "pho" finds "phone"), not just whole-word stemmed matches. Each term
 *  is stripped to alphanumerics before being embedded in the tsquery syntax string,
 *  since to_tsquery() parses operators (&, |, !, (, ), ') out of its input — an
 *  unsanitized term containing one of those would throw a syntax error (not a SQL
 *  injection risk either way, since the whole string is still passed as a bound
 *  parameter to to_tsquery(), never concatenated into the SQL itself). Returns ""
 *  for a query with no usable terms (e.g. all punctuation), which callers treat as
 *  "no results" rather than sending an empty string to to_tsquery (which errors). */
function toPrefixTsQuery(q: string): string {
  const terms = q
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((term) => term.length > 0);
  return terms.map((term) => `${term}:*`).join(" & ");
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogger,
    private readonly identity: IdentityPublicService,
  ) {}

  async createCategory(input: CreateCategoryInput) {
    const existing = await this.prisma.category.findUnique({ where: { slug: input.slug } });
    if (existing)
      throw new ConflictError("CATEGORY_SLUG_TAKEN", "This category slug is already in use.");
    return this.prisma.category.create({ data: input });
  }

  async createBrand(input: CreateBrandInput) {
    const existing = await this.prisma.brand.findUnique({ where: { slug: input.slug } });
    if (existing) throw new ConflictError("BRAND_SLUG_TAKEN", "This brand slug is already in use.");
    return this.prisma.brand.create({ data: input });
  }

  /** sellerId is passed separately rather than trusted from the request body — it comes
   *  from the authenticated caller's JWT (backend/docs/05: authorization is never a
   *  client-supplied value). */
  async createProduct(sellerId: string, input: CreateProductInput, ctx: RequestContext) {
    const existing = await this.prisma.product.findUnique({ where: { slug: input.slug } });
    if (existing)
      throw new ConflictError("PRODUCT_SLUG_TAKEN", "This product slug is already in use.");

    const product = await this.prisma.product.create({
      data: {
        sellerId,
        categoryId: input.categoryId,
        brandId: input.brandId,
        title: input.title,
        slug: input.slug,
        description: input.description,
        isFeatured: input.isFeatured ?? false,
        isFlashSale: input.isFlashSale ?? false,
        status: "published",
        variants: {
          create: input.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            priceAmount: v.priceAmount,
            priceCurrency: v.priceCurrency,
            stockQuantity: v.stockQuantity,
          })),
        },
      },
      include: { variants: true },
    });

    await this.audit.record({
      actorId: sellerId,
      action: "product.create",
      targetType: "Product",
      targetId: product.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: { variants: { where: { deletedAt: null } }, category: true, brand: true },
    });
    if (!product) throw new NotFoundError("PRODUCT_NOT_FOUND", "No product found for this slug.");
    return product;
  }

  /** Cursor-paginated per backend/docs/02-api-standards.md's proposed format. Also
   *  backs the seller storefront's GET /v1/sellers/:id/products (via the sellerId
   *  filter) and the merchandising views (featured/flashSale/category/brand) — one
   *  query shape, filtered differently, rather than a separate method per view.
   *  When `q` is present, delegates to searchProducts() below (a genuinely different
   *  query shape — ranked by relevance, not time — so it gets its own pagination
   *  semantics rather than forcing relevance order through a createdAt cursor). */
  async listProducts(query: ListProductsQuery = {}) {
    if (query.q) return this.searchProducts(query);

    const {
      cursor,
      limit = DEFAULT_PAGE_SIZE,
      featured,
      flashSale,
      categoryId,
      brandId,
      sellerId,
      minPrice,
      maxPrice,
    } = query;
    const decoded = cursor ? decodeCursor(cursor) : null;

    const products = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "published",
        ...(featured !== undefined ? { isFeatured: featured } : {}),
        ...(flashSale !== undefined ? { isFlashSale: flashSale } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(brandId ? { brandId } : {}),
        ...(sellerId ? { sellerId } : {}),
        ...(minPrice || maxPrice
          ? {
              variants: {
                some: {
                  deletedAt: null,
                  priceAmount: {
                    ...(minPrice ? { gte: minPrice } : {}),
                    ...(maxPrice ? { lte: maxPrice } : {}),
                  },
                },
              },
            }
          : {}),
        ...(decoded ? { OR: [{ createdAt: { lt: new Date(decoded.sortValue) } }] } : {}),
      },
      include: { variants: { where: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = products.length > limit;
    const page = hasMore ? products.slice(0, limit) : products;
    const last = page[page.length - 1];

    return {
      data: page,
      pageInfo: {
        hasMore,
        nextCursor:
          hasMore && last
            ? encodeCursor({ sortValue: last.createdAt.toISOString(), id: last.id })
            : null,
      },
    };
  }

  /** Full-text search (Batch B) — Postgres tsvector/tsquery over title+description
   *  (see Product.searchVector's generated column), combined with the same
   *  category/brand/seller/featured/flashSale/price-range filters listProducts()
   *  supports. Ranked by ts_rank, not recency.
   *
   *  Two-step because `searchVector` is a Prisma `Unsupported` type (excluded from
   *  the typed query builder by design — Prisma has no schema syntax for a generated
   *  tsvector column): step 1 is a raw-SQL query for just (id, rank), fully
   *  parameterized (no string concatenation of user input into SQL); step 2 re-fetches
   *  those specific rows through the normal typed Prisma client (so `include: { variants }`
   *  keeps working exactly like every other query), then restores step 1's rank order
   *  since `WHERE id IN (...)` does not preserve it. */
  private async searchProducts(query: ListProductsQuery) {
    const {
      q,
      cursor,
      limit = DEFAULT_PAGE_SIZE,
      featured,
      flashSale,
      categoryId,
      brandId,
      sellerId,
      minPrice,
      maxPrice,
    } = query;

    const tsQuery = toPrefixTsQuery(q!);
    if (!tsQuery) {
      return { data: [], pageInfo: { hasMore: false, nextCursor: null } };
    }

    // Relevance order has no stable "less than X" cutoff the way createdAt does, so
    // pagination here is plain offset-based — reusing encodeCursor/decodeCursor's
    // shape (sortValue holds the stringified offset, `id` unused) rather than
    // inventing a second cursor format for one query path.
    const offset = cursor ? Number(decodeCursor(cursor).sortValue) || 0 : 0;

    const ranked = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id
      FROM products p
      WHERE p.deleted_at IS NULL
        AND p.status = 'published'
        AND p.search_vector @@ to_tsquery('english', ${tsQuery})
        AND (${categoryId ?? null}::text IS NULL OR p.category_id = ${categoryId ?? null}::text)
        AND (${brandId ?? null}::text IS NULL OR p.brand_id = ${brandId ?? null}::text)
        AND (${sellerId ?? null}::text IS NULL OR p.seller_id = ${sellerId ?? null}::text)
        AND (${featured ?? null}::boolean IS NULL OR p.is_featured = ${featured ?? null}::boolean)
        AND (${flashSale ?? null}::boolean IS NULL OR p.is_flash_sale = ${flashSale ?? null}::boolean)
        AND (
          ${minPrice ?? null}::numeric IS NULL
          OR EXISTS (
            SELECT 1 FROM variants v
            WHERE v.product_id = p.id AND v.deleted_at IS NULL
              AND v.price_amount >= ${minPrice ?? null}::numeric
          )
        )
        AND (
          ${maxPrice ?? null}::numeric IS NULL
          OR EXISTS (
            SELECT 1 FROM variants v
            WHERE v.product_id = p.id AND v.deleted_at IS NULL
              AND v.price_amount <= ${maxPrice ?? null}::numeric
          )
        )
      ORDER BY ts_rank(p.search_vector, to_tsquery('english', ${tsQuery})) DESC, p.id ASC
      LIMIT ${limit + 1} OFFSET ${offset}
    `;

    const hasMore = ranked.length > limit;
    const page = hasMore ? ranked.slice(0, limit) : ranked;
    const ids = page.map((r) => r.id);

    if (ids.length === 0) {
      return { data: [], pageInfo: { hasMore: false, nextCursor: null } };
    }

    const rows = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: { variants: { where: { deletedAt: null } } },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const data = ids.map((id) => byId.get(id)).filter((r): r is (typeof rows)[number] => !!r);

    return {
      data,
      pageInfo: {
        hasMore,
        nextCursor: hasMore ? encodeCursor({ sortValue: String(offset + limit), id: "" }) : null,
      },
    };
  }

  /** GET /v1/categories — flat, unpaginated (small bounded dataset). */
  async listCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  /** GET /v1/brands — flat, unpaginated (small bounded dataset). */
  async listBrands() {
    return this.prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  /** GET /v1/sellers/:id — public storefront profile. A synchronous cross-module call
   *  into Identity's public service, per backend/docs/01-module-contract.md, since
   *  the seller PROFILE is Identity-owned data even though this route lives on
   *  Catalog (grouping both /sellers endpoints under one controller rather than
   *  splitting the same URL prefix across two modules). */
  async getSellerProfile(sellerId: string) {
    return this.identity.getPublicSellerProfile(sellerId);
  }
}
