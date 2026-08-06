import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createApiClient } from "./http-client";
import { tokenStore } from "./token-store";

// Regression tests for two real, previously-invisible bugs found during the
// apps/web <-> backend integration: (1) concurrent 401s must share exactly one
// /auth/refresh call, not one each; (2) if refresh itself fails, the ORIGINAL
// 401 must be what's surfaced to the caller, not the refresh failure.

const BASE_URL = "https://api.test";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Each test resets the shared tokenStore singleton and jsdom's localStorage —
// without this, state set by one test would leak into the next in this file.
beforeEach(() => {
  tokenStore.clear();
  window.localStorage.clear();
});

function protectedHandler(path: string, validAccessToken: string) {
  return http.get(`${BASE_URL}${path}`, ({ request }) => {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${validAccessToken}`) {
      return HttpResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired token",
            correlationId: "c-1",
          },
        },
        { status: 401 },
      );
    }
    return HttpResponse.json({ data: { path } });
  });
}

describe("single-flight token refresh", () => {
  it("fires POST /auth/refresh exactly once for two concurrent 401s, and both original requests succeed with the refreshed token", async () => {
    tokenStore.setTokens("stale-token", "valid-refresh-token");

    let refreshCallCount = 0;
    server.use(
      protectedHandler("/resource-a", "fresh-token"),
      protectedHandler("/resource-b", "fresh-token"),
      http.post(`${BASE_URL}/auth/refresh`, async ({ request }) => {
        refreshCallCount += 1;
        const body = (await request.json()) as { refreshToken: string };
        expect(body.refreshToken).toBe("valid-refresh-token");
        return HttpResponse.json({
          data: { accessToken: "fresh-token", refreshToken: "next-refresh-token" },
        });
      }),
    );

    const client = createApiClient(BASE_URL);

    const [responseA, responseB] = await Promise.all([
      client.get("/resource-a"),
      client.get("/resource-b"),
    ]);

    expect(responseA.data).toEqual({ data: { path: "/resource-a" } });
    expect(responseB.data).toEqual({ data: { path: "/resource-b" } });
    expect(refreshCallCount).toBe(1);
    expect(tokenStore.getAccessToken()).toBe("fresh-token");
    expect(tokenStore.getRefreshToken()).toBe("next-refresh-token");
  });
});

describe("refresh failure", () => {
  it("clears tokenStore and surfaces the ORIGINAL 401 (not the refresh error) to the caller", async () => {
    tokenStore.setTokens("stale-token", "expired-refresh-token");

    server.use(
      protectedHandler("/resource-a", "irrelevant-because-refresh-fails"),
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json(
          {
            error: {
              code: "REFRESH_TOKEN_INVALID",
              message: "Refresh token expired",
              correlationId: "c-2",
            },
          },
          { status: 401 },
        ),
      ),
    );

    const client = createApiClient(BASE_URL);

    await expect(client.get("/resource-a")).rejects.toMatchObject({
      code: "UNAUTHORIZED", // resource-a's original 401 body, NOT REFRESH_TOKEN_INVALID
    });

    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it("clears tokenStore and rejects immediately when there is no refresh token to try", async () => {
    // No setTokens() call — simulates a 401 arriving with nothing in tokenStore
    // (e.g. an already-expired session on app boot).
    server.use(protectedHandler("/resource-a", "irrelevant"));

    const client = createApiClient(BASE_URL);

    await expect(client.get("/resource-a")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(tokenStore.getAccessToken()).toBeNull();
  });
});
