import { Module } from "@nestjs/common";

import { IdentityModule } from "../identity";

import { PaymentsService } from "./domain/payments.service";
import { PAYMENT_PROVIDER_ADAPTER } from "./domain/psp/payment-provider.token";
import { StubPaymentProvider } from "./domain/psp/stub-payment-provider";
import { RefundsService } from "./domain/refunds.service";
import { WalletService } from "./domain/wallet.service";
import { WalletController } from "./http/wallet.controller";
import { PaymentsWalletPublicService } from "./public/payments-wallet.public-service";

@Module({
  imports: [IdentityModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    PaymentsService,
    RefundsService,
    PaymentsWalletPublicService,
    // The ONE line that changes when a real PSP adapter replaces the stub (Vol 5, A2).
    { provide: PAYMENT_PROVIDER_ADAPTER, useClass: StubPaymentProvider },
  ],
  exports: [PaymentsWalletPublicService],
})
export class PaymentsWalletModule {}
