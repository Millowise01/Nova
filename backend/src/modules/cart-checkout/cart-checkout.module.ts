import { Module } from "@nestjs/common";

import { CatalogModule } from "../catalog";
import { IdentityModule } from "../identity";

import { CartService } from "./domain/cart.service";
import { CheckoutService } from "./domain/checkout.service";
import { LOGISTICS_FEE_ZONE_LOOKUP } from "./domain/pricing/logistics-fee-zone.token";
import { MARKETING_COUPON_VALIDATOR } from "./domain/pricing/marketing-coupon-validator.token";
import { StubLogisticsFeeZoneLookup } from "./domain/pricing/stub-logistics-fee-zone";
import { StubMarketingCouponValidator } from "./domain/pricing/stub-marketing-coupon-validator";
import { CartController } from "./http/cart.controller";
import { CartCheckoutPublicService } from "./public/cart-checkout.public-service";

@Module({
  imports: [IdentityModule, CatalogModule],
  controllers: [CartController],
  providers: [
    CartService,
    CheckoutService,
    CartCheckoutPublicService,
    // The ONE line that changes when real Logistics/Marketing modules replace these stubs.
    { provide: LOGISTICS_FEE_ZONE_LOOKUP, useClass: StubLogisticsFeeZoneLookup },
    { provide: MARKETING_COUPON_VALIDATOR, useClass: StubMarketingCouponValidator },
  ],
  exports: [CartCheckoutPublicService],
})
export class CartCheckoutModule {}
