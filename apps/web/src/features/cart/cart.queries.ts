"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/config/app";
import { ensureCartId, getCart } from "@/services/cart-checkout.service";

import { cartKeys } from "./cart.keys";

export function useCartQuery() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: async () => {
      const cartId = await ensureCartId();
      return getCart(cartId);
    },
    staleTime: QUERY_STALE_TIME.short,
  });
}
