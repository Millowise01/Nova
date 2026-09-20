import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import type { Request, Response } from "express";
import type { Histogram } from "prom-client";
import { tap } from "rxjs";

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("http_request_duration_seconds")
    private readonly histogram: Histogram<"method" | "route" | "status_code">,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => this.record(request, response.statusCode, start),
        // The exception filter hasn't written the real status yet when this
        // fires, so response.statusCode is still Express's default 200 —
        // read it off the exception instead, or every error counts as a success.
        error: (err: unknown) =>
          this.record(
            request,
            err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
            start,
          ),
      }),
    );
  }

  private record(request: Request, statusCode: number, start: bigint) {
    // The matched Express route pattern ("/orders/:id"), never the raw URL —
    // the raw URL would give every distinct order UUID ever requested its
    // own label, which is exactly the unbounded-cardinality trap Prometheus
    // histograms are built to avoid.
    // @types/express types Request.route as `any` — narrowed here just
    // enough to read the matched route pattern without an unsafe access.
    const matchedRoute = (request.route as { path?: string } | undefined)?.path;
    const route = matchedRoute ? `${request.baseUrl}${matchedRoute}` : "unmatched";
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    this.histogram.labels(request.method, route, String(statusCode)).observe(seconds);
  }
}
