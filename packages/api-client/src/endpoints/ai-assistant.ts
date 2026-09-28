import { aiAssistantResponseSchema, type AiAssistantResponse } from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

/** Customer-facing AI Shopping Assistant (Tier 2, ADR-0005). One call per message —
 *  this client is deliberately stateless; the caller (apps/web) keeps the conversation
 *  history for display, but each request only ever sends the latest message, matching
 *  the backend's own stateless, no-new-schema design (Volume 4, Part A2's Stage 0). */
export function createAiAssistantEndpoints(client: NovaHttpClient) {
  return {
    async sendMessage(message: string): Promise<AiAssistantResponse> {
      const response = await client.post<ApiEnvelope>("/ai/assistant/message", { message });
      return aiAssistantResponseSchema.parse(response.data.data);
    },
  };
}
