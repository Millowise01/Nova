import { subject } from "@casl/ability";
import { Injectable } from "@nestjs/common";

import type { AssignDeliveryJobInput, DeliverJobInput } from "@nova/validation";

import { AuditLogger, type RequestContext } from "../../../common/audit/audit-logger.service";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../common/errors/api-error";
import { AbilityFactory } from "../../../common/policy/ability.factory";
import type { PolicyUser } from "../../../common/policy/policy.types";
import { PrismaService } from "../../../prisma/prisma.service";

// backend/docs/10: assigned -> picked_up -> in_transit -> delivered/failed. Enforced at
// the application layer, same convention as Orders' own state machine
// (order-state-machine.ts) — never a free-text status column trusted blindly.
const LEGAL_TRANSITIONS: Record<string, string[]> = {
  assigned: ["picked_up", "failed"],
  picked_up: ["in_transit", "failed"],
  in_transit: ["delivered", "failed"],
  delivered: [],
  failed: [],
};

@Injectable()
export class DeliveryJobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogger,
    private readonly abilityFactory: AbilityFactory,
  ) {}

  /** Explicit admin/seller action (backend/docs/10) — no automatic dispatch/routing
   *  algorithm exists to pick a rider, so this is never triggered by OrderPlaced alone.
   *
   *  subOrderId is NOT validated against Orders here, unlike most cross-module opaque
   *  references in this codebase — a real, disclosed limitation, not an oversight.
   *  Orders already depends on Cart & Checkout, and Cart & Checkout needs to depend on
   *  Logistics (for the real shipping-fee lookup — see cart-checkout.module.ts); if
   *  Logistics also imported OrdersModule to validate subOrderId synchronously, that
   *  would close a cycle (Cart & Checkout -> Logistics -> Orders -> Cart & Checkout).
   *  Keeping Logistics dependency-free (a "leaf" module, same tier as Catalog and
   *  Payments & Wallet) was judged more important than this one validation — an admin
   *  supplying a wrong subOrderId gets a working-but-orphaned DeliveryJob (findable by
   *  ID, just not reachable from any real order) rather than a clean 404 at creation
   *  time. Fixing this for real needs an async, non-cyclic mechanism (e.g. Logistics
   *  subscribing to OrderPlaced to learn which subOrderIds are real) — future work. */
  async assign(input: AssignDeliveryJobInput, assignedBy: string, ctx: RequestContext) {
    const existing = await this.prisma.deliveryJob.findUnique({
      where: { subOrderId: input.subOrderId },
    });
    if (existing) {
      throw new ConflictError(
        "DELIVERY_JOB_ALREADY_EXISTS",
        "A delivery job already exists for this sub-order.",
      );
    }

    const job = await this.prisma.deliveryJob.create({
      data: { subOrderId: input.subOrderId, riderId: input.riderId },
    });

    await this.audit.record({
      actorId: assignedBy,
      action: "delivery_job.assign",
      targetType: "DeliveryJob",
      targetId: job.id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return job;
  }

  async getJob(id: string) {
    const job = await this.prisma.deliveryJob.findFirst({ where: { id, deletedAt: null } });
    if (!job)
      throw new NotFoundError("DELIVERY_JOB_NOT_FOUND", "No delivery job found for this ID.");
    return job;
  }

  /** ABAC via the central policy engine (Vol 3, B3) — only the assigned rider or an
   *  admin (manage-all) may read or transition a given job, matching OrdersService's
   *  getOrder/cancelOrder pattern exactly. */
  async getJobForRequester(id: string, requester: PolicyUser) {
    const job = await this.getJob(id);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("read", subject("DeliveryJob", job))) {
      throw new ForbiddenError(
        "DELIVERY_JOB_ACCESS_DENIED",
        "You do not have access to this delivery job.",
      );
    }
    return job;
  }

  async listForRider(riderId: string) {
    return this.prisma.deliveryJob.findMany({
      where: { riderId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  private async transition(
    id: string,
    to: string,
    requester: PolicyUser,
    ctx: RequestContext,
    reason?: string,
  ) {
    const job = await this.getJob(id);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("update", subject("DeliveryJob", job))) {
      throw new ForbiddenError(
        "DELIVERY_JOB_ACCESS_DENIED",
        "You do not have access to this delivery job.",
      );
    }

    const legal = LEGAL_TRANSITIONS[job.status] ?? [];
    if (!legal.includes(to)) {
      throw new BadRequestError(
        "ILLEGAL_DELIVERY_JOB_TRANSITION",
        `Cannot transition a delivery job from "${job.status}" to "${to}".`,
      );
    }

    const updated = await this.prisma.deliveryJob.update({ where: { id }, data: { status: to } });

    await this.audit.record({
      actorId: requester.id,
      action: `delivery_job.${to}`,
      targetType: "DeliveryJob",
      targetId: id,
      reason,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return updated;
  }

  markPickedUp(id: string, requester: PolicyUser, ctx: RequestContext) {
    return this.transition(id, "picked_up", requester, ctx);
  }

  markInTransit(id: string, requester: PolicyUser, ctx: RequestContext) {
    return this.transition(id, "in_transit", requester, ctx);
  }

  async markDelivered(
    id: string,
    input: DeliverJobInput,
    requester: PolicyUser,
    ctx: RequestContext,
  ) {
    const job = await this.getJob(id);
    const ability = this.abilityFactory.buildFor(requester);
    if (!ability.can("update", subject("DeliveryJob", job))) {
      throw new ForbiddenError(
        "DELIVERY_JOB_ACCESS_DENIED",
        "You do not have access to this delivery job.",
      );
    }
    if (job.status !== "in_transit") {
      throw new BadRequestError(
        "ILLEGAL_DELIVERY_JOB_TRANSITION",
        `Cannot transition a delivery job from "${job.status}" to "delivered".`,
      );
    }

    const [, proof] = await this.prisma.$transaction([
      this.prisma.deliveryJob.update({ where: { id }, data: { status: "delivered" } }),
      this.prisma.proofOfDelivery.create({
        data: { deliveryJobId: id, recipientName: input.recipientName, note: input.note },
      }),
    ]);

    await this.audit.record({
      actorId: requester.id,
      action: "delivery_job.delivered",
      targetType: "DeliveryJob",
      targetId: id,
      ipAddress: ctx.ipAddress,
      correlationId: ctx.correlationId,
    });

    return proof;
  }

  markFailed(id: string, reason: string, requester: PolicyUser, ctx: RequestContext) {
    return this.transition(id, "failed", requester, ctx, reason);
  }
}
