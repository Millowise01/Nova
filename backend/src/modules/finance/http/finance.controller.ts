import {
  Body,
  Controller,
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
  proposeSellerPayoutSchema,
  rejectSellerPayoutSchema,
  type ProposeSellerPayoutInput,
  type RejectSellerPayoutInput,
} from "@nova/validation";

import { AuthenticatedRequest, JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { PolicyGuard } from "../../../common/policy/policy.guard";
import { RequirePermission } from "../../../common/policy/require-permission.decorator";
import { SellerPayoutService } from "../domain/seller-payout.service";

type FinanceRequest = AuthenticatedRequest & RequestWithCorrelationId;

// Payout propose/approve/reject are admin-only — same posture as refunds
// (WalletController), same reason: no dedicated Finance role exists yet.
@ApiTags("finance")
@Controller("finance")
export class FinanceController {
  constructor(private readonly payouts: SellerPayoutService) {}

  @Post("payouts")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "SellerPayout")
  async proposePayout(
    @Req() req: FinanceRequest,
    @Body(new ZodValidationPipe(proposeSellerPayoutSchema)) body: ProposeSellerPayoutInput,
  ) {
    const result = await this.payouts.proposePayout(body, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Patch("payouts/:id/approve")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "SellerPayout")
  @HttpCode(HttpStatus.OK)
  async approvePayout(@Req() req: FinanceRequest, @Param("id") id: string) {
    const result = await this.payouts.approvePayout(id, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Patch("payouts/:id/reject")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "SellerPayout")
  @HttpCode(HttpStatus.OK)
  async rejectPayout(
    @Req() req: FinanceRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(rejectSellerPayoutSchema)) body: RejectSellerPayoutInput,
  ) {
    const result = await this.payouts.rejectPayout(id, req.user.sub, body.reason, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }
}
