import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

import { AppConfigService } from "../../config/config.service";

import { getCurrentCorrelationId } from "./correlation-context";

/** O-1 — structured (JSON) logging via Pino, replacing Nest's default logger
 *  (wired in main.ts via app.useLogger()). Two ways a log line picks up the
 *  request's correlation ID, covering both request-bound and deeper call
 *  sites:
 *  - `genReqId` reuses CorrelationIdMiddleware's ID as pino-http's own
 *    `req.id`, so the automatic per-request access log (one line per
 *    request: method, url, status, response time) is tagged directly.
 *  - `mixin` reads the SAME ID from AsyncLocalStorage (correlation-context.ts)
 *    and merges it into every other log line written during that request —
 *    this is what reaches existing `new Logger(ClassName)` call sites in
 *    backend/src/modules/* without editing any of them (see that file's own
 *    comment for why this works). */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.get("LOG_LEVEL"),
          // pino-http's genReqId operates at the raw Node http.IncomingMessage
          // level (below Express) — correlationId is attached to it by
          // CorrelationIdMiddleware, registered in AppModule.configure()
          // ahead of this module's own middleware (empirically verified: a
          // root module's configure() runs before an imported module's —
          // see AppModule's own comment for why that ordering matters here,
          // found the hard way when this was briefly registered in main.ts
          // instead and broke every integration test). The fallback is
          // defensive only (satisfies pino-http's non-undefined ReqId type)
          // — it should never actually be hit given that ordering.
          genReqId: (req: IncomingMessage & { correlationId?: string }) =>
            req.correlationId ?? `req_${randomUUID()}`,
          mixin: () => {
            const correlationId = getCurrentCorrelationId();
            return correlationId ? { correlationId } : {};
          },
          // Never let a bearer token, refresh token, or password reach a log
          // line, structured or not — Vol 3, D2's secrets-handling rule
          // applied to logging output specifically, not just source control.
          redact: {
            paths: [
              "req.headers.authorization",
              "req.headers.cookie",
              "res.headers['set-cookie']",
              "*.password",
              "*.confirmPassword",
              "*.accessToken",
              "*.refreshToken",
            ],
            censor: "[REDACTED]",
          },
          // Pretty-printed only outside production — real environments get
          // raw JSON (what O-1's "done when" actually asks for: a structured
          // log line, not a human-formatted one).
          transport:
            config.get("NODE_ENV") === "development"
              ? { target: "pino-pretty", options: { singleLine: true } }
              : undefined,
        },
      }),
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
