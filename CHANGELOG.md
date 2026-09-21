# Nova Changelog

## Unreleased

### Security

- KYC submissions must now be for the authenticated caller (`403 KYC_SUBJECT_MUST_BE_CALLER`).
- Carts and checkout sessions that have an owner are usable only by that owner; `POST /v1/orders` rejects a checkout session that belongs to someone else (`403 CHECKOUT_SESSION_ACCESS_DENIED`).
- `POST /v1/auth/otp/verify` is rate limited (5 per 60 seconds).
- Added security headers to the backend (`helmet`) and to the web, seller and admin apps. New dependency: `helmet` (backend).

### Frontend

- `@nova/ui` is the application-facing component API (ADR-0001): `seller` and `admin` import components from it instead of `@nova/design-system`, and a lint rule enforces that for everything under `apps/`.
- The chart components moved to `@nova/ui/charts`. `apps/web` had been loading the `recharts` library on 44 of 53 routes without rendering a chart; its median route dropped from 377 kB to 246 kB of JavaScript. `@nova/ui` and `@nova/design-system` declare `sideEffects`.

### Tests

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
