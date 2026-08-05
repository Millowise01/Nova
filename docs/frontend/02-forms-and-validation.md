# Forms & Validation

Source: Nova Enterprise Blueprint, **Volume 2, Part A2** (React Hook Form + Zod named as the frontend stack: "Zod for shared, type-safe validation between client and server"), **Volume 6, Part E1** ("Form fields with shared validation messaging (Zod schemas per Volume 2, Part A2)"), cross-referenced with the actual `packages/validation` package and its current consumers.

## The rule

Every form uses **React Hook Form** (`useForm` + `zodResolver`) with a **Zod schema**, and every reusable validation primitive in that schema — email, phone, URL, and anything else that's genuinely shared across forms — is **imported from `@nova/validation`, never redefined inline.** `packages/validation/src/index.ts` currently exports:

```typescript
import { z } from "zod";
export { z };

export const emailSchema = z.string().email();
export const phoneSchema = z.string().min(7);
export const urlSchema = z.string().url();
```

A form-specific schema imports what it needs from this and composes the rest locally — the object shape (which fields, which are required, cross-field refinements like password confirmation) is inherently per-form and belongs in the feature, but the individual field-level primitives that recur across forms do not.

## Known failure mode — call this out explicitly

**This exact duplication happened once already on this project**: a form schema redefined `z.string().email()` (or equivalent) inline instead of importing `emailSchema` from `@nova/validation`, which an earlier audit pass on this repo caught and corrected. The risk isn't hypothetical — it's the natural failure mode of "just write the Zod schema for this form" without checking the shared package first, and it's exactly the kind of thing that silently drifts: two forms validating "email" with two subtly different rules is a bug that only shows up when a user finds the one input that's slightly more (or less) permissive than the other.

**Current state, verified directly against the files (not assumed from memory of the earlier fix):** all three existing form/validation files in `apps/web` are clean —

```typescript
// apps/web/src/features/auth/auth.schemas.ts
import { emailSchema, phoneSchema } from "@nova/validation";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

```typescript
// apps/web/src/features/checkout/checkout.schemas.ts
import { phoneSchema } from "@nova/validation";

export const checkoutSchema = z.object({
  addressLine: z.string().min(3),
  // ...
  phone: phoneSchema,
  // ...
});
```

```typescript
// apps/web/src/features/home/components/sections/newsletter-section.tsx
import { emailSchema } from "@nova/validation";
const schema = z.object({ email: emailSchema });
```

**What to check in review, every time, to keep it that way:** any new `z.object({...})` in a `*.schemas.ts` file (or inline in a component) that includes a field named `email`, `phone`, or `url` — if the validator for that field isn't `emailSchema`/`phoneSchema`/`urlSchema` from `@nova/validation`, that's the regression. This is a one-line check (`grep -n "z\.string()\.email\|z\.string()\.url("` across `apps/*/src` should return nothing outside `packages/validation` itself) — cheap enough to be worth running periodically, not just trusting review to catch it.

## File and naming convention (as established, not invented)

- One `<feature>.schemas.ts` file per feature folder (`features/auth/auth.schemas.ts`, `features/checkout/checkout.schemas.ts`), exporting one Zod schema per form plus its inferred TypeScript type: `export type LoginFormValues = z.infer<typeof loginSchema>`.
- Schemas compose `@nova/validation` primitives for shared fields, `z.string().min(n)` / `z.enum([...])` / etc. directly for form-specific fields, and `.refine()` for cross-field rules (password-confirmation matching is the existing pattern in `auth.schemas.ts`).
- The component (`checkout-flow.tsx`, etc.) wires the schema via `useForm({ resolver: zodResolver(schema) })` and calls `form.register(fieldName)` per field — the established pattern, not `Controller`-based wiring, for the plain HTML-input-shaped fields seen so far. `Controller` would be needed once a field's value isn't a plain string/number the design system's own components can bind directly (e.g. a custom date picker) — not yet a pattern that's shown up.

## What's real vs. proposed here

Everything above is the _current, confirmed_ pattern — three real files, no invention needed. The gap is `apps/admin` and `apps/seller`, which have no forms yet at all (they're one-line stubs — [00-app-map.md](00-app-map.md)). When they get real forms (seller KYC document upload, admin refund-approval forms, etc. — Vol 6, Parts B1 and D2), this same convention applies without modification — there's nothing app-specific about it. No proposed decision needed here; the pattern generalizes cleanly.

## Known risks in this area for Nova specifically

- **The duplication failure mode above, recurring.** Documented explicitly because it already happened once — the fix being in place today doesn't mean it stays that way without an active check.
- **Seller and Admin building their own validation primitives from scratch** when their forms eventually get built, instead of reaching for `@nova/validation` first, simply because nobody working on those apps has seen `apps/web`'s pattern yet. This doc is the mitigation — point new Admin/Seller form work here before it starts.
- **Cross-field / async validation for KYC-style forms (Vol 6, B1) has no precedent yet.** Every existing schema is synchronous, client-side-only validation. Seller KYC document upload will likely need server-side async validation (e.g. checking a business registration number against a real registry) that Zod's `.refine()` can do asynchronously, but there's no existing example of that pattern in this codebase to point to — worth designing deliberately when that form is actually built, not copying a synchronous pattern that doesn't fit.
