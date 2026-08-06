import { createNovaApiClient, type NovaApiClient } from "@nova/api-client";
import { getEnvironment } from "@nova/config";

/**
 * Client-side only. The api-client's access token lives in an in-memory,
 * module-level singleton (see @nova/api-client/token-store) — safe here
 * because each browser tab genuinely has its own JS module instance, which
 * is NOT true on the server (one Node process serves many users' requests),
 * so this client is never used for authenticated server-side/RSC data
 * fetching. All authenticated queries in this app run from "use client"
 * components via React Query hooks instead. The previous version of this
 * file tried to forward the `nova_session` cookie as a Bearer token — that
 * cookie is a {userId, roles, expiresAt} summary for middleware route
 * guards (apps/web/middleware.ts), never a real JWT, so it could never have
 * worked as API auth.
 */

declare global {
  var __novaApiClient: NovaApiClient | undefined;
}

export function getApiClient(): NovaApiClient {
  if (typeof window === "undefined") {
    throw new Error(
      'getApiClient() is client-side only — call it from a "use client" component/hook, not during SSR/RSC rendering.',
    );
  }

  globalThis.__novaApiClient ??= createNovaApiClient(getEnvironment().NEXT_PUBLIC_API_BASE_URL);
  return globalThis.__novaApiClient;
}
