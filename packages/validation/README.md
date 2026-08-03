# Validation Package

The single source of truth for shared Zod validation rules, so the same field (email, phone, URL) isn't independently redefined — and allowed to drift — in every form across the platform. Public API: `emailSchema`, `phoneSchema`, and `urlSchema` (composable `zod` primitives for those field types), plus a re-exported `z` for building schemas on top of them. When a form needs one of these fields, import the schema here rather than writing `z.string().email()` (or similar) locally — see `apps/web/src/features/auth/auth.schemas.ts` for the intended usage pattern.
