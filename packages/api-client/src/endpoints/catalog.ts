import {
  brandListResponseSchema,
  categoryListResponseSchema,
  productDetailSchema,
  productListResponseSchema,
  sellerPublicProfileSchema,
  type BrandListResponse,
  type CategoryListResponse,
  type ProductDetailResponse,
  type ProductListResponse,
  type SellerPublicProfileResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export interface ListProductsParams {
  cursor?: string;
  limit?: number;
  featured?: boolean;
  flashSale?: boolean;
  categoryId?: string;
  brandId?: string;
  sellerId?: string;
  /** Full-text search over title+description (Batch B) — Postgres tsvector/tsquery,
   *  ranked by relevance. Combines with every filter above. */
  q?: string;
  minPrice?: string;
  maxPrice?: string;
}

/** Query-string booleans must be the literal string "true"/"false" — the backend's
 *  listProductsQuerySchema parses them from that, not from any truthy JS value (see
 *  its comment for why z.coerce.boolean() would be wrong here). */
function toQueryParams(params: ListProductsParams) {
  return {
    ...params,
    featured: params.featured === undefined ? undefined : String(params.featured),
    flashSale: params.flashSale === undefined ? undefined : String(params.flashSale),
  };
}

export function createCatalogEndpoints(client: NovaHttpClient) {
  return {
    async listProducts(params: ListProductsParams = {}): Promise<ProductListResponse> {
      const response = await client.get<unknown>("/products", { params: toQueryParams(params) });
      return productListResponseSchema.parse(response.data);
    },

    async getProductBySlug(slug: string): Promise<ProductDetailResponse> {
      const response = await client.get<ApiEnvelope>(`/products/${slug}`);
      return productDetailSchema.parse(response.data.data);
    },

    async listCategories(): Promise<CategoryListResponse> {
      const response = await client.get<unknown>("/categories");
      return categoryListResponseSchema.parse(response.data);
    },

    async listBrands(): Promise<BrandListResponse> {
      const response = await client.get<unknown>("/brands");
      return brandListResponseSchema.parse(response.data);
    },

    /** GET /v1/sellers/:id — public storefront profile, no auth required. */
    async getSellerProfile(sellerId: string): Promise<SellerPublicProfileResponse> {
      const response = await client.get<ApiEnvelope>(`/sellers/${sellerId}`);
      return sellerPublicProfileSchema.parse(response.data.data);
    },

    /** GET /v1/sellers/:id/products — public, no auth required. */
    async listSellerProducts(
      sellerId: string,
      params: Omit<ListProductsParams, "sellerId"> = {},
    ): Promise<ProductListResponse> {
      const response = await client.get<unknown>(`/sellers/${sellerId}/products`, {
        params: toQueryParams(params),
      });
      return productListResponseSchema.parse(response.data);
    },
  };
}
