import {
  productDetailSchema,
  productListResponseSchema,
  type ProductDetailResponse,
  type ProductListResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export interface ListProductsParams {
  cursor?: string;
  limit?: number;
}

export function createCatalogEndpoints(client: NovaHttpClient) {
  return {
    async listProducts(params: ListProductsParams = {}): Promise<ProductListResponse> {
      const response = await client.get<unknown>("/products", { params });
      return productListResponseSchema.parse(response.data);
    },

    async getProductBySlug(slug: string): Promise<ProductDetailResponse> {
      const response = await client.get<ApiEnvelope>(`/products/${slug}`);
      return productDetailSchema.parse(response.data.data);
    },

    // No GET /categories or GET /brands list endpoint exists on the backend today
    // (only POST/create) — see backend/src/modules/catalog/http/catalog.controller.ts.
    // Categories/brands are only otherwise observable nested inside a product
    // detail response (productDetailSchema.category / .brand).
  };
}
