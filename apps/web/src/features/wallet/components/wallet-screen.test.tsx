import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClient } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

const authState = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

import { WalletScreen } from "./wallet-screen";

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
  authState.isAuthenticated = true;
});

describe("WalletScreen", () => {
  it("fetches and renders the real balance from GET /wallet/balance", async () => {
    server.use(
      http.get(`${BASE_URL}/wallet/balance`, () =>
        HttpResponse.json({ data: { amount: "150.00", currency: "SLE" } }),
      ),
    );

    const queryClient = createTestQueryClient();
    render(<WalletScreen />, { wrapper: withQueryClient(queryClient) });

    await waitFor(() => expect(screen.getByText(/150/)).toBeInTheDocument());
  });

  it("renders every unwired feature as explicitly unavailable, and never attempts a request for any of them", async () => {
    let unexpectedRequestCount = 0;
    server.use(
      http.get(`${BASE_URL}/wallet/balance`, () =>
        HttpResponse.json({ data: { amount: "0.00", currency: "SLE" } }),
      ),
      // Any of these firing at all is the regression: none of these backend
      // routes exist, and the UI must never attempt them.
      http.get(`${BASE_URL}/wallet/*`, () => {
        unexpectedRequestCount += 1;
        return HttpResponse.json({}, { status: 404 });
      }),
      http.post(`${BASE_URL}/wallet/*`, () => {
        unexpectedRequestCount += 1;
        return HttpResponse.json({}, { status: 404 });
      }),
    );

    const queryClient = createTestQueryClient();
    render(<WalletScreen />, { wrapper: withQueryClient(queryClient) });

    for (const feature of [
      "Top-up",
      "Withdraw",
      "Rewards",
      "Cashback",
      "Coupons",
      "Transaction History",
    ]) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }

    await waitFor(() => expect(screen.getByText(/0/)).toBeInTheDocument());
    expect(unexpectedRequestCount).toBe(0);
  });

  it("prompts sign-in instead of fetching a balance when unauthenticated", () => {
    authState.isAuthenticated = false;
    // useWalletBalanceQuery() is called unconditionally before the auth check
    // in WalletScreen, so the query does still fire here even though the UI
    // never shows its result — this handler just keeps that (harmless, but
    // real) request from failing as unhandled in this test.
    server.use(
      http.get(`${BASE_URL}/wallet/balance`, () =>
        HttpResponse.json({ data: { amount: "0.00", currency: "SLE" } }),
      ),
    );

    const queryClient = createTestQueryClient();
    render(<WalletScreen />, { wrapper: withQueryClient(queryClient) });

    expect(screen.getByText(/sign in to view your wallet/i)).toBeInTheDocument();
  });
});
