import { subject } from "@casl/ability";
import { Injectable } from "@nestjs/common";

import type { OpenDisputeInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { AbilityFactory } from "../../../common/policy/ability.factory";
import type { PolicyUser } from "../../../common/policy/policy.types";
import { PrismaService } from "../../../prisma/prisma.service";

/** Not dual-authorized — Vol 3, B4's list names refunds, payouts, role changes, and
 *  seller approval/suspension specifically; opening or updating a dispute isn't on
 *  that list (backend/docs/10). DisputeEvent is an append-only timeline, same shape as
 *  AuditLog/WalletLedgerEntry applied to a non-financial domain. */
@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogger,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  async open(input: OpenDisputeInput, openedBy: string, ctx: RequestContext) {
    if (!input.orderId && !input.reviewId) {
      throw new BadRequestError(
        "DISPUTE_TARGET_REQUIRED",
        "A dispute must reference either an orderId or a reviewId.",
      );
    }
    if (input.orderId && input.reviewId) {
      throw new BadRequestError(
        "DISPUTE_TARGET_AMBIGUOUS",
        "A dispute must reference exactly one of orderId or reviewId, not both.",
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: { orderId: input.orderId, reviewId: input.reviewId, openedBy, reason: input.reason },
    });

    await this.prisma.disputeEvent.create({
      data: { disputeId: dispute.id, actorId: openedBy, eventType: "opened", note: input.reason },
    });

    await this.audit.record({
      actorId: openedBy,
      action: "dispute.open",
      targetType: "Dispute",
      targetId: dispute.id,
      reason: input.reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return dispute;
  }

  private async getDispute(id: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundError("DISPUTE_NOT_FOUND", "No dispute found for this ID.");
    return dispute;
  }

  /** ABAC via the central policy engine — the opener or an admin may read/comment,
   *  same pattern as OrdersService.getOrder/DeliveryJobService.getJobForRequester. */
  async getForRequester(id: string, requester: PolicyUser) {
    const dispute = await this.getDispute(id);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("read", subject("Dispute", dispute))) {
      throw new ForbiddenError("DISPUTE_ACCESS_DENIED", "You do not have access to this dispute.");
    }
    return {
      ...dispute,
      events: await this.prisma.disputeEvent.findMany({
        where: { disputeId: id },
        orderBy: { createdAt: "asc" },
      }),
    };
  }

  async addComment(id: string, note: string, requester: PolicyUser, ctx: RequestContext) {
    const dispute = await this.getDispute(id);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("update", subject("Dispute", dispute))) {
      throw new ForbiddenError("DISPUTE_ACCESS_DENIED", "You do not have access to this dispute.");
    }
    if (dispute.status !== "open") {
      throw new BadRequestError(
        "DISPUTE_NOT_OPEN",
        `Cannot comment on a ${dispute.status} dispute.`,
      );
    }

    const event = await this.prisma.disputeEvent.create({
      data: { disputeId: id, actorId: requester.id, eventType: "comment", note },
    });

    await this.audit.record({
      actorId: requester.id,
      action: "dispute.comment",
      targetType: "Dispute",
      targetId: id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return event;
  }

  /** Admin-only, enforced here via CASL's "manage" action — no other rule ever grants
   *  "manage" on anything (only admin's unconditional manage-all), so this is a real
   *  ABAC-shaped admin check, not a role-string comparison. */
  async resolve(id: string, resolution: string, requester: PolicyUser, ctx: RequestContext) {
    const dispute = await this.getDispute(id);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("manage", subject("Dispute", dispute))) {
      throw new ForbiddenError(
        "DISPUTE_ACCESS_DENIED",
        "You do not have access to resolve this dispute.",
      );
    }
    if (dispute.status !== "open") {
      throw new BadRequestError("DISPUTE_NOT_OPEN", `Cannot resolve a ${dispute.status} dispute.`);
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: { status: "resolved", resolution },
    });

    await this.prisma.disputeEvent.create({
      data: { disputeId: id, actorId: requester.id, eventType: "resolved", note: resolution },
    });

    await this.audit.record({
      actorId: requester.id,
      action: "dispute.resolve",
      targetType: "Dispute",
      targetId: id,
      reason: resolution,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }
}
