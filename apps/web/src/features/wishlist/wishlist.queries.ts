"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/config/app";
import { useAuth } from "@/providers/auth-provider";
import { getWishlist } from "@/services/wishlist.service";

import { wishlistKeys } from "./wishlist.keys";

export function useWishlistQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: wishlistKeys.detail(),
    queryFn: () => getWishlist(),
    staleTime: QUERY_STALE_TIME.short,
    enabled: isAuthenticated,
  });
}
