import { subject } from "@casl/ability";
import { Injectable } from "@nestjs/common";

import type { AddWishlistItemInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { AbilityFactory } from "../../../common/policy/ability.factory";
import type { PolicyUser } from "../../../common/policy/policy.types";
import { PrismaService } from "../../../prisma/prisma.service";
import { CatalogPublicService } from "../../catalog";

interface WishlistItemRow {
  id: string;
  wishlistId: string;
  productId: string;
  variantId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogger,
    private readonly abilityFactory: AbilityFactory,
    private readonly catalog: CatalogPublicService,
  ) {}

  /** Enriches a raw WishlistItem row with (title, slug) via a synchronous call into
   *  Catalog's public service — Wishlist never queries Catalog's tables directly
   *  (backend/docs/01-module-contract.md). */
  private async enrich(item: WishlistItemRow) {
    const product = await this.catalog.getProductSummary(item.productId);
    return { ...item, product };
  }

  /** Wishlists are created lazily on first access, not at signup — most users never
   *  use one, matching the schema comment's reasoning. */
  private async getOrCreateWishlist(userId: string) {
    const existing = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.wishlist.create({ data: { userId } });
  }

  /** GET /v1/wishlist — inherently self-scoped (always "my wishlist"), no ability
   *  check needed, same reasoning as OrdersController.listOrders. */
  async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);
    const items = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const enriched = await Promise.all(items.map((item) => this.enrich(item)));
    return { ...wishlist, items: enriched };
  }

  /** POST /v1/wishlist/items — also inherently self-scoped (adds to "my wishlist"). */
  async addItem(userId: string, input: AddWishlistItemInput, ctx: RequestContext) {
    const wishlist = await this.getOrCreateWishlist(userId);

    // App-level dedupe rather than a DB unique constraint — variantId is nullable,
    // and Postgres treats each NULL as distinct under a unique index, so a naive
    // @@unique([wishlistId, productId, variantId]) wouldn't actually prevent
    // duplicate "wishlist this whole product" rows (variantId: null) the way it
    // would for variant-specific ones. Matches CatalogService's existing
    // check-then-create pattern for slug uniqueness.
    const existing = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId: input.productId,
        variantId: input.variantId ?? null,
        deletedAt: null,
      },
    });
    if (existing) return this.enrich(existing);

    const item = await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: input.productId,
        variantId: input.variantId,
      },
    });

    await this.audit.record({
      actorId: userId,
      action: "wishlist.item.create",
      targetType: "WishlistItem",
      targetId: item.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return this.enrich(item);
  }

  /**
   * DELETE /v1/wishlist/items/:itemId — takes an arbitrary item ID that could belong
   * to someone else's wishlist, so (unlike the two methods above) this DOES need a
   * real ABAC check: fetch the item's own wishlist, tag it with CASL's subject()
   * helper, and check the requester's ability against its actual userId. Mirrors
   * OrdersService.getOrder/cancelOrder exactly — never an inline
   * `if (wishlist.userId !== userId)` check.
   */
  async removeItem(itemId: string, requester: PolicyUser, ctx: RequestContext) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { id: itemId, deletedAt: null },
    });
    if (!item)
      throw new NotFoundError("WISHLIST_ITEM_NOT_FOUND", "No wishlist item found for this ID.");

    const wishlist = await this.prisma.wishlist.findUniqueOrThrow({
      where: { id: item.wishlistId },
    });

    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("delete", subject("Wishlist", wishlist))) {
      throw new ForbiddenError(
        "WISHLIST_ACCESS_DENIED",
        "You do not have access to this wishlist item.",
      );
    }

    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });

    await this.audit.record({
      actorId: requester.id,
      action: "wishlist.item.delete",
      targetType: "WishlistItem",
      targetId: itemId,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });
  }
}
