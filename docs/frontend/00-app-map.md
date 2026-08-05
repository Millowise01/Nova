# App Map

Source: Nova Enterprise Blueprint, **Volume 6 — Seller, Admin & Customer Experience, Parts A–D**, cross-referenced with **Volume 1, Part D** (product ecosystem) for which surfaces exist in the platform's full scope.

## Docs location — why here, not `apps/*/docs/`

No frontend markdown-docs convention exists in the repo yet. The only precedent is `backend/docs/` (this session's earlier deliverable). Most of what these 8 files cover — design-system usage, data-fetching conventions, state-management boundaries — applies identically across all four apps, not to just one, so fragmenting them into four `apps/*/docs/` copies would either duplicate content or get out of sync. These live at `docs/frontend/`, mirroring `backend/docs/` as a sibling. (Note: `apps/docs` is itself a _planned Next.js app_ — "Platform documentation shell" per the root README's workspace layout — not a markdown folder. Don't confuse the two.)

## The four frontend surfaces (Vol 6, Parts A–D)

| #   | Surface                             | Primary user                                                | Vol 6 Part |
| --- | ----------------------------------- | ----------------------------------------------------------- | ---------- |
| 1   | Customer Web + Customer Mobile      | Customers (shoppers)                                        | Part A     |
| 2   | Seller Portal (web) + Seller Mobile | Sellers and their staff                                     | Part B     |
| 3   | Rider / Delivery Mobile             | Riders                                                      | Part C     |
| 4   | Admin Portal (web) + Admin Mobile   | Internal staff (14 role categories — Vol 1, G2 / Vol 6, D1) | Part D     |

Vol 6, A1 is explicit that surface 1 is actually two apps sharing one backend identity: "The customer experience spans the Customer Web Application and Customer Mobile Application... sharing one account, one cart, and one order history regardless of which surface a customer uses." The same pattern applies to surfaces 2 and 4 (portal + a narrower mobile companion) — Vol 6, D3 is explicit that Admin Mobile is deliberately **not** a full replica of the desktop portal: "a deliberately narrower slice... approvals, escalations, system health alerts, and dispatch oversight... rather than attempting to replicate the full desktop administration surface on a small screen."

## Build status — what's actually in the repo today

| Surface                           | Repo status       | Evidence                                                                                                                                                                                                                                                                                                              |
| --------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Customer Web** (`apps/web`)     | **Real, partial** | 125 source files, 19 feature folders, working `[locale]` routing, middleware-level auth/role guards, real design-system consumption. But **not** uniformly real — see caveat below.                                                                                                                                   |
| **Customer Mobile**               | **Not started**   | No React Native app exists anywhere in the repo.                                                                                                                                                                                                                                                                      |
| **Seller Portal** (`apps/seller`) | **Stub only**     | `apps/seller/src/app/page.tsx` is exactly `export default function SellerHomePage() { return <main>Seller</main>; }`. No `@nova/design-system` or `@nova/ui` dependency declared in `apps/seller/package.json` — not even the CSS variables are imported. Three files total: `globals.css`, `layout.tsx`, `page.tsx`. |
| **Seller Mobile**                 | **Not started**   | No React Native app exists.                                                                                                                                                                                                                                                                                           |
| **Rider Mobile**                  | **Not started**   | No app of any kind exists — not even a stub directory.                                                                                                                                                                                                                                                                |
| **Admin Portal** (`apps/admin`)   | **Stub only**     | Identical situation to Seller: `export default function AdminHomePage() { return <main>Admin</main>; }`, three files, no design-system wiring.                                                                                                                                                                        |
| **Admin Mobile**                  | **Not started**   | No React Native app exists.                                                                                                                                                                                                                                                                                           |

**This matches the last verified audit — it has not gone stale.** Re-confirmed directly against the filesystem for this doc pass, not assumed: `find apps/admin/src -type f` and `find apps/seller/src -type f` both return exactly `globals.css`, `layout.tsx`, `page.tsx`, and neither `package.json` lists a `@nova/*` design-system dependency.

### The Customer Web caveat — "real" is not uniform

Don't read "`apps/web` is real" as "every screen in `apps/web` is functional." Roughly 40% of its feature components (15 of 38, by direct count) follow a `ModuleShell` + `FeatureGrid` pattern — a page that _describes_ planned capabilities as a static list rather than implementing them. `features/cart/components/cart-screen.tsx` is a concrete example: it renders a "Persistent Cart," "Guest Cart," "Saved for Later," etc. as description cards, but there is no cart state, no add-to-cart handler, and no line-item data anywhere in the component. Compare that to `features/checkout/components/checkout-flow.tsx`, which _is_ a real, working multi-step form (React Hook Form + Zod, real step state) — its `onSubmit` just ends in `// TODO: Implement checkout` because there's no backend yet to submit to.

**Rule of thumb for anyone extending `apps/web`:** before treating an existing feature folder as a reference implementation, check whether it's a `ModuleShell` page or a real one. Copying a `ModuleShell` page's pattern into new work would propagate placeholder content as if it were an established convention.

## Primary user and core workflows per surface (Vol 6)

### Customer Web / Mobile (Vol 6, Part A)

**Primary user:** Customers (shoppers). **Core workflows:** Discovery → Evaluation → Purchase → Fulfillment → Post-purchase → Retention (the full journey map in A1) — search and browsing, product detail with reviews, guest or authenticated checkout with multi-seller cart support (Vol 2, D2's `Sub-Order`s), real-time order tracking via WebSocket, wallet and loyalty.

### Seller Portal / Mobile (Vol 6, Part B)

**Primary user:** Sellers and their staff (owner, manager, fulfillment, support roles — B5). **Core workflows:** Tiered KYC onboarding gated before payout eligibility (B1), catalog/inventory management with variant and bulk editing (B2), order queue and returns handling (B3), analytics/marketing/finance dashboards (B4).

### Rider Mobile (Vol 6, Part C)

**Primary user:** Riders. **Core workflows:** KYC-gated onboarding mirroring the seller pattern (C1), real-time dispatch board and turn-by-turn navigation (C2), proof-of-delivery capture and COD reconciliation, earnings/performance dashboard (C3).

### Admin Portal / Mobile (Vol 6, Part D)

**Primary user:** Internal staff across 14 role categories, each with a distinct permission scope (D1's full matrix — Super Admin, Operations, Finance, Marketing, Customer Support, Compliance, Risk, Trust & Safety, Content Moderation, Logistics, Engineering, Analytics, Legal, Auditor). **Core workflows:** seller approval/suspension, refund/payout dual-authorization queues, dispute resolution, content moderation (D2) — Admin Mobile carries only the on-call-relevant slice of this (D3).

## Known risks in this area for Nova specifically

- **Apps built ahead of the backend they'll eventually consume.** `apps/web` has real UI for checkout, orders, wallet, and dashboards, but `backend/` is still a placeholder (see `backend/docs/00-bounded-contexts.md`). Every "real" frontend feature today is either working against nothing (checkout's `console.log`) or against ad hoc client-side data. Watch for frontend data shapes hardening into an implicit contract before the actual `/v1/` API is designed — the backend docs' API standards should win any disagreement, not whatever shape the frontend guessed first.
- **`ModuleShell` pages read as more "done" than they are.** A reviewer or a new engineer skimming `apps/web`'s route tree sees a page for every Vol 6 workflow and can reasonably assume more is built than actually is. Treat a `ModuleShell` page as equivalent to a backend "not started" bounded context, not as a partial implementation.
- **Zero design-system wiring in Admin/Seller means Phase where they _do_ start will need the theming/CSS-variable setup done once, correctly, from the first commit** — see [05-design-system-usage.md](05-design-system-usage.md) — rather than each app re-deriving it independently the way `apps/web` did first.
