import {
  wishlistItemSchema,
  wishlistSchema,
  type AddWishlistItemInput,
  type WishlistItemResponse,
  type WishlistResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export function createWishlistEndpoints(client: NovaHttpClient) {
  return {
    async getWishlist(): Promise<WishlistResponse> {
      const response = await client.get<ApiEnvelope>("/wishlist");
      return wishlistSchema.parse(response.data.data);
    },

    async addItem(input: AddWishlistItemInput): Promise<WishlistItemResponse> {
      const response = await client.post<ApiEnvelope>("/wishlist/items", input);
      return wishlistItemSchema.parse(response.data.data);
    },

    async removeItem(itemId: string): Promise<void> {
      await client.delete(`/wishlist/items/${itemId}`);
    },
  };
}
