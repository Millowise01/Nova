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
   *  query shape, filtered differently, rather than a separate method per view. */
  async listProducts(query: ListProductsQuery = {}) {
    const {
      cursor,
      limit = DEFAULT_PAGE_SIZE,
      featured,
      flashSale,
      categoryId,
      brandId,
      sellerId,
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
