"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Money } from "@nova/types";
import type { CartResponse } from "@nova/validation";

import { useToast } from "@/providers/toast-provider";
import { addLine, ensureCartId } from "@/services/cart-checkout.service";

import { cartKeys } from "./cart.keys";

export interface AddToCartInput {
  variantId: string;
  quantity: number;
  unitPrice: Money;
}

function addLineOptimistically(cart: CartResponse, input: AddToCartInput): CartResponse {
  const existing = cart.lines.find((line) => line.variantId === input.variantId);

  const lines = existing
    ? cart.lines.map((line) =>
        line.variantId === input.variantId
          ? { ...line, quantity: line.quantity + input.quantity }
          : line,
      )
    : [
        ...cart.lines,
        {
          id: `optimistic-${input.variantId}`,
          cartId: cart.id,
          variantId: input.variantId,
          quantity: input.quantity,
          unitPriceAmount: input.unitPrice.amount,
          unitPriceCurrency: input.unitPrice.currency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ];

  const subtotalAmount = lines
    .reduce((sum, line) => sum + Number(line.unitPriceAmount) * line.quantity, 0)
    .toFixed(2);

  return { ...cart, lines, subtotal: { amount: subtotalAmount, currency: cart.subtotal.currency } };
}

/** onMutate writes an optimistic guess, onSettled always reconciles against the
 *  real server response, onError rolls back — per docs/frontend/01-data-fetching-
 *  conventions.md's named Vol 6 optimistic-UI requirement. */
export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const cartId = await ensureCartId();
      await addLine(cartId, { variantId: input.variantId, quantity: input.quantity });
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() });
      const previousCart = queryClient.getQueryData<CartResponse>(cartKeys.detail());

      if (previousCart) {
        queryClient.setQueryData<CartResponse>(
          cartKeys.detail(),
          addLineOptimistically(previousCart, input),
        );
      }

      return { previousCart };
    },

    onError: (_err, _input, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(), context.previousCart);
      }
      toast.error("Couldn't add that to your cart. Please try again.");
    },

    onSuccess: () => {
      toast.success("Added to cart");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}
