import { Module } from "@nestjs/common";

import { CatalogModule } from "../catalog";
import { IdentityModule } from "../identity";
import { LogisticsModule, RealLogisticsFeeZoneLookup } from "../logistics";

import { CartService } from "./domain/cart.service";
import { CheckoutService } from "./domain/checkout.service";
import { LOGISTICS_FEE_ZONE_LOOKUP } from "./domain/pricing/logistics-fee-zone.token";
import { MARKETING_COUPON_VALIDATOR } from "./domain/pricing/marketing-coupon-validator.token";
import { StubMarketingCouponValidator } from "./domain/pricing/stub-marketing-coupon-validator";
import { CartController } from "./http/cart.controller";
import { CartCheckoutPublicService } from "./public/cart-checkout.public-service";

@Module({
  imports: [IdentityModule, CatalogModule, LogisticsModule],
  controllers: [CartController],
  providers: [
    CartService,
    CheckoutService,
    CartCheckoutPublicService,
    // Real Logistics (backend/docs/10) replaces the stub — the "ONE line that changes"
    // this comment always predicted. Marketing still doesn't exist (Phase 3+), so
    // coupon validation stays stubbed.
    { provide: LOGISTICS_FEE_ZONE_LOOKUP, useExisting: RealLogisticsFeeZoneLookup },
    { provide: MARKETING_COUPON_VALIDATOR, useClass: StubMarketingCouponValidator },
  ],
  exports: [CartCheckoutPublicService],
})
export class CartCheckoutModule {}
