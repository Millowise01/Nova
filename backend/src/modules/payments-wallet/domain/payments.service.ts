import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import type { PaymentProviderAdapter } from "./psp/payment-provider.interface";
import { PAYMENT_PROVIDER_ADAPTER } from "./psp/payment-provider.token";
import { WalletService } from "./wallet.service";

export interface ProcessPaymentInput {
  orderId: string;
  userId: string | null;
  method: string; // matches @nova/validation's checkoutSchema.paymentMethod: "wallet" | "card" | "mobile-money"
  amount: string;
  currency: string;
}

export interface ProcessPaymentResult {
  succeeded: boolean;
  paymentIntentId: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly wallet: WalletService,
    @Inject(PAYMENT_PROVIDER_ADAPTER) private readonly adapter: PaymentProviderAdapter,
  ) {}

  /**
   * Called by Orders, WITHIN Orders' own order-creation transaction (`tx`) — see
   * backend/docs/09's Cross-module wiring section for why this is a one-directional
   * call with no callback into Orders. Creates the PaymentIntent, routes it to a
   * wallet debit or the PSP adapter depending on `method`, and returns a plain
   * boolean — Orders decides what to do with its own order status, this method never
   * touches the orders table.
   */
  async processPaymentForOrder(
    tx: Prisma.TransactionClient,
    input: ProcessPaymentInput,
  ): Promise<ProcessPaymentResult> {
    const intent = await tx.paymentIntent.create({
      data: {
        orderId: input.orderId,
        userId: input.userId,
        method: input.method,
        amount: input.amount,
        currency: input.currency,
        status: "processing",
      },
    });

    let succeeded: boolean;
    let providerReference: string | undefined;

    if (input.method === "wallet") {
      // A guest (no userId) has no wallet to debit — fails cleanly rather than throwing,
      // exactly like any other declined payment (Vol 5, B1's failed state).
      if (!input.userId) {
        succeeded = false;
      } else {
        const account = await this.wallet.getOrCreateAccount(
          tx,
          input.userId,
          "customer",
          input.currency,
        );
        try {
          await this.wallet.debit(tx, account.id, input.amount, input.currency, "checkout_debit", {
            referenceType: "Order",
            referenceId: input.orderId,
          });
          succeeded = true;
        } catch {
          // Insufficient balance is a normal declined-payment outcome, not a crash —
          // caught here so the order-creation transaction continues and Orders can
          // transition the order to cancelled, rather than the whole transaction
          // (order included) rolling back.
          succeeded = false;
        }
      }
    } else {
      const result = await this.adapter.initiate({
        amount: input.amount,
        currency: input.currency,
        method: input.method,
      });
      succeeded = result.status === "succeeded";
      providerReference = result.providerReference;
    }

    await tx.paymentIntent.update({
      where: { id: intent.id },
      data: { status: succeeded ? "succeeded" : "failed", providerReference },
    });

    // Same transaction as the Order/PaymentIntent above — Vol 2, D3/E3's outbox
    // guarantee, identical pattern to OrderPlaced.
    await tx.outboxEvent.create({
      data: {
        aggregateType: "PaymentIntent",
        aggregateId: intent.id,
        eventType: succeeded ? "PaymentSucceeded" : "PaymentFailed",
        eventVersion: 1,
        payload: {
          paymentIntentId: intent.id,
          orderId: input.orderId,
          amount: { amount: input.amount, currency: input.currency },
        },
      },
    });

    return { succeeded, paymentIntentId: intent.id };
  }
}
