"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@nova/api-client";
import type { CancelOrderInput } from "@nova/validation";

import { clearStoredCartId } from "@/lib/cart-id-store";
import { useToast } from "@/providers/toast-provider";
import { cancelOrder, createOrder } from "@/services/orders.service";

import { cartKeys } from "../cart/cart.keys";

import { orderKeys } from "./orders.keys";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      checkoutSessionId,
      idempotencyKey,
    }: {
      checkoutSessionId: string;
      idempotencyKey: string;
    }) => createOrder(checkoutSessionId, idempotencyKey),

    onSuccess: () => {
      // The checkout session's cart is now consumed server-side — the next
      // visit to /cart should start a fresh one, not show the just-ordered items.
      clearStoredCartId();
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },

    onError: (error: unknown) => {
      if (error instanceof ApiError && error.code === "ORDER_STOCK_UNAVAILABLE") {
        toast.error("Some items in your cart are no longer in stock.");
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't place your order. Please try again.",
      );
    },
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input?: CancelOrderInput }) =>
      cancelOrder(orderId, input),

    onSuccess: (order) => {
      // PATCH .../cancel returns a bare order row with no `subOrders` (a real
      // backend inconsistency vs. GET, see orderCancelResponseSchema in
      // @nova/validation) — refetch the full detail rather than caching this
      // partial shape directly, which would silently drop subOrders from the UI.
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Order cancelled");
    },

    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Couldn't cancel this order.");
    },
  });
}
