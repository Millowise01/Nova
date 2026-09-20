import { Injectable } from "@nestjs/common";

import type { ProposeKycDecisionInput, SubmitKycInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";

/** Vol 3, B4's "seller approval" made real (backend/docs/10). documentReference is a
 *  plain string — no OCR/third-party verification, same stub posture as OTP/PSP. Dual-
 *  authorized with NO threshold exception (unlike refunds/payouts) — every decision
 *  needs a second, different admin. */
@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogger,
  ) {}

  /** GET /v1/trust-safety/kyc — admin review queue (a gap found while building
   *  apps/admin — see backend/docs/10's disclosed-addition note). Unpaginated, same
   *  reasoning as RefundsService.listByStatus. */
  async listByStatus(status?: string) {
    return this.prisma.kYCSubmission.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "asc" },
    });
  }

  /** A KYC submission is always FOR the authenticated caller — never for whoever the
   *  request body names. subjectId is client input and must not be trusted as an
   *  ownership claim: without this check any authenticated user could file (and so
   *  attribute a document to) another seller's or rider's identity. Admins are held to
   *  the same rule — they review submissions, they don't file them for others. */
  async submit(input: SubmitKycInput, submittedBy: string, ctx: RequestContext) {
    if (input.subjectId !== submittedBy) {
      throw new ForbiddenError(
        "KYC_SUBJECT_MUST_BE_CALLER",
        "A KYC submission can only be filed for your own account.",
      );
    }

    const submission = await this.prisma.kYCSubmission.create({
      data: {
        subjectId: input.subjectId,
        subjectType: input.subjectType,
        documentReference: input.documentReference,
      },
    });

    await this.audit.record({
      actorId: submittedBy,
      action: "kyc.submit",
      targetType: "KYCSubmission",
      targetId: submission.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return submission;
  }

  async getSubmission(id: string) {
    const submission = await this.prisma.kYCSubmission.findUnique({ where: { id } });
    if (!submission) {
      throw new NotFoundError("KYC_SUBMISSION_NOT_FOUND", "No KYC submission found for this ID.");
    }
    return submission;
  }

  /** The first, proposing actor's decision — recorded but NOT applied. Nothing about
   *  the submission's status changes until a second, different actor confirms. */
  async proposeDecision(
    id: string,
    input: ProposeKycDecisionInput,
    proposedBy: string,
    ctx: RequestContext,
  ) {
    const submission = await this.getSubmission(id);
    if (submission.status !== "pending") {
      throw new BadRequestError(
        "KYC_NOT_PENDING",
        `This KYC submission is in status "${submission.status}", not pending review.`,
      );
    }

    const updated = await this.prisma.kYCSubmission.update({
      where: { id },
      data: { reviewProposedBy: proposedBy, proposedDecision: input.decision },
    });

    await this.audit.record({
      actorId: proposedBy,
      action: "kyc.propose_decision",
      targetType: "KYCSubmission",
      targetId: id,
      reason: input.reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }

  /** The second, different actor's confirmation — this is what actually applies the
   *  decision. Neither step is skippable, mirroring RefundRequest/SellerPayout exactly. */
  async confirmDecision(id: string, confirmerId: string, ctx: RequestContext) {
    const submission = await this.getSubmission(id);
    if (submission.status !== "pending") {
      throw new BadRequestError(
        "KYC_NOT_PENDING",
        `This KYC submission is in status "${submission.status}", not pending review.`,
      );
    }
    if (!submission.reviewProposedBy || !submission.proposedDecision) {
      throw new BadRequestError(
        "KYC_NO_PROPOSED_DECISION",
        "No decision has been proposed for this submission yet.",
      );
    }
    if (submission.reviewProposedBy === confirmerId) {
      throw new ForbiddenError(
        "KYC_SELF_CONFIRMATION_FORBIDDEN",
        "A KYC decision cannot be confirmed by the same actor who proposed it.",
      );
    }

    const finalStatus = submission.proposedDecision === "approve" ? "approved" : "rejected";
    const updated = await this.prisma.kYCSubmission.update({
      where: { id },
      data: { status: finalStatus, reviewConfirmedBy: confirmerId },
    });

    await this.audit.record({
      actorId: confirmerId,
      action: "kyc.confirm_decision",
      targetType: "KYCSubmission",
      targetId: id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }
}
