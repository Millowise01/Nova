/** There is no "get my cart" endpoint — a cart is only addressable by the
 *  `cartId` returned from POST /cart, and that works for both guest and
 *  authenticated users identically (confirmed: no auth header was needed for
 *  any cart endpoint in live testing). Persisting the id client-side is the
 *  standard guest-cart pattern and is what makes the cart survive a reload. */
const CART_ID_STORAGE_KEY = "nova_cart_id";

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_ID_STORAGE_KEY);
}

export function setStoredCartId(cartId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
}

export function clearStoredCartId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_ID_STORAGE_KEY);
}
