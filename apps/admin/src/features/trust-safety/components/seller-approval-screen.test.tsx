import { randomUUID } from "node:crypto";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

// Every id field in these responses is Zod-validated as .uuid() by @nova/validation's
// schemas — non-UUID fixture strings (e.g. "kyc-1") fail parsing silently from the
// test's point of view (the query just resolves to an error state, no thrown crash),
// which is exactly what happened before this file used real UUIDs.
const KYC_ID = randomUUID();
const SELLER_ID = randomUUID();
const ADMIN_A_ID = randomUUID();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ session: { userId: ADMIN_A_ID, roles: ["admin"] } }),
}));

import { SellerApprovalScreen } from "./seller-approval-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova Admin";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3002";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SellerApprovalScreen", () => {
  it("renders the real pending KYC queue from GET /trust-safety/kyc?status=pending", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/kyc`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("status")).toBe("pending");
        return HttpResponse.json({
          data: [
            {
              id: KYC_ID,
              subjectId: SELLER_ID,
              subjectType: "seller",
              documentReference: "REG-123",
              status: "pending",
              reviewProposedBy: null,
              proposedDecision: null,
              reviewConfirmedBy: null,
              rejectionReason: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        });
      }),
      http.get(`${BASE_URL}/trust-safety/suspension-requests`, () =>
        HttpResponse.json({ data: [] }),
      ),
    );

    const queryClient = createTestQueryClient();
    render(<SellerApprovalScreen />, { wrapper: withQueryClientAndToast(queryClient) });

    await waitFor(() => expect(screen.getByText("REG-123")).toBeInTheDocument());
    expect(screen.getByText(SELLER_ID)).toBeInTheDocument();
  });

  it("proposing a decision disables confirmation for the SAME admin who proposed it", async () => {
    let proposedDecision: string | null = null;

    server.use(
      http.get(`${BASE_URL}/trust-safety/kyc`, () =>
        HttpResponse.json({
          data: [
            {
              id: KYC_ID,
              subjectId: SELLER_ID,
              subjectType: "seller",
              documentReference: "REG-123",
              status: "pending",
              reviewProposedBy: proposedDecision ? ADMIN_A_ID : null,
              proposedDecision,
              reviewConfirmedBy: null,
              rejectionReason: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
      ),
      http.get(`${BASE_URL}/trust-safety/suspension-requests`, () =>
        HttpResponse.json({ data: [] }),
      ),
      http.patch(`${BASE_URL}/trust-safety/kyc/${KYC_ID}/propose-decision`, async ({ request }) => {
        const body = (await request.json()) as { decision: string };
        proposedDecision = body.decision;
        return HttpResponse.json({
          data: {
            id: KYC_ID,
            subjectId: SELLER_ID,
            subjectType: "seller",
            documentReference: "REG-123",
            status: "pending",
            reviewProposedBy: ADMIN_A_ID,
            proposedDecision,
            reviewConfirmedBy: null,
            rejectionReason: null,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        });
      }),
    );

    const queryClient = createTestQueryClient();
    const user = userEvent.setup();
    render(<SellerApprovalScreen />, { wrapper: withQueryClientAndToast(queryClient) });

    await waitFor(() => expect(screen.getByText("Propose decision")).toBeInTheDocument());
    await user.click(screen.getByText("Propose decision"));
    await user.click(screen.getByText("Submit proposal"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /confirm decision/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /confirm decision/i })).toBeDisabled();
    expect(screen.getByText(/by you — needs another admin/i)).toBeInTheDocument();
  });
});
