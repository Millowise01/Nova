"use client";

import { useQuery } from "@tanstack/react-query";

import { getApiClient } from "@/services/api";

/** GET /v1/products?sellerId= — the same public listing endpoint apps/web uses,
 *  filtered to the logged-in seller's own products. There's no dedicated "my
 *  products" endpoint, but this filter is real and already used the identical
 *  way by GET /v1/sellers/:id/products (backend's own storefront route). */
export function useMyProductsQuery(sellerId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "my-products", sellerId],
    queryFn: () => getApiClient().catalog.listProducts({ sellerId }),
    enabled: !!sellerId,
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: () => getApiClient().catalog.listCategories(),
  });
}
