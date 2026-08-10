import { Injectable } from "@nestjs/common";

import type {
  OutboxEventHandler,
  OutboxEventPayload,
} from "../../../../common/outbox/outbox-event-handler.interface";
import { NotificationService } from "../../domain/notification.service";

interface RefundExecutedPayload {
  refundRequestId: string;
  userId: string;
  amount: { amount: string; currency: string };
}

/**
 * Batch B correction: the task brief asked for a "RefundApproved" event, but the real
 * terminal success event Payments & Wallet emits is "RefundExecuted" — approveRefund()
 * only flips RefundRequest to "approved" as an intermediate state and then immediately
 * calls executeRefund(), which is what actually writes the outbox row (see
 * refunds.service.ts). This handler subscribes to the real event name rather than one
 * that doesn't exist.
 */
@Injectable()
export class RefundExecutedHandler implements OutboxEventHandler {
  readonly eventType = "RefundExecuted";

  constructor(private readonly notifications: NotificationService) {}

  async handle(event: OutboxEventPayload): Promise<void> {
    const payload = event.payload as RefundExecutedPayload;

    await this.notifications.createFromEvent({
      userId: payload.userId,
      type: "refund.executed",
      title: "Refund approved",
      body: `Your refund of ${payload.amount.currency} ${payload.amount.amount} has been approved and credited to your wallet.`,
      referenceType: "RefundRequest",
      referenceId: payload.refundRequestId,
    });
  }
}
