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
