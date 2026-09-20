import { z } from "@nova/validation";

// Backend-only env — never exposed to a client, unlike @nova/config's NEXT_PUBLIC_*
// schema. Validated once at boot; every other module reads config through
// ConfigService, never process.env directly (backend/docs/05-security-baseline.md).
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  // RS256 keypair, base64-encoded PEM (backend/docs/05-security-baseline.md: any module —
  // and eventually any extracted microservice — verifies a token with the public key alone,
  // without holding the private signing key).
  JWT_ACCESS_PRIVATE_KEY: z.string().min(1),
  JWT_ACCESS_PUBLIC_KEY: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),
  PII_ENCRYPTION_KEY: z.string().min(1),
  // Comma-separated allowlist — Vol 3, C1's application-layer complement to the
  // Cloudflare edge (which is infrastructure, out of scope this pass). Never "*".
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  // O-1 structured logging (backend/src/common/logging/). "info" in every real
  // environment; only ever raised locally to debug a specific issue.
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  // O-2 error tracking. Optional — instrument.ts only calls Sentry.init() when
  // this is set, so a local dev machine or a test run with no DSN configured
  // just never reports anywhere, rather than needing a real project to boot.
  // Read directly from process.env in instrument.ts (documented exception to
  // "ConfigService is the only place that reads process.env" — see that
  // file's own comment for why); listed here too so it's validated and
  // documented the same way every other env var is.
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().default("development"),
  // O-3 /metrics protection (backend/src/common/metrics/metrics-auth.guard.ts).
  // When set, GET /metrics requires "Authorization: Bearer <token>" — min 32 chars
  // so it can't be a guessable value. When unset it is open outside production and
  // disabled (404) in production. A blank value counts as unset.
  METRICS_TOKEN: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(32).optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;
