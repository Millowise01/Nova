import type { AppConfigService } from "../../../../config/config.service";
import type { Env } from "../../../../config/env.schema";

import { AiProviderUnavailableError, ClaudeProvider } from "./claude-provider";

/** Same plain-construction convention as metrics-auth.guard.spec.ts. The real HTTP call
 *  is the one thing genuinely external here (a paid third-party API this environment has
 *  no live credentials for and should never spend real usage against just to run a test)
 *  — mocked via global fetch, the same seam Node's own runtime provides, no new
 *  dependency needed to do it. */
function configWith(env: Partial<Pick<Env, "ANTHROPIC_API_KEY" | "ANTHROPIC_MODEL">>) {
  return { get: (key: string) => env[key as keyof typeof env] } as unknown as AppConfigService;
}

describe("ClaudeProvider", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws AiProviderUnavailableError without ever calling fetch when no API key is configured", async () => {
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy;

    const provider = new ClaudeProvider(configWith({ ANTHROPIC_MODEL: "claude-sonnet-5" }));

    await expect(
      provider.complete({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow(AiProviderUnavailableError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the API key, model, system prompt and user messages in the shape Anthropic's Messages API expects", async () => {
    const fetchSpy = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ type: "text", text: "a real reply" }] }),
    });
    global.fetch = fetchSpy;

    const provider = new ClaudeProvider(
      configWith({ ANTHROPIC_API_KEY: "sk-test-key", ANTHROPIC_MODEL: "claude-sonnet-5" }),
    );

    const result = await provider.complete({
      messages: [
        { role: "system", content: "You are a test." },
        { role: "user", content: "hello" },
      ],
      maxTokens: 123,
    });

    expect(result.text).toBe("a real reply");
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-test-key");
    // Never the model's fault to check, but real defense-in-depth: the key must never
    // appear anywhere in the request BODY (only the dedicated header).
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(JSON.stringify(body)).not.toContain("sk-test-key");
    expect(body).toMatchObject({
      model: "claude-sonnet-5",
      max_tokens: 123,
      system: "You are a test.",
      messages: [{ role: "user", content: "hello" }],
    });
  });

  it("throws AiProviderUnavailableError, not a raw exception, when the API responds with an error status", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('{"error":"invalid api key"}'),
    });

    const provider = new ClaudeProvider(
      configWith({ ANTHROPIC_API_KEY: "sk-bad-key", ANTHROPIC_MODEL: "claude-sonnet-5" }),
    );

    await expect(
      provider.complete({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow(AiProviderUnavailableError);
  });

  it("throws AiProviderUnavailableError when the network request itself fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    const provider = new ClaudeProvider(
      configWith({ ANTHROPIC_API_KEY: "sk-test-key", ANTHROPIC_MODEL: "claude-sonnet-5" }),
    );

    await expect(
      provider.complete({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow(AiProviderUnavailableError);
  });
});
