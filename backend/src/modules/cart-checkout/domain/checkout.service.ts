import { Inject, Injectable } from "@nestjs/common";

import type { CheckoutFormValues } from "@nova/validation";

import { BadRequestError, NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

import { CartService } from "./cart.service";
import type { LogisticsFeeZoneLookup } from "./pricing/logistics-fee-zone.interface";
import { LOGISTICS_FEE_ZONE_LOOKUP } from "./pricing/logistics-fee-zone.token";
import type { MarketingCouponValidator } from "./pricing/marketing-coupon-validator.interface";
import { MARKETING_COUPON_VALIDATOR } from "./pricing/marketing-coupon-validator.token";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    @Inject(LOGISTICS_FEE_ZONE_LOOKUP) private readonly shippingFees: LogisticsFeeZoneLookup,
    @Inject(MARKETING_COUPON_VALIDATOR) private readonly coupons: MarketingCouponValidator,
  ) {}

  /** Creating a session is NOT the idempotency-critical operation — re-creating one
   *  harmlessly produces another pending session. What must not double-process is
   *  turning a session into an Order, which is Orders' job (backend/docs/02's worked
   *  example: POST /v1/orders, Idempotency-Key required) — see completeCheckout below
   *  for how this module's CheckoutSession design makes that safe. */
  async createSession(cartId: string, input: CheckoutFormValues, callerId: string | null) {
    const activeCart = await this.cart.getActiveCartOrThrow(cartId, callerId);
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
    // Shipping fee and coupon/discount calculation go through the LogisticsFeeZoneLookup /
    // MarketingCouponValidator seams (backend/src/modules/cart-checkout/domain/pricing/) —
    // both Logistics and Marketing are deferred contexts (backend/docs/00), so both are
    // stub implementations today, wired in cart-checkout.module.ts. Cart & Checkout itself
    // owns "totals/coupon calculation" per Vol 2, B1, so the arithmetic below is real even
    // while the data it draws on (zone rates, campaign rules) is stubbed.
    const shippingFee = await this.shippingFees.getShippingFee({
      deliveryMethod: input.deliveryMethod,
      district: input.district,
      currency,
    });

    let discountAmount = 0;
    if (input.promoCode) {
      const result = await this.coupons.validate({
        code: input.promoCode,
        subtotal: subtotal.toFixed(2),
        currency,
      });
      if (!result.valid) {
        throw new BadRequestError("PROMO_CODE_INVALID", "This promo code is not valid.");
      }
      // Never let a discount exceed the subtotal it applies to, regardless of what the
      // validator returns — a total can't go negative.
      discountAmount = Math.min(Number(result.discountAmount), subtotal);
    }

    const total = subtotal - discountAmount + Number(shippingFee.amount);

    return this.prisma.checkoutSession.create({
      data: {
        cartId: activeCart.id,
        // The cart's owner (null for a guest cart). Orders uses this to ensure only the
        // owner can turn the session into an order.
        userId: activeCart.userId,
        addressLine: input.addressLine,
        city: input.city,
        district: input.district,
        phone: input.phone,
        deliveryMethod: input.deliveryMethod,
        paymentMethod: input.paymentMethod,
        subtotalAmount: subtotal.toFixed(2),
        subtotalCurrency: currency,
        promoCode: input.promoCode ?? null,
        discountAmount: discountAmount.toFixed(2),
        shippingFeeAmount: Number(shippingFee.amount).toFixed(2),
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
