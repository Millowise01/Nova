import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  assignDeliveryJobSchema,
  createDeliveryZoneSchema,
  deliverJobSchema,
  failDeliveryJobSchema,
  type AssignDeliveryJobInput,
  type CreateDeliveryZoneInput,
  type DeliverJobInput,
  type FailDeliveryJobInput,
} from "@nova/validation";

import { AuthenticatedRequest, JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { PolicyGuard } from "../../../common/policy/policy.guard";
import { RequirePermission } from "../../../common/policy/require-permission.decorator";
import { DeliveryJobService } from "../domain/delivery-job.service";
import { DeliveryZoneService } from "../domain/delivery-zone.service";

type LogisticsRequest = AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags("logistics")
@Controller("logistics")
export class LogisticsController {
  constructor(
    private readonly zones: DeliveryZoneService,
    private readonly jobs: DeliveryJobService,
  ) {}

  // Admin-managed, starts empty (backend/docs/10) — same admin-only posture as
  // Catalog's category/brand taxonomy endpoints.
  @Post("delivery-zones")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "DeliveryZone")
  async createZone(
    @Body(new ZodValidationPipe(createDeliveryZoneSchema)) body: CreateDeliveryZoneInput,
  ) {
    const zone = await this.zones.createZone(body);
    return { data: zone };
  }

  @Get("delivery-zones")
  async listZones() {
    const zones = await this.zones.listZones();
    return { data: zones };
  }

  // Explicit admin assignment — no dispatch/routing algorithm (backend/docs/10).
  @Post("delivery-jobs")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "DeliveryJob")
  async assignJob(
    @Req() req: LogisticsRequest,
    @Body(new ZodValidationPipe(assignDeliveryJobSchema)) body: AssignDeliveryJobInput,
  ) {
    const job = await this.jobs.assign(body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: job };
  }

  // "My jobs" — inherently self-scoped, same reasoning as OrdersController.listOrders
  // (no RequirePermission/PolicyGuard needed; there's no "whose jobs" ambiguity).
  @Get("delivery-jobs")
  @UseGuards(JwtAuthGuard)
  async listMyJobs(@Req() req: AuthenticatedRequest) {
    const jobs = await this.jobs.listForRider(req.user.sub);
    return { data: jobs };
  }

  @Get("delivery-jobs/:id")
  @UseGuards(JwtAuthGuard)
  async getJob(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const job = await this.jobs.getJobForRequester(id, { id: req.user.sub, roles: req.user.roles });
    return { data: job };
  }

  @Patch("delivery-jobs/:id/pickup")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markPickedUp(@Req() req: LogisticsRequest, @Param("id") id: string) {
    const job = await this.jobs.markPickedUp(
      id,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: job };
  }

  @Patch("delivery-jobs/:id/in-transit")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markInTransit(@Req() req: LogisticsRequest, @Param("id") id: string) {
    const job = await this.jobs.markInTransit(
      id,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: job };
  }

  @Patch("delivery-jobs/:id/deliver")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markDelivered(
    @Req() req: LogisticsRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(deliverJobSchema)) body: DeliverJobInput,
  ) {
    const proof = await this.jobs.markDelivered(
      id,
      body,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: proof };
  }

  @Patch("delivery-jobs/:id/fail")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markFailed(
    @Req() req: LogisticsRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(failDeliveryJobSchema)) body: FailDeliveryJobInput,
  ) {
    const job = await this.jobs.markFailed(
      id,
      body.reason,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: job };
  }
}
