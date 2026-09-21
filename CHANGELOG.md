# Nova Changelog

## Unreleased

### Security

- KYC submissions must now be for the authenticated caller (`403 KYC_SUBJECT_MUST_BE_CALLER`).
- Carts and checkout sessions that have an owner are usable only by that owner; `POST /v1/orders` rejects a checkout session that belongs to someone else (`403 CHECKOUT_SESSION_ACCESS_DENIED`).
- `POST /v1/auth/otp/verify` is rate limited (5 per 60 seconds).
- Added security headers to the backend (`helmet`) and to the web, seller and admin apps. New dependency: `helmet` (backend).
- The post-login redirect in `seller` and `admin` accepted `/\evil.com` and paths with an embedded tab, newline or carriage return, which a browser resolves to another origin. `sanitizeRedirect` now lives in `@nova/app-shell`, refuses them, and is covered by tests (the original implementation fails 8 of them). `web` never reads the `redirect` parameter, so it was not affected.
- The role guard in `seller` and `admin` no longer treats every path that merely starts with `/login` or `/forbidden` as public; it matches whole path segments.

### Frontend

- Fixed: after a reload, a page that fetches data on mount could lose the session. The boot-time restore and the API client's 401 refresh each called `POST /auth/refresh`, and the refresh token is single-use, so the second call was rejected and the tokens were cleared. The restore now goes through the client's single-flight refresh (`refreshAccessToken` is exported from `@nova/api-client`).
- Fixed: clicking Sign out while the boot-time session restore was still running was undone when it finished (it stored fresh tokens and signed the user back in). Both defects were in the three original per-app providers too.

- `@nova/ui` is the application-facing component API (ADR-0001): `seller` and `admin` import components from it instead of `@nova/design-system`, and a lint rule enforces that for everything under `apps/`.
- The chart components moved to `@nova/ui/charts`. `apps/web` had been loading the `recharts` library on 44 of 53 routes without rendering a chart; its median route dropped from 377 kB to 246 kB of JavaScript. `@nova/ui` and `@nova/design-system` declare `sideEffects`.
- New package `@nova/app-shell` (ADR-0002) holds the theme provider, toast provider and query-client hook that `web`, `seller` and `admin` each carried a copy of. Each app keeps a thin wrapper at the old path and supplies its own cookie key and stale time. One fix comes with it: choosing an explicit theme now stops the theme following the operating system, which previously kept overriding the choice.
- `@nova/app-shell` now also holds the shared authentication code: `AuthProvider`, the session service, `sanitizeRedirect`, JWT and session-cookie helpers, and the role guard (`@nova/app-shell/middleware`). `seller` and `admin` keep a short `middleware.ts` with their own role and matcher; cookie names and destinations are unchanged. The login mutation and login form remain in each app.

### Build

- `@nova/validation` now also builds a compiled CommonJS copy (`dist/cjs`, selected by the package `exports` for `require`), so the built backend starts on Node 20. It failed with `SyntaxError: Unexpected token 'export'` before, which is why the E2E workflow had never passed (ADR-0004). To run the compiled backend, build its packages first: `pnpm --filter "@nova/backend..." build`; the backend `dev` script does it for you.

### Tests

- The E2E workflow works: `.github/actions/e2e-backend` builds, starts (failing with its log instead of timing out silently) and seeds the backend; `backend/scripts/e2e-seed.mjs` and `e2e-accounts.mjs` create fixtures through the real API. There is a new `admin-auth` job and an admin Playwright setup, and new browser specs for sign-in, session restoration, sign-out, garbage and forged cookies, wrong and right role, `/login-history` and hostile redirects in web, seller and admin (30 browser tests in total).
- The web purchase journey no longer picks the image link as the product title, and no longer builds its phone number from the timestamp prefix (which collided across runs).
- Backend integration tests wait until the outbox is drained (`test-utils/drain-outbox.ts`) instead of until one poll returns 0, which fixed an intermittent notifications failure (test-only; production unchanged).
- One shared user helper (`test-utils/users.ts`) replaces the copied signup helpers and draws collision-proof phone numbers; signup failures now report their status and body.
- Documented how the backend integration tests run and the evidence for both fixes (`backend/docs/06-testing-strategy.md`).

### CI

- `ci.yml` generates the Prisma client after install, so backend lint and typecheck can see the models.
- The backend tests now run in CI against Postgres 16 and Redis 7 service containers, with throwaway secrets and applied migrations (new composite action `.github/actions/backend-test-env`). `turbo.json` passes the backend environment through to the backend test task and disables caching for it: Turbo's strict environment mode had been hiding the variables from Jest.
- `.github/scripts/select-scope.sh` replaces the `HEAD^1` filter. It runs everything when a filter cannot be trusted and states explicitly when nothing is affected, so a run cannot pass merely because its checks were filtered out.

### Documentation

- Established the phased documentation architecture under `docs/` (19 phase folders).
- Promoted `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md` as the canonical UI/UX design system specification (moved from `docs/frontend/`).
- Marked the placeholder documents `STATUS: STUB — NOT SOURCE OF TRUTH` and linked each to the real specification where one exists.
- Added root `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md` and this changelog; merged the documentation-system rules into `.claude/CLAUDE.md`.
- Added `docs/19-governance/NOVA_IMPLEMENTATION_AUDIT_2026-09-20.md`, `NOVA_PHASE_5_FOUNDATION_PLAN.md` and `NOVA_PACKAGE_STATUS.md` (workspace packages classified ACTIVE or PLACEHOLDER; none removed).
