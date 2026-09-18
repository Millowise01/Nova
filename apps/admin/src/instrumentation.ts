import * as Sentry from "@sentry/nextjs";

import { sentryBeforeSend } from "./lib/sentry-before-send";

/**
 * O-2 — Next.js's own instrumentation hook (stable since Next 15, no
 * experimental flag needed), runs once per server/edge runtime at startup.
 * register() is where Sentry.init() belongs for those two runtimes; the
 * browser runtime is instrumentation-client.ts instead (Next loads it
 * automatically — nothing imports it).
 *
 * A Sentry DSN is not a secret (it's designed to be embedded in client-side
 * JS the browser sends requests to), so the same NEXT_PUBLIC_SENTRY_DSN is
 * reused for all three runtimes rather than keeping a separate server-only
 * name — one fewer env var to keep in sync.
 */
export function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0,
    beforeSend: sentryBeforeSend,
  });
}

// Reports React Server Component / route handler errors Next.js catches
// internally (the counterpart to error.tsx's captureException call, which
// only covers client-rendered errors).
export const onRequestError = Sentry.captureRequestError;
