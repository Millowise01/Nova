import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import {
  proposeRefundSchema,
  rejectRefundSchema,
  type ProposeRefundInput,
  type RejectRefundInput,
} from "@nova/validation";

import { AuthenticatedRequest, JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import type { RequestWithCorrelationId } from "../../../common/middleware/correlation-id.middleware";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { PolicyGuard } from "../../../common/policy/policy.guard";
import { RequirePermission } from "../../../common/policy/require-permission.decorator";
import { RefundsService } from "../domain/refunds.service";
import { WalletService } from "../domain/wallet.service";

type WalletRequest = AuthenticatedRequest & RequestWithCorrelationId;

@ApiTags("payments-wallet")
@Controller()
export class WalletController {
  constructor(
    private readonly wallet: WalletService,
    private readonly refunds: RefundsService,
  ) {}

  @Get("wallet/balance")
  @UseGuards(JwtAuthGuard)
  async getBalance(@Req() req: AuthenticatedRequest) {
    const balance = await this.wallet.getBalance(req.user.sub, "SLE");
    return { data: { amount: balance, currency: "SLE" } };
  }

  // Refund propose/approve/reject are admin-only (backend/docs/09's proposed approver
  // role) — enforced through the central policy engine, never an inline role check.
  @Post("wallet/refunds")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("create", "RefundRequest")
  async proposeRefund(
    @Req() req: WalletRequest,
    @Body(new ZodValidationPipe(proposeRefundSchema)) body: ProposeRefundInput,
  ) {
    const result = await this.refunds.proposeRefund(
      body.paymentIntentId,
      body.amount,
      body.reason,
      req.user.sub,
      { ipAddress: req.ip, correlationId: req.correlationId },
    );
    return { data: result };
  }

  @Patch("wallet/refunds/:id/approve")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "RefundRequest")
  async approveRefund(@Req() req: WalletRequest, @Param("id") id: string) {
    const result = await this.refunds.approveRefund(id, req.user.sub, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }

  @Patch("wallet/refunds/:id/reject")
  @UseGuards(JwtAuthGuard, PolicyGuard)
  @RequirePermission("approve", "RefundRequest")
  async rejectRefund(
    @Req() req: WalletRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(rejectRefundSchema)) body: RejectRefundInput,
  ) {
    const result = await this.refunds.rejectRefund(id, req.user.sub, body.reason, {
      ipAddress: req.ip,
      correlationId: req.correlationId,
    });
    return { data: result };
  }
}
