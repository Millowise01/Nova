import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { ApiError } from "../errors";
import { createApiClient } from "../http-client";

import { createNotificationsEndpoints } from "./notifications";

const BASE_URL = "https://api.test";
const server = setupServer();
const NOTIFICATION_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

function notificationFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: NOTIFICATION_ID,
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

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("listNotifications", () => {
  it("parses the list envelope directly at the top level, including unreadCount", async () => {
    server.use(
      http.get(`${BASE_URL}/notifications`, () =>
        HttpResponse.json({
          data: [notificationFixture()],
          pageInfo: { hasMore: false, nextCursor: null },
          unreadCount: 1,
        }),
      ),
    );

    const endpoints = createNotificationsEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.listNotifications();

    expect(result.data).toHaveLength(1);
    expect(result.unreadCount).toBe(1);
    expect(result.pageInfo).toEqual({ hasMore: false, nextCursor: null });
  });

  it("forwards unreadOnly as the literal string 'true', not a JS boolean", async () => {
    let receivedUnreadOnly: string | null = null;
    server.use(
      http.get(`${BASE_URL}/notifications`, ({ request }) => {
        receivedUnreadOnly = new URL(request.url).searchParams.get("unreadOnly");
        return HttpResponse.json({
          data: [],
          pageInfo: { hasMore: false, nextCursor: null },
          unreadCount: 0,
        });
      }),
    );

    const endpoints = createNotificationsEndpoints(createApiClient(BASE_URL));
    await endpoints.listNotifications({ unreadOnly: true });

    expect(receivedUnreadOnly).toBe("true");
  });
});

describe("markRead", () => {
  it("parses the single-notification response nested under .data.data", async () => {
    server.use(
      http.patch(`${BASE_URL}/notifications/${NOTIFICATION_ID}/read`, () =>
        HttpResponse.json({ data: notificationFixture({ readAt: "2026-01-02T00:00:00.000Z" }) }),
      ),
    );

    const endpoints = createNotificationsEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.markRead(NOTIFICATION_ID);

    expect(result.readAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("surfaces a 403 as an ApiError, not a raw axios error", async () => {
    server.use(
      http.patch(`${BASE_URL}/notifications/${NOTIFICATION_ID}/read`, () =>
        HttpResponse.json(
          {
            error: {
              code: "NOTIFICATION_ACCESS_DENIED",
              message: "You do not have access to this notification.",
              correlationId: "c-1",
            },
          },
          { status: 403 },
        ),
      ),
    );

    const endpoints = createNotificationsEndpoints(createApiClient(BASE_URL));

    await expect(endpoints.markRead(NOTIFICATION_ID)).rejects.toBeInstanceOf(ApiError);
    await expect(endpoints.markRead(NOTIFICATION_ID)).rejects.toMatchObject({
      code: "NOTIFICATION_ACCESS_DENIED",
    });
  });
});

describe("markAllRead", () => {
  it("hits PATCH /notifications/read-all and resolves with no body to parse", async () => {
    let called = false;
    server.use(
      http.patch(`${BASE_URL}/notifications/read-all`, () => {
        called = true;
        return new HttpResponse(null, { status: 200 });
      }),
    );

    const endpoints = createNotificationsEndpoints(createApiClient(BASE_URL));
    await endpoints.markAllRead();

    expect(called).toBe(true);
  });
});
