/** DI token for PaymentProviderAdapter — interfaces don't exist at runtime, so NestJS
 *  needs a token to inject one. Swapping the stub for a real adapter later is a
 *  one-line change to this token's provider in payments-wallet.module.ts, matching
 *  Vol 5, A2's "configuration and adapter-implementation exercise" requirement. */
export const PAYMENT_PROVIDER_ADAPTER = Symbol("PAYMENT_PROVIDER_ADAPTER");
