import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import {
  PaymentsService,
  type ProcessPaymentInput,
  type ProcessPaymentResult,
} from "../domain/payments.service";

/** The ONLY way Orders may interact with Payments & Wallet — per backend/docs/01.
 *  One-directional: Orders calls this, this never calls back into Orders (backend/docs/09). */
@Injectable()
export class PaymentsWalletPublicService {
  constructor(private readonly payments: PaymentsService) {}

  async processPaymentForOrder(
    tx: Prisma.TransactionClient,
    input: ProcessPaymentInput,
  ): Promise<ProcessPaymentResult> {
    return this.payments.processPaymentForOrder(tx, input);
  }
}
