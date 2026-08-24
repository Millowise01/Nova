import { Injectable } from "@nestjs/common";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

import { WalletService } from "./wallet.service";

/** Vol 3, B4 / Vol 5, C2 — proposed, not yet confirmed (backend/docs/09). A single
 *  constant so raising or lowering it later is a one-line change, not a code change. */
export const REFUND_DUAL_AUTH_THRESHOLD = 500;

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly audit: AuditLogger,
  ) {}

  /** GET /v1/wallet/refunds — admin review queue (a gap found while building
   *  apps/admin, not part of the original Payments & Wallet scope — see
   *  backend/docs/10's disclosed-addition note). Unpaginated: a small, bounded admin
   *  queue, not the unbounded-list shape backend/docs/02 reserves cursor pagination for. */
  async listByStatus(status?: string) {
    return this.prisma.refundRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Vol 3, B4's dual authorization, made real for the first time in this codebase.
   * At or below the threshold: proposer's action executes immediately. Above it: a
   * `RefundRequest` is created in `proposed` status and nothing executes until a
   * SECOND, different actor approves (see `approveRefund` below) — neither step is
   * skippable.
   */
  async proposeRefund(
    paymentIntentId: string,
    amount: string,
    reason: string,
    proposedBy: string,
    ctx: RequestContext,
  ) {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { id: paymentIntentId } });
    if (!intent)
      throw new NotFoundError("PAYMENT_INTENT_NOT_FOUND", "No payment intent found for this ID.");
    if (intent.status !== "succeeded") {
      throw new BadRequestError(
        "REFUND_NOT_ELIGIBLE",
        `Cannot refund a payment intent in status "${intent.status}".`,
      );
    }

    const requiresApproval = Number(amount) > REFUND_DUAL_AUTH_THRESHOLD;

    const refundRequest = await this.prisma.refundRequest.create({
      data: {
        paymentIntentId,
        amount,
        currency: intent.currency,
        reason,
        status: requiresApproval ? "proposed" : "approved",
        proposedBy,
        approvedBy: requiresApproval ? null : proposedBy,
      },
    });

    await this.audit.record({
      actorId: proposedBy,
      action: "refund.propose",
      targetType: "RefundRequest",
      targetId: refundRequest.id,
      reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    if (!requiresApproval) {
      return this.executeRefund(refundRequest.id, ctx);
    }
    return refundRequest;
  }

  /** The second, different actor's approval — the step that can't be skipped and
   *  can't be performed by the proposer. */
  async approveRefund(refundRequestId: string, approverId: string, ctx: RequestContext) {
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
    });
    if (!refundRequest) {
      throw new NotFoundError("REFUND_REQUEST_NOT_FOUND", "No refund request found for this ID.");
    }
    if (refundRequest.status !== "proposed") {
      throw new BadRequestError(
        "REFUND_NOT_PENDING_APPROVAL",
        `This refund request is in status "${refundRequest.status}", not awaiting approval.`,
      );
    }
    if (refundRequest.proposedBy === approverId) {
      throw new ForbiddenError(
        "REFUND_SELF_APPROVAL_FORBIDDEN",
        "A refund cannot be approved by the same actor who proposed it.",
      );
    }

    await this.prisma.refundRequest.update({
      where: { id: refundRequestId },
      data: { status: "approved", approvedBy: approverId },
    });

    await this.audit.record({
      actorId: approverId,
      action: "refund.approve",
      targetType: "RefundRequest",
      targetId: refundRequestId,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return this.executeRefund(refundRequestId, ctx);
  }

  async rejectRefund(
    refundRequestId: string,
    rejectorId: string,
    reason: string,
    ctx: RequestContext,
  ) {
    const refundRequest = await this.prisma.refundRequest.findUnique({
      where: { id: refundRequestId },
    });
    if (!refundRequest) {
      throw new NotFoundError("REFUND_REQUEST_NOT_FOUND", "No refund request found for this ID.");
    }
    if (refundRequest.status !== "proposed") {
      throw new BadRequestError(
        "REFUND_NOT_PENDING_APPROVAL",
        `This refund request is in status "${refundRequest.status}", not awaiting approval.`,
      );
    }

    // Real gap found while wiring notifications (Batch B): this method previously
    // never wrote an outbox event at all — every OTHER terminal RefundRequest
    // transition does (RefundExecuted). Now wrapped in a transaction so the state
    // change and the event write are atomic, same as executeRefund below.
    const updated = await this.prisma.$transaction(async (tx) => {
      const intent = await tx.paymentIntent.findUniqueOrThrow({
        where: { id: refundRequest.paymentIntentId },
      });

      const result = await tx.refundRequest.update({
        where: { id: refundRequestId },
        data: { status: "rejected", approvedBy: rejectorId, rejectionReason: reason },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: "RefundRequest",
          aggregateId: refundRequestId,
          eventType: "RefundRejected",
          eventVersion: 1,
          payload: {
            refundRequestId,
            paymentIntentId: intent.id,
            userId: intent.userId,
            amount: { amount: refundRequest.amount.toFixed(2), currency: refundRequest.currency },
            reason,
          },
        },
      });

      return result;
    });

    await this.audit.record({
      actorId: rejectorId,
      action: "refund.reject",
      targetType: "RefundRequest",
      targetId: refundRequestId,
      reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }

  private async executeRefund(refundRequestId: string, ctx: RequestContext) {
    const result = await this.prisma.$transaction(async (tx) => {
      const refundRequest = await tx.refundRequest.findUniqueOrThrow({
        where: { id: refundRequestId },
      });
      const intent = await tx.paymentIntent.findUniqueOrThrow({
        where: { id: refundRequest.paymentIntentId },
      });

      // Vol 5, C2: refunds credit the customer's wallet. A guest order has no
      // persistent User to own a WalletAccount — refunding a guest purchase needs a
      // provider-side reversal or a cash path neither Vol 5 nor this pass specifies,
      // so this fails loudly rather than silently crediting nothing.
      if (!intent.userId) {
        throw new BadRequestError(
          "REFUND_REQUIRES_REGISTERED_USER",
          "This payment has no associated user account to credit a refund to.",
        );
      }

      const account = await this.wallet.getOrCreateAccount(
        tx,
        intent.userId,
        "customer",
        refundRequest.currency,
      );
      await this.wallet.credit(
        tx,
        account.id,
        refundRequest.amount.toFixed(2),
        refundRequest.currency,
        "refund_credit",
        {
          referenceType: "RefundRequest",
          referenceId: refundRequest.id,
        },
      );

      await tx.paymentIntent.update({ where: { id: intent.id }, data: { status: "refunded" } });
      const executed = await tx.refundRequest.update({
        where: { id: refundRequestId },
        data: { status: "executed" },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: "RefundRequest",
          aggregateId: refundRequestId,
          eventType: "RefundExecuted",
          eventVersion: 1,
          payload: {
            refundRequestId,
            paymentIntentId: intent.id,
            // userId added (Batch B) so Notification's handler has someone to notify —
            // additive-only per backend/docs/04's payload-versioning policy.
            userId: intent.userId,
            amount: { amount: refundRequest.amount.toFixed(2), currency: refundRequest.currency },
          },
        },
      });

      return executed;
    });

    await this.audit.record({
      actorId: result.approvedBy ?? result.proposedBy,
      action: "refund.execute",
      targetType: "RefundRequest",
      targetId: refundRequestId,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return result;
  }
}
