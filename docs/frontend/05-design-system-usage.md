# Design System Usage

Source: the actual implementation in `packages/design-system` and `packages/ui`, read directly — not re-derived. Confirmed decisions this doc builds on without re-litigating: the brand color correction (`--color-primary: #0d2a63`), the Slate-based neutral scale, Inter as the sans typeface, and the light/dark theme structure via a `.dark` class selector — all already implemented and out of scope to second-guess here.

## How the two packages relate

The dependency direction is **application → `@nova/ui` → `@nova/design-system`** (decision of 2026-09-21, recorded in ADR-0001 in `docs/19-governance/NOVA_ARCHITECTURE_DECISION_RECORDS.md`).

- **`packages/design-system`** owns the tokens (`src/tokens/`), the light/dark theme objects (`src/themes/`), the CSS custom properties they compile to (`src/css/variables.css`), and the primitive components (`Button`, `Input`, `Card`, `Dialog`, `Badge`, `Text`, and so on). It is an implementation detail of `@nova/ui`.
- **`packages/ui`** is the **application-facing component API**. Its `primitives`, `forms`, `feedback`, `data-display`, `navigation` and `typography` folders re-export every design-system component, and it adds the commerce, dashboard, layout and utility components (`ProductCard`, `CartItem`, `PriceDisplay`, `DataTable`, `StatCard`). There is one implementation of each component; `@nova/ui` never reimplements one.

**Applications import components from `@nova/ui` only.** The design tokens reach an app through CSS (`@import "@nova/design-system/css/tokens.css"` in its `globals.css`), not through a JavaScript import. An ESLint rule (`no-restricted-imports` in `packages/eslint-config/next.mjs`, scoped to `apps/**`, tested in `next.test.mjs`) rejects any JavaScript import of `@nova/design-system` from application code; `packages/ui` is not restricted.

### Entry points of `@nova/ui`

| Entry             | Contents                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `@nova/ui`        | Everything except the charts.                                                                          |
| `@nova/ui/charts` | `BarChart`, `LineChart`, `PieChart`. They import `recharts`, so they sit behind their own entry point. |

Both packages declare `sideEffects` in `package.json` (`@nova/ui`: `false`; `@nova/design-system`: its CSS files only), because neither has import-time side effects. `entry-points.test.ts` in `packages/ui` pins the boundary: the root entry must not export a chart component.

**Why the charts are separate (measured, not assumed).** Before this change the root barrel re-exported the charts. On GitHub's builds, `apps/web` loaded 377 kB of JavaScript on the median route (222 kB shared base) and a 427 kB (uncompressed) chunk containing `recharts` was loaded by 44 of its 53 routes, although no app renders a chart. Declaring the packages side-effect free brought the median to 246 kB but left six routes heavy; moving the charts behind `@nova/ui/charts` brought the p90 from 395 to 276 kB and the maximum from 414 to 285 kB. Do not add a heavy dependency to the root entry: give it its own entry point.

## The hard rule

**No app may hardcode a color, spacing, radius, or shadow value.** Every visual value traces back to a CSS custom property defined once in `packages/design-system/src/css/variables.css`. There are **two equally acceptable ways** to reference one — verified as both being in active, real use across the codebase, not a theoretical choice between them:

1. **The Tailwind semantic utility class**, wired in `packages/tailwind-config/tailwind.config.ts` (`primary: "var(--color-primary)"`, `rounded-md` → `var(--radius-md)`, etc.) — e.g. `className="bg-primary rounded-md"`.
2. **The CSS variable directly, via Tailwind's arbitrary-value syntax** — e.g. `className="bg-[color:var(--color-primary)]"`. This is in fact the **dominant** pattern inside `packages/design-system` and `packages/ui`'s own components (`ProductCard`, `EmptyState`, `ErrorState` all use it throughout) — it is not a legacy or discouraged form, it's simply the more explicit spelling of the same reference.

Both compile to the same CSS variable and both adapt correctly to theme changes (light/dark, and any future theme). **What's not acceptable is anything that isn't one of these two** — see below.

## Theming — how light/dark is wired at the app root

Confirmed, real implementation in `apps/web/src/app/[locale]/layout.tsx`:

1. The theme preference is read server-side from a cookie (`nova_theme`) during the root layout's render.
2. The `<html>` element's `className` is set directly from that cookie value — `className={rawTheme === "dark" ? "dark" : ""}` — so the correct theme class is present in the **very first HTML the server sends**, before any client JS runs. `suppressHydrationWarning` is set on `<html>` specifically because the client's `ThemeProvider` may reconcile against `system`/`localStorage` after mount, which is an intentional, expected mismatch class React is told not to warn about.
3. `ThemeProvider` (from `@nova/app-shell`, bound to the app's cookie key in `src/providers/theme-provider.tsx`) then owns runtime theme switching client-side: it toggles the `.dark` class on `document.documentElement`, and persists the choice to both a cookie (so the _next_ server render gets it right) and `localStorage` (so client-side re-reads don't need a round-trip).
4. Every CSS custom property in `variables.css` has a `:root` value (light) and a `.dark` override — the theme switch is purely a class toggle; no component re-renders with different props, no JS-computed colors anywhere.

Any new app (Seller, Admin) wires this up identically: import `@nova/design-system/css/variables.css` once at the root, replicate this same cookie-read-then-`ThemeProvider` pattern rather than inventing a new one. Currently **neither `apps/admin` nor `apps/seller` imports `variables.css` at all** — verified directly, not assumed — so this entire theming setup does not exist for either app yet; it needs to be done once, correctly, rather than copy-pasted under time pressure when either app's real build starts.

## Don't do this — real examples already in the codebase

These aren't hypothetical. Found by direct search, current as of this doc:

**1. Raw hex values bypassing the token system entirely:**

```tsx
// apps/web/src/app/error.tsx:18, not-found.tsx:12 (identical), loading.tsx:4 (border variant)
className =
  "rounded-lg bg-[#126b4f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f5a41]";
```

This is worse than it looks: `#126b4f` is not even the design system's actual success/brand-adjacent green (`--color-success` is `#16a34a`) — it's a third, undocumented color that doesn't exist as a token anywhere. It won't adapt in dark mode, it can't be changed platform-wide by editing one CSS variable, and nothing about it signals to a future reader whether it was intentional or a placeholder that never got replaced. The fix is `bg-success hover:bg-success-hover` (or `bg-[color:var(--color-success)]` — either acceptable form from the rule above) if green/success framing is what these error/empty pages actually want, or `bg-primary` if it should just be brand-colored.

**2. Reaching for Tailwind's _built-in default_ color palette instead of a Nova token — the subtler bypass:**

```tsx
// apps/web/src/features/checkout/components/checkout-flow.tsx and 39 other occurrences
className = "text-sm text-slate-600";
```

This one is easy to miss in review because it _looks_ like it might be a design-system reference — Nova's neutral scale genuinely is Slate-based. But `text-slate-600` resolves to **Tailwind's own bundled default Slate palette**, not to Nova's `--color-foreground-muted` (or whichever semantic token was actually intended) — it happens to render a very similar gray today purely by coincidence of both being Slate-derived, but it is not routed through `variables.css` at all. It will silently stop matching if Nova's neutral scale is ever adjusted, and — unlike `text-foreground-muted` — it does not have a `.dark`-mode override, so it renders as the same gray in dark mode, where it's likely to fail contrast. **40 occurrences of raw `text-slate-*`/`bg-slate-*`/`border-slate-*` exist in `apps/web` today** — this is the single most common real violation in the codebase, not a one-off.

**What to look for in review:** any Tailwind color utility using a **raw palette name** (`slate`, `gray`, `blue`, `red`, etc.) rather than a **semantic name** (`primary`, `foreground`, `muted`, `success`, `error`, `border`) is the tell. The semantic names are what's wired to `variables.css`; the raw palette names are Tailwind's own defaults, coincidentally similar-looking but architecturally disconnected.

## Enforcement

**The import boundary is enforced automatically** (see above): a JavaScript import of `@nova/design-system` from any file under `apps/` fails lint, and therefore CI.

**Hardcoded colours are not.**

> **Proposed, not yet confirmed.** Both violations above currently rely entirely on code review catching them — there is no ESLint rule blocking a raw hex value or a raw Tailwind palette class today, which is exactly how 40+ instances of the second violation accumulated unnoticed. Proposed: an ESLint rule (e.g. a `no-restricted-syntax` pattern targeting `className` string literals matching `/\b(?:text|bg|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/` or `/\[#[0-9a-fA-F]{3,8}\]/`) added to `packages/eslint-config`, so this becomes a CI-blocking lint failure rather than something only caught if a reviewer happens to notice. Worth scoping carefully — it needs to allow the raw palette references that legitimately belong in `packages/design-system/src/tokens/colors.ts` and `tailwind.config.ts`'s own raw palette definitions themselves, since those files are where the palette _is_ defined, not where it's being bypassed.

## Known risks in this area for Nova specifically

- **The two "don't do this" patterns above, left unfixed and un-lint-enforced**, will keep accumulating — 40 instances already exist without anyone having deliberately decided to accept them, which is a strong signal review alone isn't sufficient.
- **Admin and Seller starting from zero on theming wiring** rather than copying `apps/web`'s proven root-layout pattern verbatim — the risk is two more independent, possibly-inconsistent implementations of "how do we avoid a flash of wrong theme" instead of one shared pattern applied three times.
- **The `--ds-*` CSS variable namespace** (`--ds-primary`, `--ds-background`, `--ds-text`, etc. — seen in `apps/web/src/components/auth-guard.tsx` and the root layout's `body` className) appears to be a second, parallel alias layer that just points back to the same `--color-*` variables (`--ds-primary: var(--color-primary);` in `variables.css`). It's unclear whether `--ds-*` is an intentional, stable public alias (e.g. for eventual React Native / non-Tailwind consumers that can't use Tailwind's utility-class layer) or accumulated inconsistency that should be consolidated to one namespace. Not resolved here — flagged for a decision, since new code copying whichever example it finds first will otherwise perpetuate whichever one wins by chance.
