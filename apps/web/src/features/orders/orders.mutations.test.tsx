import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearStoredCartId } from "@/lib/cart-id-store";
import { cancelOrder, createOrder } from "@/services/orders.service";
import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

import { cartKeys } from "../cart/cart.keys";

import { orderKeys } from "./orders.keys";
import { useCancelOrderMutation, useCreateOrderMutation } from "./orders.mutations";

// vi.mock() is hoisted above every import above by Vitest regardless of
// where it's written textually — see the identical note in
// auth.mutations.test.tsx for why imports come first here.
vi.mock("@/services/orders.service", () => ({
  cancelOrder: vi.fn(),
  createOrder: vi.fn(),
}));
vi.mock("@/lib/cart-id-store", () => ({
  clearStoredCartId: vi.fn(),
}));

const ORDER_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

beforeEach(() => {
  vi.mocked(cancelOrder).mockReset();
  vi.mocked(createOrder).mockReset();
  vi.mocked(clearStoredCartId).mockReset();
});

describe("useCancelOrderMutation", () => {
  it("invalidates detail + list queries on success rather than caching the subOrders-less response directly", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    // Matches the real backend's PATCH .../cancel response — no `subOrders`
    // field (see orderCancelResponseSchema in @nova/validation).
    vi.mocked(cancelOrder).mockResolvedValue({
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
    });

    const { result } = renderHook(() => useCancelOrderMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({ orderId: ORDER_ID });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: orderKeys.detail(ORDER_ID) });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: orderKeys.lists() });
    // The regression this guards: never write the incomplete (subOrders-less)
    // cancel response straight into the detail cache — that would silently
    // drop subOrders from an already-rendered OrderDetailScreen.
    expect(setQueryDataSpy).not.toHaveBeenCalledWith(orderKeys.detail(ORDER_ID), expect.anything());
  });

  it("surfaces a toast error and does not invalidate on failure", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(cancelOrder).mockRejectedValue(new Error("cannot cancel"));

    const { result } = renderHook(() => useCancelOrderMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({ orderId: ORDER_ID });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe("useCreateOrderMutation", () => {
  it("clears the stored cart id and invalidates cart + orders-list queries on success", async () => {
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(createOrder).mockResolvedValue({
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      status: "placed",
      total: { amount: "10.00", currency: "SLE" },
      subOrders: [],
      paymentIntentId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    const { result } = renderHook(() => useCreateOrderMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({ checkoutSessionId: "session-1", idempotencyKey: "key-1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(clearStoredCartId).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.detail() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: orderKeys.lists() });
  });

  it("forwards the caller's idempotencyKey to the service function unchanged", async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(createOrder).mockResolvedValue({
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      status: "placed",
      total: { amount: "10.00", currency: "SLE" },
      subOrders: [],
      paymentIntentId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    const { result } = renderHook(() => useCreateOrderMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({ checkoutSessionId: "session-1", idempotencyKey: "same-key" });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => {
      result.current.mutate({ checkoutSessionId: "session-1", idempotencyKey: "same-key" });
    });
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));

    expect(createOrder).toHaveBeenNthCalledWith(1, "session-1", "same-key");
    expect(createOrder).toHaveBeenNthCalledWith(2, "session-1", "same-key");
  });
});
