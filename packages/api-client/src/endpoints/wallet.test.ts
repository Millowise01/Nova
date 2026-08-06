import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createApiClient } from "../http-client";

import { createWalletEndpoints } from "./wallet";

const BASE_URL = "https://api.test";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("getBalance", () => {
  it("parses the wallet balance Money shape from GET /wallet/balance — the only wallet read endpoint that exists", async () => {
    server.use(
      http.get(`${BASE_URL}/wallet/balance`, () =>
        HttpResponse.json({ data: { amount: "150.00", currency: "SLE" } }),
      ),
    );

    const endpoints = createWalletEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.getBalance();

    expect(result).toEqual({ amount: "150.00", currency: "SLE" });
  });
});
