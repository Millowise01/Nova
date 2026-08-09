"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { ListProductsParams } from "@nova/api-client";

import { QUERY_STALE_TIME } from "@/config/app";
import {
  getProductBySlug,
  getSellerProfile,
  listBrands,
  listCategories,
  listProducts,
  listSellerProducts,
} from "@/services/catalog.service";

import { catalogKeys } from "./catalog.keys";

/** Cursor pagination via useInfiniteQuery, per the backend's cursor envelope
 *  ({ data, pageInfo: { hasMore, nextCursor } }) mapped exactly as
 *  docs/frontend/01-data-fetching-conventions.md proposes. `filters` (featured/
 *  flashSale/categoryId/brandId) is part of the query key, so e.g. the flash-sales
 *  view and the unfiltered catalog view are cached independently. */
export function useProductsQuery(filters: Omit<ListProductsParams, "cursor"> = {}) {
  return useInfiniteQuery({
    queryKey: catalogKeys.productList(filters),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      listProducts({ ...filters, cursor: pageParam }),
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

export function useCategoriesQuery() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => listCategories(),
    staleTime: QUERY_STALE_TIME.long,
  });
}

export function useBrandsQuery() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: () => listBrands(),
    staleTime: QUERY_STALE_TIME.long,
  });
}

export function useSellerProfileQuery(sellerId: string) {
  return useQuery({
    queryKey: catalogKeys.sellerProfile(sellerId),
    queryFn: () => getSellerProfile(sellerId),
    staleTime: QUERY_STALE_TIME.medium,
    enabled: sellerId.length > 0,
  });
}

export function useSellerProductsQuery(
  sellerId: string,
  filters: Omit<ListProductsParams, "cursor" | "sellerId"> = {},
) {
  return useInfiniteQuery({
    queryKey: catalogKeys.sellerProducts(sellerId, filters),
    queryFn: ({ pageParam }: { pageParam?: string }) =>
      listSellerProducts(sellerId, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? (lastPage.pageInfo.nextCursor ?? undefined) : undefined,
    staleTime: QUERY_STALE_TIME.medium,
    enabled: sellerId.length > 0,
  });
}
