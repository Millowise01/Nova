import { Module } from "@nestjs/common";

import { CatalogModule } from "../catalog";
import { IdentityModule } from "../identity";

import { CartService } from "./domain/cart.service";
import { CheckoutService } from "./domain/checkout.service";
import { CartController } from "./http/cart.controller";
import { CartCheckoutPublicService } from "./public/cart-checkout.public-service";

@Module({
  imports: [IdentityModule, CatalogModule],
  controllers: [CartController],
  providers: [CartService, CheckoutService, CartCheckoutPublicService],
  exports: [CartCheckoutPublicService],
})
export class CartCheckoutModule {}
