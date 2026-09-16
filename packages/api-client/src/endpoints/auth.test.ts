import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createApiClient } from "../http-client";

import { createAuthEndpoints } from "./auth";

const BASE_URL = "https://api.test";
const server = setupServer();
const USER_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("signup / login", () => {
  it("signup parses tokens + user from the shared authResponseSchema", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/signup`, () =>
        HttpResponse.json({
          data: {
            accessToken: "access-1",
            refreshToken: "refresh-1",
            user: { id: USER_ID, roles: ["customer"] },
          },
        }),
      ),
    );

    const endpoints = createAuthEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.signup({
      firstName: "A",
      lastName: "B",
      email: "a@example.com",
      phone: "+23276000000",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.user).toEqual({ id: USER_ID, roles: ["customer"] });
    expect(result.accessToken).toBe("access-1");
  });

  it("login parses tokens + user identically to signup", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/login`, () =>
        HttpResponse.json({
          data: {
            accessToken: "access-2",
            refreshToken: "refresh-2",
            user: { id: USER_ID, roles: ["customer"] },
          },
        }),
      ),
    );

    const endpoints = createAuthEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.login({ email: "a@example.com", password: "password123" });

    expect(result.accessToken).toBe("access-2");
  });
});

describe("refresh", () => {
  it("parses rotated tokens WITHOUT a user field (refreshResponseSchema, not authResponseSchema)", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/refresh`, () =>
        HttpResponse.json({ data: { accessToken: "access-3", refreshToken: "refresh-3" } }),
      ),
    );

    const endpoints = createAuthEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.refresh("refresh-2");

    expect(result).toEqual({ accessToken: "access-3", refreshToken: "refresh-3" });
  });
});

describe("OTP — requestOtp / verifyOtp", () => {
  it("requestOtp posts { destination } and parses the sent status, no session fields", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/otp`, async ({ request }) => {
        expect(await request.json()).toEqual({ destination: "shopper@example.com" });
        return HttpResponse.json({ data: { status: "sent" } });
      }),
    );

    const endpoints = createAuthEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.requestOtp("shopper@example.com");

    expect(result).toEqual({ status: "sent" });
  });

  it("verifyOtp posts { destination, code } and parses the verified status, no session fields", async () => {
    server.use(
      http.post(`${BASE_URL}/auth/otp/verify`, async ({ request }) => {
        expect(await request.json()).toEqual({
          destination: "shopper@example.com",
          code: "123456",
        });
        return HttpResponse.json({ data: { status: "verified" } });
      }),
    );

    const endpoints = createAuthEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.verifyOtp("shopper@example.com", "123456");

    expect(result).toEqual({ status: "verified" });
  });
});
