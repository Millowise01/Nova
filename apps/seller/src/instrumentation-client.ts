import * as Sentry from "@sentry/nextjs";

import { sentryBeforeSend } from "./lib/sentry-before-send";

// O-2 — Next.js's dedicated client instrumentation entry point (stable since
// Next 15.3, auto-loaded — nothing imports this file). Runs in the browser
// bundle, so NEXT_PUBLIC_SENTRY_DSN must appear as this exact literal
// `process.env.NEXT_PUBLIC_X` expression for Next to inline it at build time
// (see packages/config/src/index.ts's getEnvironment() comment for the real
// production bug this project already hit from reading it any other way).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0,
    beforeSend: sentryBeforeSend,
  });
}
