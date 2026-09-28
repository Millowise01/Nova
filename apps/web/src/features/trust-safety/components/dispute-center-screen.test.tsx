import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

const authState = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

import { DisputeCenterScreen } from "./dispute-center-screen";

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

function disputeFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    orderId: "22222222-2222-2222-2222-222222222222",
    reviewId: null,
    openedBy: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    reason: "Item never arrived",
    status: "open",
    resolution: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("DisputeCenterScreen", () => {
  it("fetches and renders the caller's own disputes from GET /trust-safety/disputes/mine", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/mine`, () =>
        HttpResponse.json({ data: [disputeFixture()] }),
      ),
    );

    render(<DisputeCenterScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await waitFor(() => expect(screen.getByText("Item never arrived")).toBeInTheDocument());
    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/support/disputes/11111111-1111-1111-1111-111111111111",
    );
  });

  it("shows an empty state, not an error, when the caller has no disputes", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/mine`, () => HttpResponse.json({ data: [] })),
    );

    render(<DisputeCenterScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await waitFor(() => expect(screen.getByText("No disputes")).toBeInTheDocument());
  });
});
