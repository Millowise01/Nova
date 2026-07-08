/**
 * Centralized query key factory.
 * Ensures consistent cache key structure across all features.
 */
export const queryKeys = {
  auth: {
    session: () => ["auth", "session"] as const,
  },
  catalog: {
    categories: () => ["catalog", "categories"] as const,
    brands: () => ["catalog", "brands"] as const,
    products: {
      featured: () => ["catalog", "products", "featured"] as const,
      trending: () => ["catalog", "products", "trending"] as const,
      bestSellers: () => ["catalog", "products", "best-sellers"] as const,
      detail: (slug: string) => ["catalog", "products", slug] as const,
    },
  },
  search: {
    trending: () => ["search", "trending"] as const,
    results: (query: string) => ["search", "results", query] as const,
  },
  orders: {
    all: () => ["orders"] as const,
    detail: (id: string) => ["orders", id] as const,
  },
  cart: {
    current: () => ["cart"] as const,
  },
} as const;
