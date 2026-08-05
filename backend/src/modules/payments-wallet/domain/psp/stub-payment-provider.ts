import { Injectable, Logger } from "@nestjs/common";

import type { InitiateResult, PaymentProviderAdapter } from "./payment-provider.interface";

/**
 * Stub PSP adapter — confirmed decision for this pass (matches Identity's OTP stub
 * pattern exactly). Resolves synchronously and always succeeds; no real Orange Money,
 * Afrimoney, or card-PSP call is ever made. This is the ONE seam a real adapter plugs
 * into later — every caller in this codebase only ever depends on
 * PaymentProviderAdapter, never this class directly.
 */
@Injectable()
export class StubPaymentProvider implements PaymentProviderAdapter {
  private readonly logger = new Logger(StubPaymentProvider.name);

  // TODO: wire real PSP integration here (Volume 5, Part A — Orange Money, Afrimoney,
  // and a card PSP, each as their own PaymentProviderAdapter implementation, selected
  // by `method`). This stub always synchronously succeeds so backend/docs/09's
  // documented gap (no real webhook/polling confirmation path) stays visible rather
  // than silently "working" in a way that hides what's actually missing.
  initiate(input: { amount: string; currency: string; method: string }): Promise<InitiateResult> {
    this.logger.debug(
      `[PSP STUB] initiate ${input.method} for ${input.amount} ${input.currency} — auto-succeeding`,
    );
    return Promise.resolve({ status: "succeeded", providerReference: `stub_${Date.now()}` });
  }

  refund(input: {
    providerReference: string;
    amount: string;
    currency: string;
  }): Promise<{ succeeded: boolean }> {
    this.logger.debug(
      `[PSP STUB] refund ${input.amount} ${input.currency} for ${input.providerReference} — auto-succeeding`,
    );
    return Promise.resolve({ succeeded: true });
  }
}
