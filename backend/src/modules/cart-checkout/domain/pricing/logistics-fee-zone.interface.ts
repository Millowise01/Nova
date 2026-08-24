export interface ShippingFeeInput {
  deliveryMethod: string;
  district: string;
  currency: string;
}

export interface ShippingFeeResult {
  amount: string;
}

/** The real seam Logistics plugs into once it exists (backend/docs/00-bounded-contexts.md:
 *  "Phase 2 (remaining) — Deferred"). Cart & Checkout owns "totals/coupon calculation" per
 *  Vol 2, B1, but a per-district shipping rate is Logistics' `DeliveryZone` data, which
 *  doesn't exist yet — this interface is the boundary so swapping the stub for a real
 *  zone-rate lookup later is a one-line change in cart-checkout.module.ts, never a change
 *  to CheckoutService itself. */
export interface LogisticsFeeZoneLookup {
  getShippingFee(input: ShippingFeeInput): Promise<ShippingFeeResult>;
}
