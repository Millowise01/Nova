/**
 * Volume 4, Part E3's swappable LLM interface — the same adapter pattern already used
 * for payment providers (see payments-wallet/domain/psp/payment-provider.interface.ts):
 * "LLM inference sits behind an internal interface so the underlying provider can be
 * swapped later." Nothing in AiAssistantService depends on Anthropic, or on HTTP, or on
 * any provider-specific request/response shape — only on this interface.
 *
 * Deliberately a plain one-shot text completion, not a tool-use/function-calling
 * protocol: AiAssistantService decides what real data to fetch and feed in as context
 * (Volume 4, Part A2's "deterministic, explainable baseline" — Stage 0), the model never
 * decides what to look up on its own. That keeps the actual grounding and handoff
 * enforcement in this codebase's own tested code, not in a hope that the model calls the
 * right tool.
 */
export interface AiMessage {
  role: "system" | "user";
  content: string;
}

export interface AiCompletionResult {
  text: string;
}

export interface AiProviderAdapter {
  complete(input: { messages: AiMessage[]; maxTokens?: number }): Promise<AiCompletionResult>;
}
