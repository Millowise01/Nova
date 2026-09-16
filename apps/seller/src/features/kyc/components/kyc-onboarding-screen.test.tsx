import { randomUUID } from "node:crypto";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();
const SELLER_ID = randomUUID();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ session: { userId: SELLER_ID, roles: ["seller"] } }),
}));

import { KycOnboardingScreen } from "./kyc-onboarding-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova Seller";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("KycOnboardingScreen", () => {
  it("discloses that status can't be checked after leaving the page, rather than faking a status", () => {
    render(<KycOnboardingScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });
    expect(screen.getByText(/can't currently show your verification status/i)).toBeInTheDocument();
  });

  it("submits with the logged-in seller's own subjectId — never an editable field", async () => {
    let capturedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/trust-safety/kyc`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: {
            id: randomUUID(),
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
        });
      }),
    );

    const user = userEvent.setup();
    render(<KycOnboardingScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await user.type(screen.getByLabelText(/document reference/i), "REG-123");
    await user.click(screen.getByRole("button", { name: /submit for review/i }));

    await waitFor(() =>
      expect(screen.getByText(/submission received — it's pending review/i)).toBeInTheDocument(),
    );
    expect(capturedBody).toEqual({
      subjectId: SELLER_ID,
      subjectType: "seller",
      documentReference: "REG-123",
    });
  });
});
