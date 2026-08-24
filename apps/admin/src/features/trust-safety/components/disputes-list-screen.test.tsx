import { randomUUID } from "node:crypto";

import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, withQueryClient } from "@/test-utils/query-client";

const BASE_URL = "http://localhost:4000/v1";
const server = setupServer();

// Real UUIDs — see seller-approval-screen.test.tsx's comment for why non-UUID
// fixture strings silently fail Zod's .uuid() validation instead of crashing loudly.
const DISPUTE_ID = randomUUID();
const ORDER_ID = randomUUID();
const BUYER_ID = randomUUID();

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import { DisputesListScreen } from "./disputes-list-screen";

beforeAll(() => {
  process.env.NEXT_PUBLIC_APP_NAME = "Nova Admin";
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3002";
  process.env.NEXT_PUBLIC_API_BASE_URL = BASE_URL;
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE = "en";
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("DisputesListScreen", () => {
  it("renders the real open-disputes queue from GET /trust-safety/disputes?status=open", async () => {
    server.use(
      http.get(`${BASE_URL}/trust-safety/disputes`, ({ request }) => {
        expect(new URL(request.url).searchParams.get("status")).toBe("open");
        return HttpResponse.json({
          data: [
            {
              id: DISPUTE_ID,
              orderId: ORDER_ID,
              reviewId: null,
              openedBy: BUYER_ID,
              reason: "Item never arrived",
              status: "open",
              resolution: null,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        });
      }),
    );

    const queryClient = createTestQueryClient();
    render(<DisputesListScreen />, { wrapper: withQueryClient(queryClient) });

    await waitFor(() => expect(screen.getByText("Item never arrived")).toBeInTheDocument());
    expect(screen.getByText(`Order ${ORDER_ID}`)).toBeInTheDocument();
  });
});
