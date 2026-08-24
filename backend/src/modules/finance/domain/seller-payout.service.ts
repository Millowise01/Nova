import { Injectable } from "@nestjs/common";

import type { ProposeSellerPayoutInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

import { LedgerService } from "./ledger.service";

/** Vol 3, B4 / backend/docs/10 — proposed, not yet confirmed, same as the refund
 *  threshold it's copied from (payments-wallet/domain/refunds.service.ts). Reusing the
 *  refund figure means most real seller payouts (typically larger than a single order)
 *  require the second approver by default — the conservative direction to guess in. */
export const SELLER_PAYOUT_DUAL_AUTH_THRESHOLD = 500;

/** Mirrors RefundsService's propose/approve/reject/execute shape exactly — the same
 *  Vol 3, B4 dual-authorization pattern, applied to payouts instead of refunds. amount
 *  is proposer-supplied, not derived from any computed "seller's available balance" —
 *  see backend/docs/10's Scope Boundary note for why that calculation doesn't exist. */
@Injectable()
export class SellerPayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly audit: AuditLogger,
  ) {}

  async proposePayout(input: ProposeSellerPayoutInput, proposedBy: string, ctx: RequestContext) {
    const requiresApproval = Number(input.amount) > SELLER_PAYOUT_DUAL_AUTH_THRESHOLD;

    const payout = await this.prisma.sellerPayout.create({
      data: {
        sellerId: input.sellerId,
        amount: input.amount,
        currency: input.currency,
        reason: input.reason,
        status: requiresApproval ? "proposed" : "approved",
        proposedBy,
        approvedBy: requiresApproval ? null : proposedBy,
      },
    });

    await this.audit.record({
      actorId: proposedBy,
      action: "seller_payout.propose",
      targetType: "SellerPayout",
      targetId: payout.id,
      reason: input.reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    if (!requiresApproval) {
      return this.executePayout(payout.id, ctx);
    }
    return payout;
  }

  async approvePayout(payoutId: string, approverId: string, ctx: RequestContext) {
    const payout = await this.prisma.sellerPayout.findUnique({ where: { id: payoutId } });
    if (!payout) {
      throw new NotFoundError("SELLER_PAYOUT_NOT_FOUND", "No seller payout found for this ID.");
    }
    if (payout.status !== "proposed") {
      throw new BadRequestError(
        "SELLER_PAYOUT_NOT_PENDING_APPROVAL",
        `This payout is in status "${payout.status}", not awaiting approval.`,
      );
    }
    if (payout.proposedBy === approverId) {
      throw new ForbiddenError(
        "SELLER_PAYOUT_SELF_APPROVAL_FORBIDDEN",
        "A payout cannot be approved by the same actor who proposed it.",
      );
    }

    await this.prisma.sellerPayout.update({
      where: { id: payoutId },
      data: { status: "approved", approvedBy: approverId },
    });

    await this.audit.record({
      actorId: approverId,
      action: "seller_payout.approve",
      targetType: "SellerPayout",
      targetId: payoutId,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return this.executePayout(payoutId, ctx);
  }

  async rejectPayout(payoutId: string, rejectorId: string, reason: string, ctx: RequestContext) {
    const payout = await this.prisma.sellerPayout.findUnique({ where: { id: payoutId } });
    if (!payout) {
      throw new NotFoundError("SELLER_PAYOUT_NOT_FOUND", "No seller payout found for this ID.");
    }
    if (payout.status !== "proposed") {
      throw new BadRequestError(
        "SELLER_PAYOUT_NOT_PENDING_APPROVAL",
        `This payout is in status "${payout.status}", not awaiting approval.`,
      );
    }

    const updated = await this.prisma.sellerPayout.update({
      where: { id: payoutId },
      data: { status: "rejected", approvedBy: rejectorId, rejectionReason: reason },
    });

    await this.audit.record({
      actorId: rejectorId,
      action: "seller_payout.reject",
      targetType: "SellerPayout",
      targetId: payoutId,
      reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }

  private async executePayout(payoutId: string, ctx: RequestContext) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payout = await tx.sellerPayout.findUniqueOrThrow({ where: { id: payoutId } });

      // Dr seller_payable, Cr platform_cash — paying off what's owed with cash leaving
      // the platform, textbook double-entry regardless of this pass's simplified
      // (non-normal-balance-signed) getNetByAccountCode helper.
      await this.ledger.postDoubleEntry(tx, {
        debitAccountCode: "seller_payable",
        creditAccountCode: "platform_cash",
        amount: payout.amount.toFixed(2),
        currency: payout.currency,
        referenceType: "SellerPayout",
        referenceId: payout.id,
        description: `Seller payout ${payout.id}`,
      });

      return tx.sellerPayout.update({ where: { id: payoutId }, data: { status: "executed" } });
    });

    await this.audit.record({
      actorId: result.approvedBy ?? result.proposedBy,
      action: "seller_payout.execute",
      targetType: "SellerPayout",
      targetId: payoutId,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return result;
  }
}
