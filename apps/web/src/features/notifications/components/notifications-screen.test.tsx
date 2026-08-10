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

import { NotificationsScreen } from "./notifications-screen";

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

function notificationFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    userId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    type: "order.placed",
    title: "Order placed",
    body: "Your order has been placed.",
    referenceType: "Order",
    referenceId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    readAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("NotificationsScreen", () => {
  it("fetches and renders real notifications from GET /notifications, including the unread count", async () => {
    server.use(
      http.get(`${BASE_URL}/notifications`, () =>
        HttpResponse.json({
          data: [notificationFixture()],
          pageInfo: { hasMore: false, nextCursor: null },
          unreadCount: 1,
        }),
      ),
    );

    render(<NotificationsScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await waitFor(() => expect(screen.getByText("Order placed")).toBeInTheDocument());
    expect(screen.getByText(/1 unread/i)).toBeInTheDocument();
  });

  it("marks a notification read via PATCH /notifications/:id/read, optimistically clearing the unread badge", async () => {
    // Stateful, not a static fixture — onSettled invalidates and refetches GET
    // /notifications after the PATCH resolves, so the mock has to actually reflect
    // the mutation for the post-refetch assertion to mean anything (a static fixture
    // would silently clobber the optimistic update back to "unread" on refetch).
    let patchedId: string | null = null;
    let isRead = false;
    server.use(
      http.get(`${BASE_URL}/notifications`, () =>
        HttpResponse.json({
          data: [notificationFixture(isRead ? { readAt: "2026-01-02T00:00:00.000Z" } : {})],
          pageInfo: { hasMore: false, nextCursor: null },
          unreadCount: isRead ? 0 : 1,
        }),
      ),
      http.patch(`${BASE_URL}/notifications/:id/read`, ({ params }) => {
        patchedId = params.id as string;
        isRead = true;
        return HttpResponse.json({
          data: notificationFixture({ readAt: "2026-01-02T00:00:00.000Z" }),
        });
      }),
    );

    render(<NotificationsScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    const markReadButton = await screen.findByRole("button", { name: /mark read/i });
    markReadButton.click();

    await waitFor(() => expect(patchedId).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff"));
    await waitFor(() => expect(screen.getByText(/all caught up/i)).toBeInTheDocument());
  });

  it("shows an empty state with no notifications", async () => {
    server.use(
      http.get(`${BASE_URL}/notifications`, () =>
        HttpResponse.json({
          data: [],
          pageInfo: { hasMore: false, nextCursor: null },
          unreadCount: 0,
        }),
      ),
    );

    render(<NotificationsScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    await waitFor(() => expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument());
  });

  it("prompts sign-in instead of fetching notifications when unauthenticated", () => {
    authState.isAuthenticated = false;

    render(<NotificationsScreen />, { wrapper: withQueryClientAndToast(createTestQueryClient()) });

    expect(screen.getByText(/sign in to view your notifications/i)).toBeInTheDocument();
  });
});
