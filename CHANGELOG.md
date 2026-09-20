# Nova Changelog

## Unreleased

### Security

- KYC submissions must now be for the authenticated caller (`403 KYC_SUBJECT_MUST_BE_CALLER`).
- Carts and checkout sessions that have an owner are usable only by that owner; `POST /v1/orders` rejects a checkout session that belongs to someone else (`403 CHECKOUT_SESSION_ACCESS_DENIED`).
- `POST /v1/auth/otp/verify` is rate limited (5 per 60 seconds).
- Added security headers to the backend (`helmet`) and to the web, seller and admin apps. New dependency: `helmet` (backend).

### Tests

- Documented how the backend integration tests run and two known intermittent failures (`backend/docs/06-testing-strategy.md`).

### CI

- `ci.yml` generates the Prisma client after install, so backend lint and typecheck can see the models. Backend tests still cannot run in CI (no database service); see the audit, section 24.

### Documentation

- Established the phased documentation architecture under `docs/` (19 phase folders).
- Promoted `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md` as the canonical UI/UX design system specification (moved from `docs/frontend/`).
- Marked the placeholder documents `STATUS: STUB — NOT SOURCE OF TRUTH` and linked each to the real specification where one exists.
- Added root `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md` and this changelog; merged the documentation-system rules into `.claude/CLAUDE.md`.
- Added `docs/19-governance/NOVA_IMPLEMENTATION_AUDIT_2026-09-20.md`.
