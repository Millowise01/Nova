import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { makeHistogramProvider, PrometheusModule } from "@willsoto/nestjs-prometheus";

import { HttpMetricsInterceptor } from "./http-metrics.interceptor";
import { ProtectedMetricsController } from "./metrics.controller";

/**
 * O-3 — minimal request metrics. backend/docs/06-testing-strategy.md names
 * checkout, search, and order-status update as the SLO-critical paths, but
 * none of them has a unique route of its own worth hand-picking: checkout
 * is POST /carts/:cartId/checkout/session, search is GET /products?q=... (no
 * separate search route), and order status is just a field on GET
 * /orders/:id. Rather than special-casing three routes, this exposes one
 * standard http_request_duration_seconds histogram labeled by {method,
 * route, status_code} for every request — the idiomatic Prometheus HTTP
 * metrics shape. Checkout/search/order-status p50/p95 latency is then just
 * those specific label values selected out of the same histogram at query
 * time; nothing about them needs special treatment here.
 *
 * Sentry Performance (O-2) isn't used for this instead — O-2 deliberately
 * set tracesSampleRate: 0 to keep Sentry scoped to error tracking only;
 * turning tracing on for every request would be a much bigger, broader
 * change than this ticket calls for, and Prometheus is free/OSS with no new
 * account needed.
 */
@Module({
  imports: [
    PrometheusModule.register({
      // main.ts excludes "metrics" from the global "v1" prefix so this is
      // served at the conventional root /metrics path scrapers expect. The
      // controller is guarded by METRICS_TOKEN (see metrics-auth.guard.ts).
      controller: ProtectedMetricsController,
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    makeHistogramProvider({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds, labeled by method, matched route pattern, and status code.",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
})
export class MetricsModule {}
