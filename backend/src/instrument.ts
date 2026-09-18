/**
 * O-2 — must be imported before ANY other module, including "reflect-metadata"
 * in main.ts — Sentry's Node SDK instruments other packages (http, pg, etc.)
 * by patching them at require-time, which only works if Sentry.init() runs
 * before those packages are first required anywhere in the process. This file
 * exists solely so that ordering is enforced by a single, obvious import
 * line at the very top of main.ts, rather than relying on init() being
 * called early enough inside a larger bootstrap function.
 *
 * Reads SENTRY_DSN directly from process.env, not through AppConfigService —
 * deliberately, the same reasoning @nova/config's getEnvironment() documents
 * for the frontend: this needs to run before Nest's DI container (and
 * therefore ConfigModule) exists at all. envSchema.ts still validates
 * SENTRY_DSN's shape for every OTHER consumer of config in this app; this is
 * the one place that reads process.env directly, and it's disclosed here for
 * exactly that reason (backend/docs/05-security-baseline.md's "ConfigService
 * is the only place that reads process.env" rule — this is the documented
 * exception, not a violation of it).
 */
import * as Sentry from "@sentry/nestjs";

import { getCurrentCorrelationId } from "./common/logging/correlation-context";

const dsn = process.env.SENTRY_DSN;

// No DSN configured (local dev without one, or a test run) — Sentry simply
// never initializes rather than throwing or silently no-op-sending events to
// a placeholder project. Every SDK call elsewhere in the app becomes a no-op
// automatically when the client was never initialized.
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    // Errors only for O-2 — no performance/tracing sampling. Vol 3, D2's
    // logging-redaction rule applies here the same way it applies to Pino
    // (logging.module.ts): tracesSampleRate: 0 means request bodies/headers
    // are never captured as span data at all, only exception payloads.
    tracesSampleRate: 0,
    // O-1 — the same request correlation ID that tags every Pino log line
    // also tags the matching Sentry event, so a real incident can be
    // traced from "user reports an error" -> Sentry event -> exact
    // correlationId -> every structured log line for that same request.
    beforeSend(event) {
      const correlationId = getCurrentCorrelationId();
      if (correlationId) {
        event.tags = { ...event.tags, correlationId };
      }
      return event;
    },
  });
}
