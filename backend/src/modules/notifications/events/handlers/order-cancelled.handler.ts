import { Injectable, Logger } from "@nestjs/common";

import type {
  OutboxEventHandler,
  OutboxEventPayload,
} from "../../../../common/outbox/outbox-event-handler.interface";
import { NotificationService } from "../../domain/notification.service";

interface OrderCancelledPayload {
  orderId: string;
  userId: string | null;
  reason: string | null;
}

@Injectable()
export class OrderCancelledHandler implements OutboxEventHandler {
  readonly eventType = "OrderCancelled";
  private readonly logger = new Logger(OrderCancelledHandler.name);

  constructor(private readonly notifications: NotificationService) {}

  async handle(event: OutboxEventPayload): Promise<void> {
    const payload = event.payload as OrderCancelledPayload;
    if (!payload.userId) {
      this.logger.debug(`Skipping OrderCancelled notification for guest order ${payload.orderId}`);
      return;
    }

    await this.notifications.createFromEvent({
      userId: payload.userId,
      type: "order.cancelled",
      title: "Order cancelled",
      body: payload.reason
        ? `Your order was cancelled: ${payload.reason}.`
        : "Your order has been cancelled.",
      referenceType: "Order",
      referenceId: payload.orderId,
    });
  }
}
