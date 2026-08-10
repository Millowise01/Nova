import { Injectable } from "@nestjs/common";

import type {
  OutboxEventHandler,
  OutboxEventPayload,
} from "../../../../common/outbox/outbox-event-handler.interface";
import { NotificationService } from "../../domain/notification.service";

interface RefundRejectedPayload {
  refundRequestId: string;
  userId: string;
  amount: { amount: string; currency: string };
  reason: string;
}

/**
 * Batch B correction: "RefundRejected" did not previously exist as an outbox event at
 * all — RefundsService.rejectRefund() only updated RefundRequest.status and never wrote
 * to the outbox (unlike every other terminal RefundRequest transition). Added as part
 * of wiring this handler; see refunds.service.ts for the new outboxEvent.create() call.
 */
@Injectable()
export class RefundRejectedHandler implements OutboxEventHandler {
  readonly eventType = "RefundRejected";

  constructor(private readonly notifications: NotificationService) {}

  async handle(event: OutboxEventPayload): Promise<void> {
    const payload = event.payload as RefundRejectedPayload;

    await this.notifications.createFromEvent({
      userId: payload.userId,
      type: "refund.rejected",
      title: "Refund rejected",
      body: `Your refund request of ${payload.amount.currency} ${payload.amount.amount} was rejected: ${payload.reason}.`,
      referenceType: "RefundRequest",
      referenceId: payload.refundRequestId,
    });
  }
}
