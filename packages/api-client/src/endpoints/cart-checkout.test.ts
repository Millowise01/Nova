import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createApiClient } from "../http-client";

import { createCartCheckoutEndpoints } from "./cart-checkout";

// Regression tests for cartCreateResponseSchema's guestToken: the backend
// (cart.service.ts: `const guestToken = userId ? null : randomUUID();`) returns
// null for authenticated callers and a real string only for genuine guests.
// A naive `guestToken: z.string()` schema (the original assumption before this
// was checked against the live backend) would throw on the authenticated case.

const BASE_URL = "https://api.test";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("createCart", () => {
  it("parses guestToken: null for an authenticated caller", async () => {
    server.use(
      http.post(`${BASE_URL}/cart`, () =>
        HttpResponse.json({
          data: { cartId: "11111111-1111-1111-1111-111111111111", guestToken: null },
        }),
      ),
    );

    const endpoints = createCartCheckoutEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.createCart();

    expect(result.guestToken).toBeNull();
  });

  it("parses a real string guestToken for a guest caller", async () => {
    server.use(
      http.post(`${BASE_URL}/cart`, () =>
        HttpResponse.json({
          data: { cartId: "22222222-2222-2222-2222-222222222222", guestToken: "guest-token-abc" },
        }),
      ),
    );

    const endpoints = createCartCheckoutEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.createCart();

    expect(result.guestToken).toBe("guest-token-abc");
  });

  it("still rejects a response missing guestToken entirely, proving the schema validates rather than passing through", async () => {
    server.use(
      http.post(`${BASE_URL}/cart`, () =>
        HttpResponse.json({ data: { cartId: "33333333-3333-3333-3333-333333333333" } }),
      ),
    );

    const endpoints = createCartCheckoutEndpoints(createApiClient(BASE_URL));

    await expect(endpoints.createCart()).rejects.toThrow();
  });
});
