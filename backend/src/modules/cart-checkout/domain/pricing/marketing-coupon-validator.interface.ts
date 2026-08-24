export interface CouponValidationInput {
  code: string;
  subtotal: string;
  currency: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discountAmount: string;
}

/** The real seam Marketing plugs into once it exists (backend/docs/00-bounded-contexts.md:
 *  "Phase 3+ — Deferred", owned schema "not yet specified — do not invent one here"). Cart &
 *  Checkout owns "totals/coupon calculation" per Vol 2, B1, but validating a code against a
 *  real campaign is Marketing's job. This interface is the boundary so swapping the stub for
 *  a real campaign-validation call later is a one-line change in cart-checkout.module.ts. */
export interface MarketingCouponValidator {
  validate(input: CouponValidationInput): Promise<CouponValidationResult>;
}
