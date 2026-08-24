import { randomUUID } from "node:crypto";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

import { DisputeDetailScreen } from "./dispute-detail-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova Admin";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3002";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Real UUIDs — see seller-approval-screen.test.tsx's comment for why non-UUID
// fixture strings silently fail Zod's .uuid() validation instead of crashing loudly.
const DISPUTE_ID = randomUUID();
const ORDER_ID = randomUUID();
const BUYER_ID = randomUUID();
const EVENT_ID = randomUUID();

const openDispute = {
  id: DISPUTE_ID,
  orderId: ORDER_ID,
  reviewId: null,
  openedBy: BUYER_ID,
  reason: "Item never arrived",
  status: "open",
  resolution: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  events: [
    {
      id: EVENT_ID,
      disputeId: DISPUTE_ID,
      actorId: BUYER_ID,
      eventType: "opened",
      note: "Item never arrived",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

describe("DisputeDetailScreen", () => {
  it("renders the dispute and its event timeline from GET /trust-safety/disputes/:id", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}`, () =>
        HttpResponse.json({ data: openDispute }),
      ),
    );

    const queryClient = createTestQueryClient();
    render(<DisputeDetailScreen id={DISPUTE_ID} />, {
      wrapper: withQueryClientAndToast(queryClient),
    });

    await waitFor(() => expect(screen.getByText(`Dispute ${DISPUTE_ID}`)).toBeInTheDocument());
    expect(screen.getByText("opened")).toBeInTheDocument();
  });

  it("resolving posts PATCH /trust-safety/disputes/:id/resolve with the typed resolution", async () => {
    let resolvedWith: string | null = null;
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}`, () =>
        HttpResponse.json({ data: openDispute }),
      ),
      http.patch(`${BASE_URL}/trust-safety/disputes/${DISPUTE_ID}/resolve`, async ({ request }) => {
        const body = (await request.json()) as { resolution: string };
        resolvedWith = body.resolution;
        return HttpResponse.json({
          data: { ...openDispute, status: "resolved", resolution: body.resolution },
        });
      }),
    );

    const queryClient = createTestQueryClient();
    const user = userEvent.setup();
    render(<DisputeDetailScreen id={DISPUTE_ID} />, {
      wrapper: withQueryClientAndToast(queryClient),
    });

    await waitFor(() => expect(screen.getByLabelText("Resolution")).toBeInTheDocument());
    await user.type(screen.getByLabelText("Resolution"), "Refunded via wallet credit");
    await user.click(screen.getByText("Resolve dispute"));

    await waitFor(() => expect(resolvedWith).toBe("Refunded via wallet credit"));
  });
});
