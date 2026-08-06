import {
  orderCancelResponseSchema,
  orderCreateResponseSchema,
  orderSchema,
  type CancelOrderInput,
  type OrderCancelResponse,
  type OrderCreateResponse,
  type OrderResponse,
} from "@nova/validation";

import type { ApiEnvelope, NovaHttpClient } from "../http-client";

export function createOrdersEndpoints(client: NovaHttpClient) {
  return {
    /** `idempotencyKey` must be generated once per user attempt (e.g. on "Place
     *  Order" click) and reused verbatim across retries of that SAME attempt —
     *  never generated fresh per HTTP call. Callers own the key's lifecycle. */
    async createOrder(
      checkoutSessionId: string,
      idempotencyKey: string,
    ): Promise<OrderCreateResponse> {
      const response = await client.post<ApiEnvelope>(
        "/orders",
        { checkoutSessionId },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );
      return orderCreateResponseSchema.parse(response.data.data);
    },

    async getOrder(orderId: string): Promise<OrderResponse> {
      const response = await client.get<ApiEnvelope>(`/orders/${orderId}`);
      return orderSchema.parse(response.data.data);
    },

    async listOrders(): Promise<OrderResponse[]> {
      const response = await client.get<ApiEnvelope>("/orders");
      return orderSchema.array().parse(response.data.data);
    },

    async cancelOrder(orderId: string, input: CancelOrderInput = {}): Promise<OrderCancelResponse> {
      const response = await client.patch<ApiEnvelope>(`/orders/${orderId}/cancel`, input);
      return orderCancelResponseSchema.parse(response.data.data);
    },
  };
}
