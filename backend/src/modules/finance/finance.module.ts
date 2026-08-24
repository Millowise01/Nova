import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity";

import { LedgerService } from "./domain/ledger.service";
import { SellerPayoutService } from "./domain/seller-payout.service";
import { FinanceController } from "./http/finance.controller";

@Module({
  imports: [IdentityModule], // JwtAuthGuard
  controllers: [FinanceController],
  providers: [LedgerService, SellerPayoutService],
})
export class FinanceModule {}
