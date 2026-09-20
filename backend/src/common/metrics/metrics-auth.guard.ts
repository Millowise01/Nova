import { createHash, timingSafeEqual } from "node:crypto";

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { AppConfigService } from "../../config/config.service";
import { NotFoundError, UnauthorizedError } from "../errors/api-error";

/** Protects GET /metrics. The endpoint exposes route patterns and process internals, so
 *  it fails closed (backend/docs/05-security-baseline.md, "Metrics endpoint"):
 *   - METRICS_TOKEN set      -> "Authorization: Bearer <token>" is required, in every
 *                               environment, compared in constant time.
 *   - unset, production      -> 404, as if the route did not exist (metrics are off).
 *   - unset, non-production  -> open, so local development and tests keep working. */
@Injectable()
export class MetricsAuthGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const token = this.config.get("METRICS_TOKEN");

    if (!token) {
      if (this.config.get("NODE_ENV") === "production") {
        throw new NotFoundError("NOT_FOUND", "Not found");
      }
      return true;
    }

    const header = context.switchToHttp().getRequest<Request>().headers.authorization;
    if (!header) {
      throw new UnauthorizedError("MISSING_BEARER_TOKEN", "Metrics token required");
    }

    const [scheme, presented] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !presented || !digestEquals(presented, token)) {
      throw new UnauthorizedError("INVALID_METRICS_TOKEN", "Invalid metrics token");
    }
    return true;
  }
}

/** Hash both sides first so timingSafeEqual always compares equal-length buffers — the
 *  comparison time then reveals neither the token's contents nor its length. */
function digestEquals(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
