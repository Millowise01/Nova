import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../prisma/prisma.service";
import { CheckoutService } from "../domain/checkout.service";

export interface CheckoutSessionSnapshot {
  id: string;
  cartId: string;
  userId: string | null;
  totalAmount: string;
  totalCurrency: string;
  lines: { variantId: string; quantity: number }[];
}

/** The ONLY way Orders may interact with Cart & Checkout — per backend/docs/01. */
@Injectable()
export class CartCheckoutPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkout: CheckoutService,
  ) {}

  /** Cart & Checkout owns both Cart and CheckoutSession, so it can freely join them
   *  internally — Orders receives one flat DTO and never touches either table itself. */
  async getSessionWithLines(sessionId: string): Promise<CheckoutSessionSnapshot> {
    const session = await this.checkout.getSession(sessionId);
    const lines = await this.prisma.cartLine.findMany({
      where: { cartId: session.cartId, deletedAt: null },
      select: { variantId: true, quantity: true },
    });

    return {
      id: session.id,
      cartId: session.cartId,
      userId: session.userId,
      totalAmount: session.totalAmount.toFixed(2),
      totalCurrency: session.totalCurrency,
      lines,
    };
  }

  /**
   * Atomically transitions a CheckoutSession pending -> consumed, WITHIN the caller's
   * own transaction (`tx`) — not a separate one. This is what makes the checkout
   * orchestration genuinely idempotent: the conditional `updateMany` below only
   * matches a row that is still `status: "pending"`, so a concurrent or retried second
   * attempt to consume the same session updates zero rows and this returns `false`,
   * telling Orders "don't create a second Order for this session" — the enforcement is
   * a single atomic SQL statement, not a check-then-act race.
   */
  async tryConsumeSession(tx: Prisma.TransactionClient, sessionId: string): Promise<boolean> {
    const result = await tx.checkoutSession.updateMany({
      where: { id: sessionId, status: "pending", deletedAt: null },
      data: { status: "consumed", consumedAt: new Date() },
    });
    return result.count === 1;
  }
}
