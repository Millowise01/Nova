import type { CancelOrderInput } from "@nova/validation";

import { getApiClient } from "./api";

export function createOrder(checkoutSessionId: string, idempotencyKey: string) {
  return getApiClient().orders.createOrder(checkoutSessionId, idempotencyKey);
}

export function getOrder(orderId: string) {
  return getApiClient().orders.getOrder(orderId);
}

export function listOrders() {
  return getApiClient().orders.listOrders();
}

export function cancelOrder(orderId: string, input?: CancelOrderInput) {
  return getApiClient().orders.cancelOrder(orderId, input);
}
