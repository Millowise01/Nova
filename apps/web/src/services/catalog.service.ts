import type { ListProductsParams } from "@nova/api-client";

import { getApiClient } from "./api";

export function listProducts(params: ListProductsParams = {}) {
  return getApiClient().catalog.listProducts(params);
}

export function getProductBySlug(slug: string) {
  return getApiClient().catalog.getProductBySlug(slug);
}

export function listCategories() {
  return getApiClient().catalog.listCategories();
}

export function listBrands() {
  return getApiClient().catalog.listBrands();
}

export function getSellerProfile(sellerId: string) {
  return getApiClient().catalog.getSellerProfile(sellerId);
}

export function listSellerProducts(
  sellerId: string,
  params: Omit<ListProductsParams, "sellerId"> = {},
) {
  return getApiClient().catalog.listSellerProducts(sellerId, params);
}
