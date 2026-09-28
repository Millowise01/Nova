import { getApiClient } from "./api";

/** Customer-facing AI Shopping Assistant (Tier 2, ADR-0005). */
export function sendAssistantMessage(message: string) {
  return getApiClient().aiAssistant.sendMessage(message);
}
