import {
  cartCreateResponseSchema,
  cartSchema,
  checkoutSessionSchema,
  type AddCartLineInput,
  type CartCreateResponse,
  type CartResponse,
  type CheckoutFormValues,
  type CheckoutSessionResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export function createCartCheckoutEndpoints(client: NovaHttpClient) {
  return {
    async createCart(): Promise<CartCreateResponse> {
      const response = await client.post<ApiEnvelope>("/cart");
      return cartCreateResponseSchema.parse(response.data.data);
    },

    async getCart(cartId: string): Promise<CartResponse> {
      const response = await client.get<ApiEnvelope>(`/cart/${cartId}`);
      return cartSchema.parse(response.data.data);
    },

    async addLine(cartId: string, input: AddCartLineInput): Promise<void> {
      // Response is the created line row, but callers always refetch the cart
      // afterward for the authoritative subtotal — no separate schema needed here.
      await client.post(`/cart/${cartId}/lines`, input);
    },

    async createCheckoutSession(
      cartId: string,
      input: CheckoutFormValues,
    ): Promise<CheckoutSessionResponse> {
      const response = await client.post<ApiEnvelope>(`/carts/${cartId}/checkout/session`, input);
      return checkoutSessionSchema.parse(response.data.data);
    },
  };
}
