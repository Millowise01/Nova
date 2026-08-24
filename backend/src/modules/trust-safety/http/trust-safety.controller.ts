import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  addDisputeEventSchema,
  listDisputesQuerySchema,
  listKycQuerySchema,
  listSuspensionRequestsQuerySchema,
  openDisputeSchema,
  proposeKycDecisionSchema,
  resolveDisputeSchema,
  submitKycSchema,
  suspendSellerSchema,
  type AddDisputeEventInput,
  type ListDisputesQuery,
  type ListKycQuery,
  type ListSuspensionRequestsQuery,
  type OpenDisputeInput,
  type ProposeKycDecisionInput,
  type ResolveDisputeInput,
  type SubmitKycInput,
  type SuspendSellerInput,
} from "@nova/validation";

import { AuthenticatedRequest, JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { PolicyGuard } from "../../../common/policy/policy.guard";
import { RequirePermission } from "../../../common/policy/require-permission.decorator";
import { DisputeService } from "../domain/dispute.service";
import { KycService } from "../domain/kyc.service";
import { SellerSuspensionService } from "../domain/seller-suspension.service";

type TSRequest = AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags("trust-safety")
@Controller("trust-safety")
export class TrustSafetyController {
  constructor(
    private readonly kyc: KycService,
    private readonly suspension: SellerSuspensionService,
    private readonly disputes: DisputeService,
  ) {}

  // --- KYC (Vol 3, B4 "seller approval") ---

  // Admin review queue (backend/docs/10's disclosed addition) — same admin-only
  // posture as propose/confirm-decision below.
  @Get("kyc")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("read", "KYCSubmission")
  async listKyc(@Query(new ZodValidationPipe(listKycQuerySchema)) query: ListKycQuery) {
    const submissions = await this.kyc.listByStatus(query.status);
    return { data: submissions };
  }

  @Post("kyc")
  @UseGuards(JwtAuthGuard)
  async submitKyc(
    @Req() req: TSRequest,
    @Body(new ZodValidationPipe(submitKycSchema)) body: SubmitKycInput,
  ) {
    const submission = await this.kyc.submit(body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: submission };
  }

  @Patch("kyc/:id/propose-decision")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("update", "KYCSubmission")
  @HttpCode(HttpStatus.OK)
  async proposeKycDecision(
    @Req() req: TSRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(proposeKycDecisionSchema)) body: ProposeKycDecisionInput,
  ) {
    const result = await this.kyc.proposeDecision(id, body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Patch("kyc/:id/confirm-decision")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "KYCSubmission")
  @HttpCode(HttpStatus.OK)
  async confirmKycDecision(@Req() req: TSRequest, @Param("id") id: string) {
    const result = await this.kyc.confirmDecision(id, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  // --- Seller suspension (Vol 3, B4's other named half) ---

  // Admin review queue (backend/docs/10's disclosed addition) — same admin-only
  // posture as suspend/reinstate/confirm/reject below.
  @Get("suspension-requests")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("read", "SellerSuspensionRequest")
  async listSuspensionRequests(
    @Query(new ZodValidationPipe(listSuspensionRequestsQuerySchema))
    query: ListSuspensionRequestsQuery,
  ) {
    const requests = await this.suspension.listByStatus(query.status);
    return { data: requests };
  }

  @Post("sellers/:sellerId/suspend")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "SellerSuspensionRequest")
  async proposeSuspend(
    @Req() req: TSRequest,
    @Param("sellerId") sellerId: string,
    @Body(new ZodValidationPipe(suspendSellerSchema)) body: SuspendSellerInput,
  ) {
    const result = await this.suspension.propose(sellerId, "suspend", body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Post("sellers/:sellerId/reinstate")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "SellerSuspensionRequest")
  async proposeReinstate(
    @Req() req: TSRequest,
    @Param("sellerId") sellerId: string,
    @Body(new ZodValidationPipe(suspendSellerSchema)) body: SuspendSellerInput,
  ) {
    const result = await this.suspension.propose(sellerId, "reinstate", body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Patch("suspension-requests/:id/confirm")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "SellerSuspensionRequest")
  @HttpCode(HttpStatus.OK)
  async confirmSuspension(@Req() req: TSRequest, @Param("id") id: string) {
    const result = await this.suspension.confirm(id, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Patch("suspension-requests/:id/reject")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "SellerSuspensionRequest")
  @HttpCode(HttpStatus.OK)
  async rejectSuspension(
    @Req() req: TSRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suspendSellerSchema)) body: SuspendSellerInput,
  ) {
    const result = await this.suspension.reject(id, req.user.sub, body.reason, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  // --- Disputes (not dual-authorized — see dispute.service.ts) ---

  // Admin-only "all disputes" queue (backend/docs/10's disclosed addition) — gated by
  // "manage" (only admin's unconditional manage-all satisfies it), NOT "read", since
  // every authenticated user already has a conditioned "read" rule on their OWN
  // disputes (ability.factory.ts) that a coarse RequirePermission("read", ...) check
  // can't distinguish from "read every dispute." Same technique DisputeService.resolve
  // already uses.
  @Get("disputes")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("manage", "Dispute")
  async listDisputes(
    @Query(new ZodValidationPipe(listDisputesQuerySchema)) query: ListDisputesQuery,
  ) {
    const disputes = await this.disputes.listByStatus(query.status);
    return { data: disputes };
  }

  @Post("disputes")
  @UseGuards(JwtAuthGuard)
  async openDispute(
    @Req() req: TSRequest,
    @Body(new ZodValidationPipe(openDisputeSchema)) body: OpenDisputeInput,
  ) {
    const dispute = await this.disputes.open(body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: dispute };
  }

  @Get("disputes/:id")
  @UseGuards(JwtAuthGuard)
  async getDispute(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const dispute = await this.disputes.getForRequester(id, {
      id: req.user.sub,
      roles: req.user.roles,
    });
    return { data: dispute };
  }

  @Post("disputes/:id/comments")
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Req() req: TSRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(addDisputeEventSchema)) body: AddDisputeEventInput,
  ) {
    const event = await this.disputes.addComment(
      id,
      body.note,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: event };
  }

  @Patch("disputes/:id/resolve")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resolveDispute(
    @Req() req: TSRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resolveDisputeSchema)) body: ResolveDisputeInput,
  ) {
    const dispute = await this.disputes.resolve(
      id,
      body.resolution,
      { id: req.user.sub, roles: req.user.roles },
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: dispute };
  }
}
