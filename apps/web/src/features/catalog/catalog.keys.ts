import type { ListProductsParams } from "@nova/api-client";

// Query key factory per docs/frontend/01-data-fetching-conventions.md's proposed
// convention — one place generates every key for this entity.
export const catalogKeys = {
  all: ["catalog"] as const,
  products: () => [...catalogKeys.all, "products"] as const,
  productList: (filters: Omit<ListProductsParams, "cursor"> = {}) =>
    [...catalogKeys.products(), "list", filters] as const,
  productDetail: (slug: string) => [...catalogKeys.products(), "detail", slug] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  brands: () => [...catalogKeys.all, "brands"] as const,
  sellers: () => [...catalogKeys.all, "sellers"] as const,
  sellerProfile: (sellerId: string) => [...catalogKeys.sellers(), sellerId] as const,
  sellerProducts: (
    sellerId: string,
    filters: Omit<ListProductsParams, "cursor" | "sellerId"> = {},
  ) => [...catalogKeys.sellers(), sellerId, "products", filters] as const,
};
