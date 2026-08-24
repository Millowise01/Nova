import { randomUUID } from "node:crypto";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

// Real UUIDs — @nova/validation's schemas Zod-validate every id field as .uuid(),
// and a non-UUID fixture string makes the query fail parsing (silently, from the
// test's point of view: it just resolves to an error state, not a thrown crash).
const REFUND_ID = randomUUID();
const PAYMENT_INTENT_ID = randomUUID();
const PAYOUT_ID = randomUUID();
const SELLER_ID = randomUUID();
const ADMIN_A_ID = randomUUID();
const ADMIN_B_ID = randomUUID();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ session: { userId: ADMIN_A_ID, roles: ["admin"] } }),
}));

import { RefundsPayoutsScreen } from "./refunds-payouts-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova Admin";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3002";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const refund = {
  id: REFUND_ID,
  paymentIntentId: PAYMENT_INTENT_ID,
  amount: "600.00",
  currency: "SLE",
  reason: "Customer never received the item",
  status: "proposed",
  proposedBy: ADMIN_B_ID,
  approvedBy: null,
  rejectionReason: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const payout = {
  id: PAYOUT_ID,
  sellerId: SELLER_ID,
  amount: "750.00",
  currency: "SLE",
  reason: "Weekly settlement",
  status: "proposed",
  proposedBy: ADMIN_B_ID,
  approvedBy: null,
  rejectionReason: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("RefundsPayoutsScreen", () => {
  it("renders both RefundRequest and SellerPayout proposals in one combined queue", async () => {
    server.use(
      http.get(`${BASE_URL}/wallet/refunds`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("status")).toBe("proposed");
        return HttpResponse.json({ data: [refund] });
      }),
      http.get(`${BASE_URL}/finance/payouts`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("status")).toBe("proposed");
        return HttpResponse.json({ data: [payout] });
      }),
    );

    const queryClient = createTestQueryClient();
    render(<RefundsPayoutsScreen />, { wrapper: withQueryClientAndToast(queryClient) });

    await waitFor(() => expect(screen.getByText(PAYMENT_INTENT_ID)).toBeInTheDocument());
    expect(screen.getByText(SELLER_ID)).toBeInTheDocument();
    expect(screen.getByText("SLE 600.00")).toBeInTheDocument();
    expect(screen.getByText("SLE 750.00")).toBeInTheDocument();
  });

  it("approving a refund calls PATCH /wallet/refunds/:id/approve, not the payout endpoint", async () => {
    let approveCalled = false;
    server.use(
      http.get(`${BASE_URL}/wallet/refunds`, () => HttpResponse.json({ data: [refund] })),
      http.get(`${BASE_URL}/finance/payouts`, () => HttpResponse.json({ data: [] })),
      http.patch(`${BASE_URL}/wallet/refunds/${REFUND_ID}/approve`, () => {
        approveCalled = true;
        return HttpResponse.json({ data: { ...refund, status: "executed" } });
      }),
    );

    const queryClient = createTestQueryClient();
    const user = userEvent.setup();
    render(<RefundsPayoutsScreen />, { wrapper: withQueryClientAndToast(queryClient) });

    await waitFor(() => expect(screen.getByText("Approve")).toBeInTheDocument());
    await user.click(screen.getByText("Approve"));

    await waitFor(() => expect(approveCalled).toBe(true));
  });

  it("disables Approve for a proposal the current admin made themselves", async () => {
    server.use(
      http.get(`${BASE_URL}/wallet/refunds`, () =>
        HttpResponse.json({ data: [{ ...refund, proposedBy: ADMIN_A_ID }] }),
      ),
      http.get(`${BASE_URL}/finance/payouts`, () => HttpResponse.json({ data: [] })),
    );

    const queryClient = createTestQueryClient();
    render(<RefundsPayoutsScreen />, { wrapper: withQueryClientAndToast(queryClient) });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });
});
