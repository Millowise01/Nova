import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { tokenStore } from "@nova/api-client";

import { login, logout, restoreSession, signup } from "./auth.service";

const BASE_URL = "http://localhost:4000/v1";
const USER_ID = "11111111-1111-1111-1111-111111111111";
const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;
const server = setupServer();

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64");
  return `${encode({ alg: "none" })}.${encode(payload)}.signature`;
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  tokenStore.clear();
  window.localStorage.clear();
});

describe("signup / login", () => {
  it("signup stores tokens and returns a lightweight session decoded from the JWT", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/signup`, () =>
        HttpResponse.json({
          data: {
            accessToken: makeJwt({ sub: USER_ID, roles: ["customer"], exp: FUTURE_EXP }),
            refreshToken: "refresh-1",
            user: { id: USER_ID, roles: ["customer"] },
          },
        }),
      ),
    );

    const session = await signup({
      firstName: "A",
      lastName: "B",
      email: "a@example.com",
      phone: "+23276000000",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(session.userId).toBe(USER_ID);
    expect(session.roles).toEqual(["customer"]);
    expect(tokenStore.getAccessToken()).not.toBeNull();
    expect(tokenStore.getRefreshToken()).toBe("refresh-1");
  });

  it("login stores tokens identically to signup", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/login`, () =>
        HttpResponse.json({
          data: {
            accessToken: makeJwt({ sub: USER_ID, roles: ["customer"], exp: FUTURE_EXP }),
            refreshToken: "refresh-2",
            user: { id: USER_ID, roles: ["customer"] },
          },
        }),
      ),
    );

    const session = await login({ email: "a@example.com", password: "password123" });

    expect(session.userId).toBe(USER_ID);
    expect(tokenStore.getRefreshToken()).toBe("refresh-2");
  });
});

describe("restoreSession (silent refresh on app boot)", () => {
  it("returns null immediately when there's no stored refresh token — no network call made", async () => {
    const session = await restoreSession();
    expect(session).toBeNull();
  });

  it("exchanges a stored refresh token for a fresh session via POST /auth/refresh", async () => {
    tokenStore.setTokens("stale-access", "stored-refresh-token");

    server.use(
      http.post(`${BASE_URL}/auth/refresh`, async ({ request }) => {
        const body = (await request.json()) as { refreshToken: string };
        expect(body.refreshToken).toBe("stored-refresh-token");
        return HttpResponse.json({
          data: {
            accessToken: makeJwt({ sub: USER_ID, roles: ["customer"], exp: FUTURE_EXP }),
            refreshToken: "rotated-refresh-token",
          },
        });
      }),
    );

    const session = await restoreSession();

    expect(session?.userId).toBe(USER_ID);
    expect(tokenStore.getRefreshToken()).toBe("rotated-refresh-token");
  });

  it("clears tokenStore and returns null (not a thrown error) when the stored refresh token is rejected", async () => {
    tokenStore.setTokens("stale-access", "expired-refresh-token");

    server.use(
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json(
          { error: { code: "REFRESH_TOKEN_INVALID", message: "Expired", correlationId: "c-1" } },
          { status: 401 },
        ),
      ),
    );

    const session = await restoreSession();

    expect(session).toBeNull();
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});

describe("logout", () => {
  it("clears tokenStore — there is no backend /auth/logout endpoint to call", () => {
    tokenStore.setTokens("access-1", "refresh-1");
    logout();
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });
});
