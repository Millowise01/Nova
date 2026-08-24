import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity";

import { DeliveryJobService } from "./domain/delivery-job.service";
import { DeliveryZoneService } from "./domain/delivery-zone.service";
import { RealLogisticsFeeZoneLookup } from "./domain/real-logistics-fee-zone-lookup";
import { LogisticsController } from "./http/logistics.controller";

@Module({
  // IdentityModule for JwtAuthGuard (every other module's controller needs the same).
  // Deliberately NO import of OrdersModule — see delivery-job.service.ts's assign()
  // comment for why (Cart & Checkout -> Logistics -> Orders -> Cart & Checkout would
  // be a cycle). Logistics is otherwise a leaf module, same DAG tier as Catalog/
  // Payments & Wallet (both of which also only import IdentityModule).
  imports: [IdentityModule],
  controllers: [LogisticsController],
  providers: [DeliveryZoneService, DeliveryJobService, RealLogisticsFeeZoneLookup],
  // RealLogisticsFeeZoneLookup is the public seam Cart & Checkout consumes (backend/docs/10)
  // — the "ONE line that changes" in cart-checkout.module.ts's stub-provider comment.
  exports: [RealLogisticsFeeZoneLookup],
})
export class LogisticsModule {}
