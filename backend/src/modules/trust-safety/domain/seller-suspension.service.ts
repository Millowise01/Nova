import { Injectable } from "@nestjs/common";

import type { SuspendSellerInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../common/errors/api-error";
import { PrismaService } from "../../../prisma/prisma.service";
import { IdentityPublicService } from "../../identity";

type SuspensionAction = "suspend" | "reinstate";

/** The other half of Vol 3, B4's "seller approval/suspension" — same dual-auth shape
 *  as KycService, no threshold exception. The actual User.sellerSuspended write goes
 *  through IdentityPublicService, never a direct cross-module table write. */
@Injectable()
export class SellerSuspensionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: IdentityPublicService,
    private readonly audit: AuditLogger,
  ) {}

  async propose(
    sellerId: string,
    action: SuspensionAction,
    input: SuspendSellerInput,
    proposedBy: string,
    ctx: RequestContext,
  ) {
    const request = await this.prisma.sellerSuspensionRequest.create({
      data: { sellerId, action, reason: input.reason, proposedBy },
    });

    await this.audit.record({
      actorId: proposedBy,
      action: `seller_suspension.propose_${action}`,
      targetType: "SellerSuspensionRequest",
      targetId: request.id,
      reason: input.reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return request;
  }

  async confirm(id: string, confirmerId: string, ctx: RequestContext) {
    const request = await this.prisma.sellerSuspensionRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundError(
        "SELLER_SUSPENSION_REQUEST_NOT_FOUND",
        "No seller suspension request found for this ID.",
      );
    }
    if (request.status !== "proposed") {
      throw new BadRequestError(
        "SELLER_SUSPENSION_NOT_PENDING",
        `This request is in status "${request.status}", not awaiting confirmation.`,
      );
    }
    if (request.proposedBy === confirmerId) {
      throw new ForbiddenError(
        "SELLER_SUSPENSION_SELF_APPROVAL_FORBIDDEN",
        "A suspension request cannot be confirmed by the same actor who proposed it.",
      );
    }

    await this.identity.setSellerSuspended(request.sellerId, request.action === "suspend");

    const updated = await this.prisma.sellerSuspensionRequest.update({
      where: { id },
      data: { status: "executed", approvedBy: confirmerId },
    });

    await this.audit.record({
      actorId: confirmerId,
      action: "seller_suspension.confirm",
      targetType: "SellerSuspensionRequest",
      targetId: id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }

  async reject(id: string, rejectorId: string, reason: string, ctx: RequestContext) {
    const request = await this.prisma.sellerSuspensionRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundError(
        "SELLER_SUSPENSION_REQUEST_NOT_FOUND",
        "No seller suspension request found for this ID.",
      );
    }
    if (request.status !== "proposed") {
      throw new BadRequestError(
        "SELLER_SUSPENSION_NOT_PENDING",
        `This request is in status "${request.status}", not awaiting confirmation.`,
      );
    }

    const updated = await this.prisma.sellerSuspensionRequest.update({
      where: { id },
      data: { status: "rejected", approvedBy: rejectorId, rejectionReason: reason },
    });

    await this.audit.record({
      actorId: rejectorId,
      action: "seller_suspension.reject",
      targetType: "SellerSuspensionRequest",
      targetId: id,
      reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }
}
