import { Injectable, Logger } from "@nestjs/common";

import { AppConfigService } from "../../../../config/config.service";

import type { AiCompletionResult, AiMessage, AiProviderAdapter } from "./ai-provider.interface";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 1024;

/** Thrown when the provider cannot be used at all (no API key configured, or the
 *  provider's API rejected the request/failed). AiAssistantService treats this as an
 *  automatic handoff — Volume 4, Part B1's hard handoff rule applied to "the assistant
 *  itself is unavailable," not just "the assistant doesn't know the answer." */
export class AiProviderUnavailableError extends Error {}

/**
 * Real Claude API adapter (ADR-0005) — chosen by the repository owner, the same
 * confirm-before-integrating discipline as the Sentry (O-2) and staging-platform (O-4)
 * decisions. Uses the Anthropic Messages API directly over `fetch` (already available in
 * this backend's Node runtime) rather than adding the `@anthropic-ai/sdk` dependency:
 * one plain JSON REST call doesn't need the SDK's streaming/retry conveniences, and Nova's
 * dependency rules ask to check whether an existing capability already covers this before
 * installing anything — `fetch` already does.
 */
@Injectable()
export class ClaudeProvider implements AiProviderAdapter {
  private readonly logger = new Logger(ClaudeProvider.name);

  constructor(private readonly config: AppConfigService) {}

  async complete(input: {
    messages: AiMessage[];
    maxTokens?: number;
  }): Promise<AiCompletionResult> {
    const apiKey = this.config.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new AiProviderUnavailableError("ANTHROPIC_API_KEY is not configured.");
    }

    const system = input.messages.find((message) => message.role === "system")?.content;
    const userMessages = input.messages
      .filter((message) => message.role === "user")
      .map((message) => ({ role: "user" as const, content: message.content }));

    let response: Response;
    try {
      response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_API_VERSION,
        },
        body: JSON.stringify({
          model: this.config.get("ANTHROPIC_MODEL"),
          max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
          system,
          messages: userMessages,
        }),
      });
    } catch (error) {
      this.logger.error(`Anthropic API request failed: ${String(error)}`);
      throw new AiProviderUnavailableError("Could not reach the Anthropic API.");
    }

    if (!response.ok) {
      // Never logs the API key; response bodies from a failed call are provider-side
      // error detail, not user input, so logging them is safe.
      this.logger.error(`Anthropic API returned ${response.status}: ${await response.text()}`);
      throw new AiProviderUnavailableError(`Anthropic API returned ${response.status}.`);
    }

    const body = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = body.content?.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new AiProviderUnavailableError("Anthropic API returned no text content.");
    }

    return { text };
  }
}
