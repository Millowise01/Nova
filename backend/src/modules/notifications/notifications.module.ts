import { Module, OnModuleInit } from "@nestjs/common";

import { OutboxRelayService } from "../../common/outbox/outbox-relay.service";
import { IdentityModule } from "../identity";

import { NotificationService } from "./domain/notification.service";
import { OrderCancelledHandler } from "./events/handlers/order-cancelled.handler";
import { OrderPlacedHandler } from "./events/handlers/order-placed.handler";
import { RefundExecutedHandler } from "./events/handlers/refund-executed.handler";
import { RefundRejectedHandler } from "./events/handlers/refund-rejected.handler";
import { NotificationsController } from "./http/notifications.controller";

@Module({
  imports: [IdentityModule], // JwtAuthGuard
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    OrderPlacedHandler,
    OrderCancelledHandler,
    RefundExecutedHandler,
    RefundRejectedHandler,
  ],
})
export class NotificationsModule implements OnModuleInit {
  constructor(
    private readonly relay: OutboxRelayService,
    private readonly orderPlaced: OrderPlacedHandler,
    private readonly orderCancelled: OrderCancelledHandler,
    private readonly refundExecuted: RefundExecutedHandler,
    private readonly refundRejected: RefundRejectedHandler,
  ) {}

  // Imperative registration (see outbox-relay.service.ts's design note on why not
  // NestJS multi-provider DI tokens) — this is the one place all four of this
  // module's handlers get wired to the relay.
  onModuleInit() {
    this.relay.registerHandler(this.orderPlaced);
    this.relay.registerHandler(this.orderCancelled);
    this.relay.registerHandler(this.refundExecuted);
    this.relay.registerHandler(this.refundRejected);
  }
}
