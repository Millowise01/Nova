import { Injectable, Logger } from "@nestjs/common";

import type {
  OutboxEventHandler,
  OutboxEventPayload,
} from "../../../../common/outbox/outbox-event-handler.interface";
import { NotificationService } from "../../domain/notification.service";

interface OrderPlacedPayload {
  orderId: string;
  userId: string | null;
  total: { amount: string; currency: string };
}

/** src/modules/notifications/events/handlers/order-placed.handler.ts — per
 *  backend/docs/04-events-and-jobs.md's worked example path/naming. */
@Injectable()
export class OrderPlacedHandler implements OutboxEventHandler {
  readonly eventType = "OrderPlaced";
  private readonly logger = new Logger(OrderPlacedHandler.name);

  constructor(private readonly notifications: NotificationService) {}

  async handle(event: OutboxEventPayload): Promise<void> {
    const payload = event.payload as OrderPlacedPayload;
    // Guest orders (no userId) have no registered user to notify — nothing to do.
    if (!payload.userId) {
      this.logger.debug(`Skipping OrderPlaced notification for guest order ${payload.orderId}`);
      return;
    }

    await this.notifications.createFromEvent({
      userId: payload.userId,
      type: "order.placed",
      title: "Order placed",
      body: `Your order for ${payload.total.currency} ${payload.total.amount} has been placed.`,
      referenceType: "Order",
      referenceId: payload.orderId,
    });
  }
}
