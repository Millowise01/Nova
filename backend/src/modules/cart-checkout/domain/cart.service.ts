import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type { AddCartLineInput } from "@nova/validation";

import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";
import { CatalogPublicService } from "../../catalog";

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogPublicService,
  ) {}

  /** userId is set from the JWT when present; guests get an opaque token instead. */
  async createCart(userId: string | null): Promise<{ cartId: string; guestToken: string | null }> {
    const guestToken = userId ? null : randomUUID();
    const cart = await this.prisma.cart.create({
      data: { userId: userId ?? undefined, guestToken: guestToken ?? undefined },
    });
    return { cartId: cart.id, guestToken };
  }

  async addLine(cartId: string, input: AddCartLineInput, callerId: string | null) {
    const cart = await this.getActiveCartOrThrow(cartId, callerId);

    // Synchronous cross-module call to Catalog — confirms the variant is real and
    // snapshots its current price (backend/docs/00's Checkout↔Catalog pattern).
    const snapshot = await this.catalog.confirmPriceAndStock(input.variantId, input.quantity);

    const line = await this.prisma.cartLine.create({
      data: {
        cartId: cart.id,
        variantId: input.variantId,
        quantity: input.quantity,
        unitPriceAmount: snapshot.unitPriceAmount,
        unitPriceCurrency: snapshot.unitPriceCurrency,
      },
    });

    return line;
  }

  async getCart(cartId: string, callerId: string | null) {
    const cart = await this.getActiveCartOrThrow(cartId, callerId);
    const lines = await this.prisma.cartLine.findMany({
      where: { cartId: cart.id, deletedAt: null },
    });

    const subtotal = lines.reduce(
      (sum, line) => sum + Number(line.unitPriceAmount) * line.quantity,
      0,
    );

    return {
      id: cart.id,
      status: cart.status,
      lines,
      subtotal: { amount: subtotal.toFixed(2), currency: lines[0]?.unitPriceCurrency ?? "SLE" },
    };
  }

  /** The one place cart access is authorized. A guest cart (no userId) is capability-
   *  based: the unguessable cart UUID is the credential, so any holder may use it. A cart
   *  that has an owner is only usable by that owner — an absent or invalid token is 401
   *  (so a client with an expired token refreshes and retries), another user is 403.
   *  callerId is required, not optional, so no caller can forget the check. */
  async getActiveCartOrThrow(cartId: string, callerId: string | null) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, deletedAt: null, status: "active" },
    });
    if (!cart) throw new NotFoundError("CART_NOT_FOUND", "No active cart found for this ID.");

    if (cart.userId) {
      if (!callerId) {
        throw new UnauthorizedError("AUTHENTICATION_REQUIRED", "Sign in to access this cart.");
      }
      if (cart.userId !== callerId) {
        throw new ForbiddenError("CART_ACCESS_DENIED", "You do not have access to this cart.");
      }
    }
    return cart;
  }
}
