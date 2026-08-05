import { Module } from "@nestjs/common";

import { CartCheckoutModule } from "../cart-checkout";
import { CatalogModule } from "../catalog";
import { IdentityModule } from "../identity";

import { OrdersService } from "./domain/orders.service";
import { OrdersController } from "./http/orders.controller";

@Module({
  imports: [IdentityModule, CatalogModule, CartCheckoutModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
