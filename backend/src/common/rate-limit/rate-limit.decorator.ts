import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_KEY = "rateLimit";

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

/** Vol 3, C1/C4: application-layer, Redis-backed, per-account/per-endpoint rate
 *  limiting — a distinct control from the edge-layer (Cloudflare) limiting, which is
 *  infrastructure and out of scope for this pass. */
export const RateLimit = (limit: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowSeconds } satisfies RateLimitOptions);
