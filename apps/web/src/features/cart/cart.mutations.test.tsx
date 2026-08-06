import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartResponse } from "@nova/validation";

import { addLine, ensureCartId } from "@/services/cart-checkout.service";
import { createTestQueryClient, withQueryClientAndToast } from "@/test-utils/query-client";

import { cartKeys } from "./cart.keys";
import { useAddToCartMutation } from "./cart.mutations";

// vi.mock() is hoisted above every import above by Vitest regardless of
// where it's written textually — see the identical note in
// auth.mutations.test.tsx for why imports come first here.
vi.mock("@/services/cart-checkout.service", () => ({
  ensureCartId: vi.fn(),
  addLine: vi.fn(),
}));

const CART_ID = "11111111-1111-1111-1111-111111111111";
const VARIANT_ID = "22222222-2222-2222-2222-222222222222";

function emptyCart(): CartResponse {
  return { id: CART_ID, status: "open", lines: [], subtotal: { amount: "0.00", currency: "SLE" } };
}

beforeEach(() => {
  vi.mocked(ensureCartId).mockReset();
  vi.mocked(addLine).mockReset();
});

// Exercises the full onMutate/onError/onSettled optimistic triad required by
// docs/frontend/01-data-fetching-conventions.md — each phase asserted
// separately so a regression in any one of the three surfaces distinctly.
describe("useAddToCartMutation optimistic triad", () => {
  it("onMutate: writes the optimistic line immediately, before addLine's promise resolves", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(cartKeys.detail(), emptyCart());

    let resolveAddLine!: () => void;
    vi.mocked(ensureCartId).mockResolvedValue(CART_ID);
    vi.mocked(addLine).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAddLine = () => resolve(undefined);
        }),
    );

    const { result } = renderHook(() => useAddToCartMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({
        variantId: VARIANT_ID,
        quantity: 2,
        unitPrice: { amount: "5.00", currency: "SLE" },
      });
    });

    await waitFor(() => {
      const cart = queryClient.getQueryData<CartResponse>(cartKeys.detail());
      expect(cart?.lines).toHaveLength(1);
    });

    const optimisticCart = queryClient.getQueryData<CartResponse>(cartKeys.detail());
    expect(optimisticCart?.lines[0]?.quantity).toBe(2);
    expect(optimisticCart?.subtotal.amount).toBe("10.00");

    resolveAddLine();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("onError: rolls back to the exact pre-mutation cart when addLine rejects", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(cartKeys.detail(), emptyCart());

    vi.mocked(ensureCartId).mockResolvedValue(CART_ID);
    vi.mocked(addLine).mockRejectedValue(new Error("network failure"));

    const { result } = renderHook(() => useAddToCartMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({
        variantId: VARIANT_ID,
        quantity: 1,
        unitPrice: { amount: "5.00", currency: "SLE" },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cart = queryClient.getQueryData<CartResponse>(cartKeys.detail());
    expect(cart?.lines).toHaveLength(0);
  });

  it("onSettled: invalidates the cart query so the final state reconciles against the server", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(cartKeys.detail(), emptyCart());
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(ensureCartId).mockResolvedValue(CART_ID);
    vi.mocked(addLine).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAddToCartMutation(), {
      wrapper: withQueryClientAndToast(queryClient),
    });

    act(() => {
      result.current.mutate({
        variantId: VARIANT_ID,
        quantity: 1,
        unitPrice: { amount: "5.00", currency: "SLE" },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cartKeys.detail() });
  });
});
