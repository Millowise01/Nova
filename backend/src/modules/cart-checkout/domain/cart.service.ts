import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type { AddCartLineInput } from "@nova/validation";

import { NotFoundError } from "../../../common/errors/api-error";
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

  async addLine(cartId: string, input: AddCartLineInput) {
    const cart = await this.getActiveCartOrThrow(cartId);

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

  async getCart(cartId: string) {
    const cart = await this.getActiveCartOrThrow(cartId);
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

  async getActiveCartOrThrow(cartId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, deletedAt: null, status: "active" },
    });
    if (!cart) throw new NotFoundError("CART_NOT_FOUND", "No active cart found for this ID.");
    return cart;
  }
}
