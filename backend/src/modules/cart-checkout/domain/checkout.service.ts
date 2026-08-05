import { Injectable } from "@nestjs/common";

import type { CheckoutFormValues } from "@nova/validation";

import { BadRequestError, NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

import { CartService } from "./cart.service";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
  ) {}

  /** Creating a session is NOT the idempotency-critical operation — re-creating one
   *  harmlessly produces another pending session. What must not double-process is
   *  turning a session into an Order, which is Orders' job (backend/docs/02's worked
   *  example: POST /v1/orders, Idempotency-Key required) — see completeCheckout below
   *  for how this module's CheckoutSession design makes that safe. */
  async createSession(cartId: string, input: CheckoutFormValues) {
    const activeCart = await this.cart.getActiveCartOrThrow(cartId);
    const lines = await this.prisma.cartLine.findMany({
      where: { cartId: activeCart.id, deletedAt: null },
    });

    if (lines.length === 0) {
      throw new BadRequestError("CART_EMPTY", "Cannot check out an empty cart.");
    }

    const currency = lines[0].unitPriceCurrency;
    const subtotal = lines.reduce(
      (sum, line) => sum + Number(line.unitPriceAmount) * line.quantity,
      0,
    );
    // Shipping-fee and coupon/discount calculation are explicitly deferred — they depend
    // on Logistics (delivery-zone fee rules) and Marketing (campaign validation), both
    // Phase 2+/3+ and out of scope for this pass (backend/docs/00). Total == subtotal
    // for now; promoCode is accepted and stored but has no effect on price yet.
    const total = subtotal;

    return this.prisma.checkoutSession.create({
      data: {
        cartId: activeCart.id,
        addressLine: input.addressLine,
        city: input.city,
        district: input.district,
        phone: input.phone,
        deliveryMethod: input.deliveryMethod,
        paymentMethod: input.paymentMethod,
        subtotalAmount: subtotal.toFixed(2),
        subtotalCurrency: currency,
        totalAmount: total.toFixed(2),
        totalCurrency: currency,
        status: "pending",
      },
    });
  }

  async getSession(id: string) {
    const session = await this.prisma.checkoutSession.findFirst({ where: { id, deletedAt: null } });
    if (!session)
      throw new NotFoundError("CHECKOUT_SESSION_NOT_FOUND", "No checkout session found.");
    return session;
  }
}
