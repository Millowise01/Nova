# Routing & App Structure

Source: the actual routing implementation in `apps/web` (Next.js 15 App Router), read directly from the filesystem — this doc describes real, working structure for `apps/web`, and explicitly marks Seller/Admin/mobile sections as not-yet-applicable rather than writing speculative detail against apps that don't exist yet ([00-app-map.md](00-app-map.md)).

## `apps/web` — real, current structure

```text
apps/web/src/app/
  api/health/                    # non-locale route — health check
  offline/                       # non-locale route — PWA offline fallback page
  [locale]/                      # everything user-facing lives under a locale segment
    layout.tsx                   # root layout: fonts, theme class, NextIntlClientProvider, AppProviders
    (auth)/auth/login/...        # route group: signup, login, OTP, password reset
    (public)/categories/...      # route group: browse, product, seller-store (customer-facing storefront)
    (search)/...                 # route group: search experience
    (dashboard)/account/...      # route group: AUTH-GUARDED — account, orders, wallet, settings, etc.
    (checkout)/...               # route group: AUTH-GUARDED — checkout flow
    (error)/403, /500            # route group: error pages
```

Route groups (the `(name)` folders) are a Next.js App Router feature — they don't appear in the URL, they exist purely to give a subset of routes their own `layout.tsx` without affecting the path. Nova uses this to attach the auth guard **exactly once per group** rather than per-page: `(dashboard)/layout.tsx` and `(checkout)/layout.tsx` both wrap their children in `<AuthGuard>`, so every current and future route added under either group is protected automatically — a new page under `(dashboard)/` never has to remember to add its own guard.

## Where the auth guard actually lives — two layers, not one

1. **Edge layer — `apps/web/middleware.ts`.** Runs before any React renders. Reads the session cookie, checks the request path against `PROTECTED_ROUTES` (`src/config/routes.ts`), and redirects to `/login?redirect=...` server-side if there's no valid session — this is what prevents a flash of protected content and works even before any client JS has loaded.
2. **Component layer — `<AuthGuard>` (`src/components/auth-guard.tsx`).** Wraps `(dashboard)/layout.tsx` and `(checkout)/layout.tsx`. Reads client-side auth state via `useAuth()`, shows a `Spinner` while that resolves, and redirects client-side if the user isn't authenticated once loading completes.

These aren't redundant — middleware only sees the cookie (fast, but can't know if a token has since been revoked server-side or if client auth state is still hydrating); `AuthGuard` handles the client-side session-resolution window middleware can't see into. Both are needed: middleware for the first-paint redirect, `AuthGuard` for correctness once the client takes over.

## A genuine inconsistency, flagged for your attention — not resolved silently

`middleware.ts` contains role-based routing logic that guards paths which **do not exist anywhere in `apps/web`**:

```typescript
// apps/web/middleware.ts
const isSellerRoute = pathnameWithoutLocale.startsWith("/seller");
const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");
```

Verified directly: there is no `(dashboard)/seller` or any `/seller`/`/admin` route under `apps/web/src/app/[locale]/` — the only route with "seller" in its path is `(public)/seller-store/[slug]`, which is the _customer-facing_ storefront for a seller, not a seller portal. Meanwhile, `apps/seller` and `apps/admin` already exist as **separate, dedicated Next.js apps** (stubs today, but structurally distinct workspace packages per the root README).

This reads like one of two things, and it's not this doc's place to guess which: either (a) leftover logic from an earlier plan where Seller/Admin were meant to be route groups _inside_ `apps/web` before the decision was made to split them into their own apps, and it's now dead code that should be deleted; or (b) intentionally forward-looking, in case some seller/admin-adjacent functionality ends up living inside the customer web app after all. Worth a direct decision before more middleware logic gets built on top of an assumption either way.

## Standard structure for a new route in `apps/web`

1. Add the page under the correct existing route group (`(public)` for unauthenticated browsing, `(dashboard)`/`(checkout)` for anything requiring a session) — don't create a new route group unless the page needs genuinely different layout chrome than every existing group.
2. Add its path to `ROUTES` in `src/config/routes.ts` — every internal link should reference `ROUTES.whatever`, never a hand-typed string, so a future path change is a one-file edit.
3. If the page requires auth, confirm its parent route group already has `<AuthGuard>` (it does, for `(dashboard)` and `(checkout)`) — and add its path to `PROTECTED_ROUTES` so the _edge_-layer middleware also protects it, not just the component layer.

## Seller Portal & Admin Portal routing (`apps/seller`, `apps/admin`)

**Not yet applicable in any concrete sense** — both apps are one-line stubs with no route structure beyond the default Next.js `page.tsx` ([00-app-map.md](00-app-map.md)). There is no existing pattern to document.

> **Proposed, not yet confirmed.** When these apps get built out, the most consistent choice is to **mirror `apps/web`'s structure exactly** — a locale segment (`[locale]/`, reusing the same `next-intl` setup, since Vol 6, E4 doesn't scope localization to customer-facing surfaces only), route groups for auth vs. authenticated-dashboard content, and the same two-layer (`middleware.ts` + `AuthGuard`) guard pattern, adapted so the role check is "does this session have the `seller`/`admin` role" rather than "does this session exist at all" (the actual RBAC/ABAC enforcement per role — Vol 3, B3 — lives on the backend regardless; the frontend guard is a UX convenience that prevents rendering a screen the user can't act on, not the real security boundary). Rationale: there's no reason for Seller and Admin to invent their own routing philosophy when `apps/web`'s already works and is the only proven pattern in this codebase.

## Mobile navigation (React Native) — not yet applicable

No React Native app exists anywhere in this repo — not for customer, seller, or rider ([00-app-map.md](00-app-map.md)). Writing a navigation-structure convention (React Navigation stack/tab structure, deep-linking scheme, etc.) against an app that doesn't exist would be speculative detail with nothing real to ground it or verify it against, so this section is deliberately left as a placeholder: **extend this doc with a real Mobile Navigation section once the first React Native app is scaffolded**, at which point it should follow whatever navigation library and structure that scaffolding actually establishes — not a structure guessed at ahead of time here.

## Known risks in this area for Nova specifically

- **The dead-code-or-forward-looking `/seller`/`/admin` middleware logic above.** Left unresolved, it's either a maintenance trap (code that looks load-bearing but guards nothing) or a quietly-abandoned architecture decision nobody re-confirmed.
- **Seller/Admin re-deriving routing conventions independently** instead of copying `apps/web`'s proven pattern, the same risk named in [05-design-system-usage.md](05-design-system-usage.md) for tokens — worth cross-referencing so whoever starts building either app reads both docs first.
- **The frontend route guard being mistaken for the actual security boundary.** `AuthGuard` and `middleware.ts`'s role checks are UX conveniences — they stop an unauthorized user from seeing a screen they can't use, but the real enforcement is the backend's centralized RBAC/ABAC policy engine (`backend/docs/05-security-baseline.md`). A route that's guarded on the frontend but calls an unguarded backend endpoint is not actually protected.
