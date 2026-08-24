-- Real coupon and shipping-fee calculation (backend/src/modules/cart-checkout/domain/
-- checkout.service.ts): CheckoutSession gains a pricing breakdown instead of total ==
-- subtotal always. discount_amount/shipping_fee_amount get a constant default (0.00),
-- which Postgres applies without a full table rewrite (Vol 2, D4's online-migration
-- guidance is about backfills, not constant defaults) — every pre-existing row reads as
-- "no discount, no shipping fee," preserving its previous total unchanged.
ALTER TABLE "checkout_sessions"
  ADD COLUMN "promo_code" TEXT,
  ADD COLUMN "discount_amount" DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN "shipping_fee_amount" DECIMAL(14, 2) NOT NULL DEFAULT 0.00;
