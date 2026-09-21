# Nova Architecture Decision Records

Architectural decisions are recorded here, newest last. A record states its status honestly: **Accepted, implemented** means the code matches it; **Accepted, not yet implemented** means the decision is made but the work is pending.

Each record has: status and date, context, decision, consequences, and evidence.

---

## ADR-0001: `@nova/ui` is the application-facing component API

**Status:** Accepted, implemented (2026-09-21). **Decided by:** the repository owner.

**Context.** `@nova/ui` re-exports every `@nova/design-system` component and adds commerce, dashboard, layout and utility components, so the two packages are layers, not independent implementations. In practice applications used both paths inconsistently: `apps/web` imported everything through `@nova/ui` (54 import statements, none from `@nova/design-system`), while `apps/seller` and `apps/admin` imported primitives straight from `@nova/design-system` (13 statements) and only `DataTable` and `StatCard` from `@nova/ui`. The frontend documentation described the reverse of what `web` did. Separately, the `@nova/ui` root barrel re-exported the `recharts`-based chart components, and neither package declared `sideEffects`.

**Decision.**

1. The dependency direction is application → `@nova/ui` → `@nova/design-system`. Applications import components from `@nova/ui` only; there is no second component implementation.
2. Design tokens reach an app through CSS `@import`, not a JavaScript import.
3. The rule is enforced: `no-restricted-imports` in `packages/eslint-config/next.mjs`, scoped to `apps/**` (so `packages/ui` may import the design system), with a test (`next.test.mjs`).
4. Heavy optional dependencies get their own entry point instead of living in the root barrel. The chart components moved to `@nova/ui/charts`.
5. `@nova/ui` declares `sideEffects: false`; `@nova/design-system` lists only its CSS files (neither has import-time side effects).

**Consequences.** Applications have one import path. `recharts` cannot enter an app's bundle by importing `@nova/ui`; an app that wants a chart imports `@nova/ui/charts` deliberately. The design-system package stays an implementation detail, so its internals can change without touching applications. Anything new that is large and optional needs its own entry point.

**Evidence (GitHub CI builds, per-route First Load JS).**

| App      | Median before → after | p90          | Max          |
| -------- | --------------------- | ------------ | ------------ |
| `web`    | 377 → 246 kB          | 395 → 276 kB | 414 → 285 kB |
| `seller` | 240 → 239 kB          | 263 → 250 kB | 263 → 250 kB |
| `admin`  | 251 → 245 kB          | 255 → 251 kB | 255 → 251 kB |

Before the change, a 427 kB (uncompressed) chunk containing `recharts` was loaded by 44 of 53 `web` routes although no app renders a chart. The `sideEffects` flags alone left six routes heavy; the separate entry point removed the rest. Migrating `seller` and `admin` (13 statements in 13 files) grew no `web` or `admin` route. One `seller` route, `/analytics`, went from 240 to 242 kB (+0.8%) although its only change is the import specifier; the cause was not isolated (webpack redistributing modules between shared and per-route chunks is the likely one). A tolerance of 3 kB (about 1%) per route is treated as chunk-splitting noise; a larger change would need investigation.

---

## ADR-0002: A shared `@nova/app-shell` package

**Status:** Accepted, implemented (2026-09-21): providers (Phase 5 item B) and shared authentication (item C). The login mutation and login form stay in each app. **Decided by:** the repository owner.

**Context.** `web`, `seller` and `admin` each carry their own copies of the application providers and the authentication infrastructure: `theme-provider`, `toast-provider` and the query-client hook were the same code in all three (the theme provider differed in `web` only by a hard-coded storage key), `auth-provider` is 106 to 113 lines in each, and the open-redirect sanitizer, the middleware role gate and the cookie handling are copied. The copies are already drifting.

**Decision.** Create a new workspace package, `@nova/app-shell`, for shared application-shell concerns: shared providers, shared authentication infrastructure, application-level configuration, and role-specific configuration passed as parameters.

- It contains **no** seller- or admin-specific business logic and no domain logic; domain and business logic stay outside it.
- Each application supplies its own role, cookie configuration, login destination, permission configuration and application settings.
- Cookie and storage key names stay application-specific (cookies are not port-isolated on `localhost`), so nothing changes for signed-in users.
- Authentication is extracted after the providers, in small steps, with the security-sensitive pieces (redirect sanitizer, role gate) covered by tests first.

**Implemented so far (item B).** `@nova/app-shell` exports `ThemeProvider` (required `storageKey`), `ToastProvider`/`useToast`, and `createQueryClient`/`useQueryClientInstance` (required `staleTime`). Each app keeps thin wrapper files at the old paths that bind its own key and stale time, so no call site changed. Settings that differ by app are required parameters with no default, so an app cannot silently share another's cookie. The package is source-only and side-effect free, like `@nova/ui`.

**Implemented (item C).** The root entry also exports `sanitizeRedirect`, `decodeJwtPayload`, the session-cookie helpers, `createSessionService(getApiClient)` and `AuthProvider`/`useAuth`. `createRoleGuard` is on a second entry, `@nova/app-shell/middleware`, because it imports `next/server`; a test keeps it out of the root. Each app supplies its cookie key, role, post-logout page and API client; nothing seller-, admin- or domain-specific is in the package. Extracting the redirect sanitizer exposed and closed an open-redirect weakness in `seller` and `admin` (backslash and tab/newline forms), and the guard now matches whole path segments for its public routes. The guard is a navigation aid: the backend authorizes every request, and the session cookie is written by the browser, so it must never be read for a server-side decision.

**Consequences.** One implementation per concern, configured per app. A new package to maintain, and a `"use client"` and transpilation boundary to get right. Detail and risks: `NOVA_PHASE_5_FOUNDATION_PLAN.md`, items B and C.

---

## ADR-0003: CI runs the backend against real services and states its scope explicitly

**Status:** Accepted, implemented (2026-09-21).

**Context.** The backend's tests are integration tests against real Postgres and Redis. CI provided neither, so the backend `test` step could not pass, and every step used `--filter=...[HEAD^1]`, which on a push looks only at the last commit: a last commit that touched only CI files selected no packages and the job reported green without running lint, typecheck, test or build.

**Decision.**

1. The CI job provides `postgres:16-alpine` and `redis:7-alpine` service containers, throwaway secrets (masked in logs) and applied migrations, through a composite action (`.github/actions/backend-test-env`). The backend tests are not skipped or mocked.
2. `turbo.json` passes the backend environment through to `@nova/backend#test` and disables caching for it: Turbo's strict environment mode otherwise hides the variables, and a cache hit would replay a "pass" without touching the database.
3. `.github/scripts/select-scope.sh` decides what runs and reports it in the job summary. It runs everything when a filter cannot be trusted (base unavailable, or CI or workspace configuration changed), filters otherwise, and says so when nothing is affected instead of passing silently.
4. The E2E workflow uses the same building blocks. `.github/actions/e2e-backend` builds the backend and its workspace dependencies, starts it, fails with its log if it exits or does not answer, and seeds the catalog; each of the three jobs (`purchase-journey`, `seller-onboarding`, `admin-auth`) runs one app's Playwright suite against it and uploads the backend log.

**Consequences.** CI takes longer and exercises the real stack. A run cannot pass merely because its checks were filtered out. The scope script's `all`, `filtered` and `none` outcomes were exercised locally with the real script and `turbo` on real commits; on GitHub only `all` has run so far, because this branch's diff always touches CI files. The E2E workflow, which used to fail at backend start-up (ADR-0004), now adopts the composite actions.

**Evidence.** On pull request #21 GitHub ran the backend against live services: 16 suites and 137 tests green, later 18 suites and 149 tests, with lint, typecheck and build green; the intermediate failures and their causes are in the audit, section 25.

---

## ADR-0004: Workspace packages the backend runs must ship JavaScript

**Status:** Accepted, implemented (2026-09-21, Phase 5 item F4). **Decided by:** proposed and implemented by the F4 work, on the repository owner's instruction to fix the root cause; the owner has not yet reviewed this specific approach.

**Context.** The backend compiles to CommonJS (`nest build`) and requires `@nova/validation`, whose entry is raw TypeScript ESM (`main: ./src/index.ts`, `"type": "module"`). Jest maps the module to source, and Node 24 strips types natively, so it worked on developer machines. On Node 20.20.2, inside the repository's declared `>=20.18`, `node dist/main.js` failed with `SyntaxError: Unexpected token 'export'` at `packages/validation/src/index.ts`, which is what kept the E2E workflow red for every run it ever had. Reproduced locally with the same trace.

**Decision.** A workspace package that compiled backend code requires at runtime ships JavaScript for that consumer. `@nova/validation` builds a CommonJS copy to `dist/cjs` (with a `package.json` marking it `commonjs`, because the package is `"type": "module"`) and declares `exports`: `require` resolves to the compiled copy; `types` and `default` keep resolving to the source. Next.js, Vitest, `tsc` and Jest are unaffected. Running the compiled backend requires its workspace dependencies to be built: `pnpm --filter "@nova/backend..." build`; the backend `dev` script builds validation first.

**Alternatives rejected.** Running E2E on Node 24: hides the defect, and depends on Node's experimental type stripping, which the declared minimum does not have and which only works for files outside `node_modules`. Converting the package to CommonJS or dual source: churn across every frontend consumer for a backend-only need. Bundling the backend: a larger change than the problem needs.

**Consequences.** The compiled backend starts on Node 20. Anyone running `node dist/main.js` (CI, a deployment) must build the packages first. Any other workspace package the backend starts to import at runtime needs the same treatment, and `@nova/types` does not today (only Jest maps it).

**Evidence.** Node 20.20.2 loads the built `env.schema.js` and the whole backend serves `/v1/categories` with a 200 against a fresh database; Node 24 still works. Browser suites for web, seller and admin pass against it (see the Phase 5 plan, item F4).
