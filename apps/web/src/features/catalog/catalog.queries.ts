"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { catalogKeys } from "./catalog.keys";

import { QUERY_STALE_TIME } from "@/config/app";
import { getProductBySlug, listProducts } from "@/services/catalog.service";

/** Cursor pagination via useInfiniteQuery, per the backend's cursor envelope
 *  ({ data, pageInfo: { hasMore, nextCursor } }) mapped exactly as
 *  docs/frontend/01-data-fetching-conventions.md proposes. */
export function useProductsQuery() {
  return useInfiniteQuery({
    queryKey: catalogKeys.products(),
    queryFn: ({ pageParam }: { pageParam?: string }) => listProducts({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? (lastPage.pageInfo.nextCursor ?? undefined) : undefined,
    staleTime: QUERY_STALE_TIME.medium,
  });
}

export function useProductQuery(slug: string) {
  return useQuery({
    queryKey: catalogKeys.productDetail(slug),
    queryFn: () => getProductBySlug(slug),
    staleTime: QUERY_STALE_TIME.medium,
    enabled: slug.length > 0,
  });
}
