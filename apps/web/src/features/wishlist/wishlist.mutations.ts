"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AddWishlistItemInput, WishlistResponse } from "@nova/validation";

import { useToast } from "@/providers/toast-provider";
import { addWishlistItem, removeWishlistItem } from "@/services/wishlist.service";

import { wishlistKeys } from "./wishlist.keys";

export interface AddToWishlistInput extends AddWishlistItemInput {
  /** Optional — lets the caller (e.g. ProductScreen, which already has the full
   *  product loaded) show the real title/link immediately instead of a brief
   *  "no longer available" flash until onSettled's refetch resolves it. */
  optimisticProduct?: { id: string; title: string; slug: string };
}

/** onMutate writes an optimistic guess, onSettled always reconciles against the
 *  real server response, onError rolls back — same pattern as
 *  features/cart/cart.mutations.ts's useAddToCartMutation. */
export function useAddToWishlistMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ optimisticProduct: _optimisticProduct, ...input }: AddToWishlistInput) =>
      addWishlistItem(input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.detail() });
      const previous = queryClient.getQueryData<WishlistResponse>(wishlistKeys.detail());

      if (previous && !previous.items.some((item) => item.productId === input.productId)) {
        queryClient.setQueryData<WishlistResponse>(wishlistKeys.detail(), {
          ...previous,
          items: [
            ...previous.items,
            {
              id: `optimistic-${input.productId}`,
              wishlistId: previous.id,
              productId: input.productId,
              variantId: input.variantId ?? null,
              createdAt: new Date().toISOString(),
              deletedAt: null,
              product: input.optimisticProduct ?? null,
            },
          ],
        });
      }

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.detail(), context.previous);
      }
      toast.error("Couldn't add that to your wishlist. Please try again.");
    },

    onSuccess: () => {
      toast.success("Added to wishlist");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.detail() });
    },
  });
}

export function useRemoveFromWishlistMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId: string) => removeWishlistItem(itemId),

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.detail() });
      const previous = queryClient.getQueryData<WishlistResponse>(wishlistKeys.detail());

      if (previous) {
        queryClient.setQueryData<WishlistResponse>(wishlistKeys.detail(), {
          ...previous,
          items: previous.items.filter((item) => item.id !== itemId),
        });
      }

      return { previous };
    },

    onError: (_err, _itemId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(wishlistKeys.detail(), context.previous);
      }
      toast.error("Couldn't remove that from your wishlist. Please try again.");
    },

    onSuccess: () => {
      toast.success("Removed from wishlist");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.detail() });
    },
  });
}
