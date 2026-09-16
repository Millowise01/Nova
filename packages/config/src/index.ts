import { z } from "zod";

import { urlSchema } from "@nova/validation";

export const environmentSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: urlSchema,
  NEXT_PUBLIC_API_BASE_URL: urlSchema,
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().min(2),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * Real, disclosed bug found and fixed (2026-09-16): this used to default to a
 * `process.env` parameter and call `environmentSchema.parse(env)`. That reads
 * `process.env` as a live object at runtime, which defeats Next.js's client
 * bundling — Next only inlines `process.env.NEXT_PUBLIC_X` when that exact
 * member expression appears literally in the source, replacing each occurrence
 * at build time. It does NOT polyfill a real `process` global for the browser,
 * so any *other* way of reading env vars (spreading process.env, holding it in
 * a variable, passing it through a parameter) hits a bare, unreplaced `process`
 * reference and throws `ReferenceError: process is not defined` in a real
 * production browser — confirmed directly via a Playwright run against a
 * `next start` build (this exact function was the first thing every API call
 * hit, in both apps/web and apps/admin, both of which call `getEnvironment()`
 * with no arguments). `next dev` didn't reproduce this — dev mode's client
 * runtime is more permissive about `process` access, which is why this was
 * never caught by hand-testing against `pnpm dev` throughout Phase 1.
 * Writing each var as its own literal `process.env.NEXT_PUBLIC_X` expression
 * below is what makes Next's replacement actually fire for each one.
 */
export function getEnvironment(): Environment {
  return environmentSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  });
}
