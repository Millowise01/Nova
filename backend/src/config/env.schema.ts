import { z } from "@nova/validation";

// Backend-only env — never exposed to a client, unlike @nova/config's NEXT_PUBLIC_*
// schema. Validated once at boot; every other module reads config through
// ConfigService, never process.env directly (backend/docs/05-security-baseline.md).
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),
  PII_ENCRYPTION_KEY: z.string().min(1),
  // Comma-separated allowlist — Vol 3, C1's application-layer complement to the
  // Cloudflare edge (which is infrastructure, out of scope this pass). Never "*".
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;
