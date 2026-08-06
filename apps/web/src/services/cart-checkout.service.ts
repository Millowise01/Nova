import type { AddCartLineInput, CheckoutFormValues } from "@nova/validation";

import { clearStoredCartId, getStoredCartId, setStoredCartId } from "@/lib/cart-id-store";

import { getApiClient } from "./api";

/** Gets the persisted cart id, creating a new cart on the backend if none is
 *  stored yet. A cart is addressable purely by id — there is no "get my
 *  cart" lookup, so the id itself is what's persisted (localStorage),
 *  identically for guest and authenticated users (confirmed: no auth header
 *  is required by any cart endpoint). */
export async function ensureCartId(): Promise<string> {
  const existing = getStoredCartId();
  if (existing) return existing;

  const { cartId } = await getApiClient().cart.createCart();
  setStoredCartId(cartId);
  return cartId;
}

export async function getCart(cartId: string) {
  try {
    return await getApiClient().cart.getCart(cartId);
  } catch (error) {
    // A stale/invalid persisted cart id (e.g. local dev DB was reset) shouldn't
    // brick the cart permanently — drop it so the next ensureCartId() call
    // creates a fresh one instead of repeating a 404 forever.
    clearStoredCartId();
    throw error;
  }
}

export async function addLine(cartId: string, input: AddCartLineInput): Promise<void> {
  await getApiClient().cart.addLine(cartId, input);
}

export async function createCheckoutSession(cartId: string, input: CheckoutFormValues) {
  return getApiClient().cart.createCheckoutSession(cartId, input);
}
