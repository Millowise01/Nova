import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const DISPUTE_ID = "11111111-1111-1111-1111-111111111111";
const server = setupServer();

const authState = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => authState,
}));

import { DisputeDetailScreen } from "./dispute-detail-screen";

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

function disputeDetailFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: DISPUTE_ID,
    orderId: "22222222-2222-2222-2222-222222222222",
    reviewId: null,
    openedBy: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    reason: "Item never arrived",
    status: "open",
    resolution: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    events: [
      {
        id: "33333333-3333-3333-3333-333333333333",
        disputeId: DISPUTE_ID,
        actorId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        eventType: "opened",
        note: "Item never arrived",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("DisputeDetailScreen", () => {
  it("fetches and renders the dispute's timeline from GET /trust-safety/disputes/:id", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}`, () =>
        HttpResponse.json({ data: disputeDetailFixture() }),
      ),
    );

    render(<DisputeDetailScreen id={DISPUTE_ID} />, {
      wrapper: withQueryClientAndToast(createTestQueryClient()),
    });

    await waitFor(() => expect(screen.getByText("opened")).toBeInTheDocument());
    expect(screen.getByText("open")).toBeInTheDocument();
    // No "Resolve" affordance — that ability is admin-only.
    expect(screen.queryByText(/resolve/i)).not.toBeInTheDocument();
  });

  it("posts a comment via POST /trust-safety/disputes/:id/comments while the dispute is open", async () => {
    let posted: { note: string } | undefined;
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}`, () =>
        HttpResponse.json({ data: disputeDetailFixture() }),
      ),
      http.post(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}/comments`, async ({ request }) => {
        posted = (await request.json()) as { note: string };
        return HttpResponse.json(
          {
            data: {
              id: "44444444-4444-4444-4444-444444444444",
              disputeId: DISPUTE_ID,
              actorId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
              eventType: "comment",
              note: posted.note,
              createdAt: "2026-01-02T00:00:00.000Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    render(<DisputeDetailScreen id={DISPUTE_ID} />, {
      wrapper: withQueryClientAndToast(createTestQueryClient()),
    });

    await waitFor(() => expect(screen.getByText("opened")).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText("Add a comment"), "Following up");
    await userEvent.click(screen.getByRole("button", { name: "Post comment" }));

    await waitFor(() => expect(posted?.note).toBe("Following up"));
  });

  it("does not offer to comment once the dispute is resolved", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}`, () =>
        HttpResponse.json({
          data: disputeDetailFixture({ status: "resolved", resolution: "Refunded" }),
        }),
      ),
    );

    render(<DisputeDetailScreen id={DISPUTE_ID} />, {
      wrapper: withQueryClientAndToast(createTestQueryClient()),
    });

    await waitFor(() => expect(screen.getByText("resolved")).toBeInTheDocument());
    expect(screen.queryByLabelText("Add a comment")).not.toBeInTheDocument();
  });
});
