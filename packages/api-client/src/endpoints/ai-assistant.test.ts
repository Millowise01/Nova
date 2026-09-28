import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createApiClient } from "../http-client";

import { createAiAssistantEndpoints } from "./ai-assistant";

const BASE_URL = "https://api.test";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("AI Shopping Assistant — sendMessage", () => {
  it("posts { message } and parses the reply, citations and handoff flag", async () => {
    server.use(
      http.post(`${BASE_URL}/ai/assistant/message`, async ({ request }) => {
        expect(await request.json()).toEqual({ message: "do you have headphones?" });
        return HttpResponse.json({
          data: {
            reply: "Here are some headphones.",
            citations: [{ source: "Nova catalog search" }],
            handoff: false,
          },
        });
      }),
    );

    const endpoints = createAiAssistantEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.sendMessage("do you have headphones?");

    expect(result).toEqual({
      reply: "Here are some headphones.",
      citations: [{ source: "Nova catalog search" }],
      handoff: false,
    });
  });

  it("parses a handoff response with no citations", async () => {
    server.use(
      http.post(`${BASE_URL}/ai/assistant/message`, () =>
        HttpResponse.json({
          data: {
            reply: "I'm not confident I can help with that one.",
            citations: [],
            handoff: true,
          },
        }),
      ),
    );

    const endpoints = createAiAssistantEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.sendMessage("please refund me");

    expect(result.handoff).toBe(true);
    expect(result.citations).toEqual([]);
  });
});
