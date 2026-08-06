import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createApiClient } from "../http-client";

import { createOrdersEndpoints } from "./orders";

// Regression tests for the real, three-way order-shape divergence found across
// POST/GET/PATCH-cancel (see @nova/validation's orderCreateResponseSchema /
// orderSchema / orderCancelResponseSchema comments for the exact backend
// source lines each shape was confirmed against).

const BASE_URL = "https://api.test";
const server = setupServer();
const ORDER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("cancelOrder", () => {
  it("parses the real backend's subOrders-less cancel response — GET's orderSchema would reject this", async () => {
    server.use(
      http.patch(`${BASE_URL}/orders/${ORDER_ID}/cancel`, () =>
        HttpResponse.json({
          data: {
            id: ORDER_ID,
            checkoutSessionId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            userId: null,
            status: "cancelled",
            totalAmount: "10.00",
            totalCurrency: "SLE",
            countryCode: "SL",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            deletedAt: null,
            // Deliberately no `subOrders` — matches orders.service.ts's bare
            // tx.order.update() result with no Prisma `include`.
          },
        }),
      ),
    );

    const endpoints = createOrdersEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.cancelOrder(ORDER_ID);

    expect(result.status).toBe("cancelled");
    expect(result).not.toHaveProperty("subOrders");
  });

  it("rejects a cancel response that's missing a required flat field, proving real validation still runs", async () => {
    server.use(
      http.patch(`${BASE_URL}/orders/${ORDER_ID}/cancel`, () =>
        HttpResponse.json({ data: { id: ORDER_ID, status: "cancelled" } }),
      ),
    );

    const endpoints = createOrdersEndpoints(createApiClient(BASE_URL));

    await expect(endpoints.cancelOrder(ORDER_ID)).rejects.toThrow();
  });
});

describe("createOrder", () => {
  it("sends the caller's idempotency key as the Idempotency-Key header", async () => {
    let receivedHeader: string | null = null;
    server.use(
      http.post(`${BASE_URL}/orders`, ({ request }) => {
        receivedHeader = request.headers.get("idempotency-key");
        return HttpResponse.json({
          data: {
            id: ORDER_ID,
            status: "placed",
            total: { amount: "10.00", currency: "SLE" },
            subOrders: [],
            paymentIntentId: null,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        });
      }),
    );

    const endpoints = createOrdersEndpoints(createApiClient(BASE_URL));
    await endpoints.createOrder("session-id", "key-123");

    expect(receivedHeader).toBe("key-123");
  });

  it("parses POST /orders's NESTED Money `total` — distinct from GET's flat totalAmount/totalCurrency", async () => {
    server.use(
      http.post(`${BASE_URL}/orders`, () =>
        HttpResponse.json({
          data: {
            id: ORDER_ID,
            status: "placed",
            total: { amount: "25.50", currency: "USD" },
            subOrders: [],
            paymentIntentId: null,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        }),
      ),
    );

    const endpoints = createOrdersEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.createOrder("session-id", "key-123");

    expect(result.total).toEqual({ amount: "25.50", currency: "USD" });
  });

  it("submitting the same idempotency key twice against a deduping backend yields one distinct order id", async () => {
    let calls = 0;
    server.use(
      http.post(`${BASE_URL}/orders`, ({ request }) => {
        calls += 1;
        const key = request.headers.get("idempotency-key");
        // Simulates the real backend's own idempotency dedup keyed on the header.
        return HttpResponse.json({
          data: {
            id: key === "dup-key" ? ORDER_ID : "wrong-order-would-mean-no-dedup",
            status: "placed",
            total: { amount: "10.00", currency: "SLE" },
            subOrders: [],
            paymentIntentId: null,
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        });
      }),
    );

    const endpoints = createOrdersEndpoints(createApiClient(BASE_URL));
    const first = await endpoints.createOrder("session-id", "dup-key");
    const second = await endpoints.createOrder("session-id", "dup-key");

    expect(first.id).toBe(ORDER_ID);
    expect(second.id).toBe(first.id);
    expect(calls).toBe(2); // the frontend still sends 2 requests — the backend is what dedupes
  });
});

describe("getOrder / listOrders", () => {
  it("parses GET's flat totalAmount/totalCurrency plus a real subOrders array", async () => {
    server.use(
      http.get(`${BASE_URL}/orders/${ORDER_ID}`, () =>
        HttpResponse.json({
          data: {
            id: ORDER_ID,
            checkoutSessionId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            userId: null,
            status: "placed",
            totalAmount: "10.00",
            totalCurrency: "SLE",
            countryCode: "SL",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
            deletedAt: null,
            subOrders: [
              {
                id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
                orderId: ORDER_ID,
                sellerId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
                status: "placed",
                subtotalAmount: "10.00",
                subtotalCurrency: "SLE",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-01T00:00:00.000Z",
                deletedAt: null,
              },
            ],
          },
        }),
      ),
    );

    const endpoints = createOrdersEndpoints(createApiClient(BASE_URL));
    const result = await endpoints.getOrder(ORDER_ID);

    expect(result.totalAmount).toBe("10.00");
    expect(result.subOrders).toHaveLength(1);
  });
});
