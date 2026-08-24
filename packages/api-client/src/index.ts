import { createAuthEndpoints } from "./endpoints/auth";
import { createCartCheckoutEndpoints } from "./endpoints/cart-checkout";
import { createCatalogEndpoints } from "./endpoints/catalog";
import { createFinanceEndpoints } from "./endpoints/finance";
import { createNotificationsEndpoints } from "./endpoints/notifications";
import { createOrdersEndpoints } from "./endpoints/orders";
import { createTrustSafetyEndpoints } from "./endpoints/trust-safety";
import { createWalletEndpoints } from "./endpoints/wallet";
import { createWishlistEndpoints } from "./endpoints/wishlist";
import { createApiClient as createHttpClient, type NovaHttpClient } from "./http-client";

export { ApiError, toApiError, type ApiErrorShape } from "./errors";
export { tokenStore } from "./token-store";
export { createApiClient } from "./http-client";
export type { NovaHttpClient } from "./http-client";
export type { ListProductsParams } from "./endpoints/catalog";
export type { ListNotificationsParams } from "./endpoints/notifications";

export interface NovaApiClient {
  raw: NovaHttpClient;
  auth: ReturnType<typeof createAuthEndpoints>;
  catalog: ReturnType<typeof createCatalogEndpoints>;
  cart: ReturnType<typeof createCartCheckoutEndpoints>;
  orders: ReturnType<typeof createOrdersEndpoints>;
  wallet: ReturnType<typeof createWalletEndpoints>;
  wishlist: ReturnType<typeof createWishlistEndpoints>;
  notifications: ReturnType<typeof createNotificationsEndpoints>;
  finance: ReturnType<typeof createFinanceEndpoints>;
  trustSafety: ReturnType<typeof createTrustSafetyEndpoints>;
}

/** The single, typed, Zod-validated client for the whole app — every response
 *  is validated against the same schemas the backend's ZodValidationPipe (and,
 *  on the request side, the backend itself) uses, sourced from @nova/validation. */
export function createNovaApiClient(baseURL: string): NovaApiClient {
  const raw = createHttpClient(baseURL);

  return {
    raw,
    auth: createAuthEndpoints(raw),
    catalog: createCatalogEndpoints(raw),
    cart: createCartCheckoutEndpoints(raw),
    orders: createOrdersEndpoints(raw),
    wallet: createWalletEndpoints(raw),
    wishlist: createWishlistEndpoints(raw),
    notifications: createNotificationsEndpoints(raw),
    finance: createFinanceEndpoints(raw),
    trustSafety: createTrustSafetyEndpoints(raw),
  };
}
