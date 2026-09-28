/** DI token for AiProviderAdapter — same technique as PAYMENT_PROVIDER_ADAPTER
 *  (payments-wallet/domain/psp/payment-provider.token.ts). Swapping Claude for another
 *  provider later (Volume 4, Part E3) is a one-line change to this token's binding in
 *  ai-assistant.module.ts. */
export const AI_PROVIDER_ADAPTER = Symbol("AI_PROVIDER_ADAPTER");
