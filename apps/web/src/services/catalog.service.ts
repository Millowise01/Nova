import type { ListProductsParams } from "@nova/api-client";

import { getApiClient } from "./api";

export function listProducts(params: ListProductsParams = {}) {
  return getApiClient().catalog.listProducts(params);
}

export function getProductBySlug(slug: string) {
  return getApiClient().catalog.getProductBySlug(slug);
}

// getCategories()/getPopularBrands() are intentionally NOT here — there is no
// GET /categories or GET /brands endpoint on the backend (only POST/create).
// See features/home/home.queries.ts for where the previous mock category/brand
// data is still used, explicitly marked as such.
