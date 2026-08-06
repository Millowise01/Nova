// Query key factory per docs/frontend/01-data-fetching-conventions.md's proposed
// convention — one place generates every key for this entity.
export const catalogKeys = {
  all: ["catalog"] as const,
  products: () => [...catalogKeys.all, "products"] as const,
  productList: (cursor?: string) => [...catalogKeys.products(), "list", cursor ?? null] as const,
  productDetail: (slug: string) => [...catalogKeys.products(), "detail", slug] as const,
};
