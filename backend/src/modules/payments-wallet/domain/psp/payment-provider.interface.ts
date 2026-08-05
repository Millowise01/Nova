/**
 * Vol 5, Part A2's PaymentProvider adapter — "adding a new provider is a configuration
 * and adapter-implementation exercise, not a change to checkout, order, or ledger
 * logic." Every payment method that isn't the wallet routes through an implementation
 * of this interface; nothing else in this module (or Orders, which calls into this
 * module) knows or cares which concrete adapter is behind it.
 */
export interface InitiateResult {
  status: "pending" | "succeeded" | "failed";
  providerReference?: string;
}

export interface PaymentProviderAdapter {
  /** Vol 5, A2 "Initiate payment": translate a PaymentIntent into the provider call. */
  initiate(input: { amount: string; currency: string; method: string }): Promise<InitiateResult>;

  /** Vol 5, A2 "Refund": translate a refund into the provider's reversal API. */
  refund(input: {
    providerReference: string;
    amount: string;
    currency: string;
  }): Promise<{ succeeded: boolean }>;
}
