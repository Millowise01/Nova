import { createNovaApiClient, type NovaApiClient } from "@nova/api-client";
import { getEnvironment } from "@nova/config";

/** Client-side only — same reasoning as apps/web and apps/admin's version:
 *  the api-client's access token lives in an in-memory, module-level singleton,
 *  safe per-browser-tab but never usable for server-side/RSC data fetching. */

declare global {
  var __novaSellerApiClient: NovaApiClient | undefined;
}

export function getApiClient(): NovaApiClient {
  if (typeof window === "undefined") {
    throw new Error(
      'getApiClient() is client-side only — call it from a "use client" component/hook, not during SSR/RSC rendering.',
    );
  }

  globalThis.__novaSellerApiClient ??= createNovaApiClient(
    getEnvironment().NEXT_PUBLIC_API_BASE_URL,
  );
  return globalThis.__novaSellerApiClient;
}
