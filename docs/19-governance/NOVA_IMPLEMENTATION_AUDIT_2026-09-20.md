# Nova Implementation Audit — 2026-09-20

**Audited:** commit `527516d` on `main` plus the uncommitted working tree at the start of the audit.
**Method:** read-only inspection of the repository, then typecheck, lint and test runs. Numbers below are the state **before** the remediation described in section 23.

## How to read the evidence tags

| Tag     | Meaning                                                                                       |
| ------- | --------------------------------------------------------------------------------------------- |
| **[V]** | Verified in this audit by reading the code or running a command.                              |
| **[R]** | Reproduced in this audit (a failure that was reported earlier and was made to happen again).  |
| **[N]** | Carried from earlier session notes and **not** re-verified here. Treat as a lead, not a fact. |

## Headline findings

1. **The installed documentation package is a scaffold.** 200 of the 201 files in the 19 phase folders were the same 3.9 KB template with only the title changed. **[V]** Only `NOVA_DOCUMENTATION_INDEX.md` had real content.
2. **The file named as the UI source of truth was a stub.** `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md` was the template; the real 49-section spec was `docs/frontend/NOVA_UI_UX_DESIGN_SYSTEM.md`. **[V]**
3. **Two authorization gaps were exploitable** (KYC `subjectId`, cart/checkout-session ownership), one abuse control was missing (OTP verify), and the backend sent no security headers. **[V]** All are fixed; see section 23.
4. **The code is in better shape than the docs.** Typecheck passed 33/33 and lint 18/18 locally; backend tests were 122/122. **[V]**
5. **CI on `main` was red because lint could not run**, reproduced below **[R]** and fixed in the release gate (section 24). A second cause remains: CI has no database, so backend tests cannot pass there.

## 1. Current architecture

- pnpm + Turborepo monorepo: 4 apps (`web`, `seller`, `admin`, `docs`), 19 packages, and a separate NestJS `backend/` with its own CommonJS tsconfig. **[V]**
- `apps/docs` is a 2-file placeholder that renders "Docs". **[V]**
- README listed a `packages/i18n` that does not exist. **[V]** (Corrected in section 23.)

## 2. Current frontend

- `web`: about 30 routes, 193 source files, 23 unit-test files (55 tests). **[V]**
- Placeholder-style screens in `web`: AI assistant, settings, support, sustainability, offline. Search uses a shared layout wrapper but is wired to a query hook. **[V]**
- `seller`: dashboard, analytics, catalog, KYC, login. `admin`: dashboard, disputes, finance, sellers, login. **[V]**
- No rider app and no mobile app anywhere in the repository. **[V]**
- Component packages: `@nova/ui` re-exports the primitives from `@nova/design-system` (its `primitives`, `forms`, `feedback`, `data-display`, `navigation` and `typography` folders are barrel files) and adds commerce, dashboard, layout and utility components. That is one implementation with two import paths, used inconsistently: `web` imports every primitive through `@nova/ui` (54 import statements, none from `@nova/design-system`), while `seller` and `admin` import primitives straight from `@nova/design-system` and take only `DataTable` and `StatCard` from `@nova/ui`. An earlier draft of this audit called these two component libraries; that overstated it. **[V]**
- Three packages are 5 lines or fewer (`storage`, `permissions`, `notifications`); `constants` is 2. `@nova/validation` is 802 lines in one file. **[V]**

## 3. Current backend

- 10 modules, about 62 HTTP handlers, 15 test suites. **[V]**
- Cross-cutting: RS256 JWT, central CASL policy engine, audit log, Redis rate limiting, MFA gate, field-level PII encryption, idempotency keys, transactional outbox, Pino logging with correlation IDs, Sentry, Prometheus `/metrics` behind a bearer token. **[V]**
- OpenAPI is generated as 3.0, not the 3.1 the blueprint specifies. **[V]** (Disclosed in `backend/docs/02-api-standards.md`.)
- `/docs` (Swagger UI) is served in every environment. **[V]**

## 4. Current database

- 31 Prisma models, 9 migrations, PostgreSQL. No DB enums: statuses are strings; `User.roles` is a string array. **[V]**
- Missing models: `Store`, `Review`, `Rider`, `Coupon`, `Address`, negotiation. No product-condition field (new, used, refurbished, upcycled, recycled, custom). **[V]**
- `country_code` is present on the main tables, which supports the Sierra Leone-first, Africa-ready goal. **[V]**

## 5. Current authentication

- Registration always assigns `["customer"]`; no code path grants `seller`, `rider` or `admin`. **[V]**
- `PATCH /me` accepts only `name` and `locale`. **[V]**
- `POST /auth/otp/verify` had no attempt limit. **[V]** (Fixed.)

## 6. Current API

- Errors, pagination and idempotency follow `backend/docs/02-api-standards.md`. **[V]**
- A route-by-route inventory was built and every handler guarded only by `JwtAuthGuard` was checked for service-level ownership enforcement. Orders, wishlist, notifications, delivery jobs, disputes and wallet balance were correct. **[V]**

## 7. Current UI/UX

- 21 files use spinners; 1 uses a skeleton. `BottomNav` exists but is imported nowhere. Checkout has 5 steps against the spec's 4. Cart is not grouped by seller. **[V]** (Some of these were also in earlier notes **[N]**.)
- `web` still has 4 hex colours and 10 raw palette classes; arbitrary-value classes number 216 (web), 22 (seller), 35 (admin), and many are probably token references, so they need triage. **[V]**

## 8. Current marketplace features

- Catalog, search, cart, checkout, orders and wishlist are real. Storefronts, B2B/C2C, custom products and negotiation do not exist. **[V]**

## 9. Current seller features

- KYC submission and catalog listing work. Sellers cannot edit or delete their own products, view their own orders or payouts, or see disputes about their orders. These gaps are logged in `backend/docs/10`. **[V]**

## 10. Current delivery features

- Backend: delivery zones, delivery jobs and proof of delivery; assignment is explicit and admin-only, with no dispatch algorithm. **[V]** No rider UI and no rider onboarding. **[V]**

## 11. Current payment features

- Wallet, double-entry ledger, refunds and payouts with dual authorization. **[V]**
- The payment provider is a stub that always succeeds; there is no webhook handler (one comment reference only) and no reconciliation. **[V]**
- No commission calculation exists and no rate is specified anywhere. **[V]** Cash on delivery does not exist. **[V]**

## 12. Current admin features

- Review queues for KYC, disputes, refunds and payouts only. **[V]**

## 13. Security status

- No secrets tracked: every tracked env file is an `.example`; `.env.local` and `backend/.env` are ignored. **[V]** (Contents were deliberately not read.)
- No `helmet` and no security headers on any app before remediation. **[V]**
- Ownership gaps: see section 23. Open findings are listed there too.

## 14. Testing status

- Before remediation: 122 backend, 55 web, 8 admin and 6 seller tests, plus 85 across `design-system`, `api-client` and `ui`. **[V]**
- Two Playwright specs (purchase journey, seller onboarding). No accessibility, load or visual-regression tooling. **[V]**
- Under a full parallel `turbo run test`, one admin and one seller test timed out at 5 s; both pass in isolation in under 1 s. Backend integration suites also run slowly under load. **[V]**

## 15. Infrastructure status

- Docker Compose (Postgres, Redis), Sentry, Pino, Prometheus. No deploy pipeline, no staging. **[V]**

## 16. Documentation status

- As described in the headline findings. Five filenames were duplicated across phases (`PAYMENT_ARCHITECTURE`, `PAYMENT_SECURITY`, `SELLER_ANALYTICS`, `SELLER_PAYOUTS`, `TESTING_STRATEGY`). **[V]**
- The real specifications are `backend/docs/` (11 files), `docs/frontend/` (9 files including the design system) and the 7-volume Nova Enterprise Blueprint (`.docx`) kept outside the repository. **[N]** (The blueprint was not opened in this audit.)

## 17. Technical debt

- Duplication across web, seller and admin (compared with content hashes and diffs): byte-identical in all three: `instrumentation.ts`, `instrumentation-client.ts`, `lib/sentry-before-send.ts`, `hooks/use-query-client.ts`. Identical between seller and admin only: `theme-provider` (66 lines), `toast-provider` (77), `providers/index.ts`, `app/login/page.tsx`, `app/error.tsx`. Near-identical: `auth-provider` (web 113 lines, seller and admin 106; seller and admin differ by one comment, web by cookie-key constants, the post-logout route and comments), `login-form` (seller and admin differ in two strings), `services/api.ts`, `services/auth.service.ts`, `features/auth/auth.mutations.ts`, `middleware.ts`, `lib/decode-jwt.ts`, `config/app.ts` and `test-utils/query-client.tsx`. Web's `theme-provider` differs from seller and admin only in hard-coding its cookie and storage key, and web's `toast-provider` only in importing `Toast` from `@nova/ui` instead of `@nova/design-system`. An earlier draft said the providers were identical across all three apps; that was wrong. **[V]**
- Test timeouts under parallel load. **[V]**
- `README.md` was stale (described "shells" and "Phase 1"). **[V]**

## 18. Duplications

- See section 17, plus the two import paths in section 2. **[V]**

## 19. Missing features

- Real payment provider and webhooks, commission, stores and product conditions, rider platform, seller self-service, staging and deploy, accessibility tooling. **[V]**

## 20. Risks

- Agents following stub documents would invent rules. Mitigated in section 23.
- Payments always succeed; do not treat checkout as production-safe. **[V]**
- CI is red on `main`, and because it fails at the lint step, the later steps (`format:check`, `typecheck`, `test`, `build`) do not run, so CI currently says nothing about them. **[V]**

## 21. Recommended implementation order

Documentation and security fixes (done, section 23) → foundation (duplicated providers and auth components, `@nova/ui` vs `@nova/design-system`, test timeouts, CI) → customer marketplace → seller self-service → payments (blocked on a provider and a commission decision) → delivery and admin → production hardening.

## 22. Estimated complexity by area

| Area                                             | Complexity                             |
| ------------------------------------------------ | -------------------------------------- |
| Foundation (de-duplication, library, test flake) | M                                      |
| Customer UI conformance                          | M                                      |
| Marketplace model (stores, conditions)           | L (needs documented decisions first)   |
| Seller self-service                              | M                                      |
| Payments                                         | L (blocked on provider and commission) |
| Rider platform                                   | XL                                     |
| Admin breadth                                    | L                                      |
| Deploy and staging                               | L (blocked on platform decision)       |
| Filling the 199 stub documents                   | XL, done incrementally per area        |

## CI verification (reported earlier as "28 of the last 30 runs")

- **[R] The figure reproduces.** GitHub reports 30 `CI` workflow runs between 2026-08-10 and 2026-09-20: **28 failure, 2 success**. The `E2E` workflow has **9 runs, 9 failures**.
- **[V] The failing step is the same on the latest run** (`527516d`): `turbo run lint --filter=...[HEAD^1]`. Install, secretlint and Semgrep pass.
- **[R] Root cause reproduced.** In a clean checkout of `527516d` with dependencies installed and no `prisma generate`, `eslint .` in `backend/` reports **992 errors**, all of the `@typescript-eslint/no-unsafe-*` family (plus 12 `require-await`), because `prisma.*` is typed `any`. After `prisma generate`, the same command reports **0 errors**. `ci.yml` has no `prisma generate` step.
- **[N] Not re-verified:** the cause of the E2E failures (earlier notes say the backend loads `packages/validation` as raw TypeScript in CI, so the API never starts). Only the 0-of-9 count was verified.
- **Consequence:** the current CI status is caused by one missing step and is not evidence about code quality, but it also means the later steps have not run in CI.
- **Fixed afterwards:** see section 24. `ci.yml` was not changed during the remediation itself.

## 23. Remediation log — documentation and security (2026-09-20)

**Documentation**

- The real design-system spec was moved (`git mv`) to `docs/02-uiux-brand/NOVA_UI_UX_DESIGN_SYSTEM.md`.
- `.claude/CLAUDE.md` remains the single authoritative CLAUDE.md; the documentation-system rules were merged into it. Root `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md` and `CHANGELOG.md` were created with real content, and the misplaced copies in `docs/` were removed. `README.md` was updated, not replaced.
- The 199 template files now start with `STATUS: STUB — NOT SOURCE OF TRUTH` and link to a real specification only where one exists.

**Security** (each fix has a test that failed before the change)

- **KYC:** the submission's `subjectId` must equal the authenticated caller (`403 KYC_SUBJECT_MUST_BE_CALLER`).
- **Cart and checkout session:** an owned cart is usable only by its owner; the checkout session records its owner; `POST /v1/orders` rejects anyone else. Before the fix, an authenticated user holding another user's checkout-session ID could place an order from it.
- **OTP verification:** limited to 5 attempts per 60 seconds.
- **Security headers:** Helmet on the backend (strict API policy, one relaxed policy for the Swagger UI, verified in a real browser); a shared header set on the three Next.js apps, verified on a running server. Details: `backend/docs/05-security-baseline.md`.
- **Dependency added:** `helmet` (backend). Reason: nothing in the repository provided security headers, and it is the standard maintained Express middleware. The lockfile change is the 9 `helmet` lines only, validated with a real `pnpm install --frozen-lockfile`.

**Test isolation — correction**

- An earlier version of this log said the added tests exposed a rate-limit flake because parallel Jest workers shared one signup budget, and that a per-app client IP fixed it. That diagnosis was wrong. The backend runs Jest with `maxWorkers: 1`, so spec files run serially, and the only 429s in the logs are the rate-limit spec's own deliberate ones. The per-app IP change was committed in `02b6a3e` and then removed. **[V]** for the configuration and the counts.
- What the failing run did show is one more signup 409 than the specs deliberately produce (3 against 2), and the failure was inside a helper's signup. That pointed to a colliding test phone number. **Phase 5 update (2026-09-21):** a collision was then observed directly (`409 PHONE_ALREADY_REGISTERED` captured inside a helper, and a 409 in the identity spec), so collisions do happen and are now prevented (`9b56505`). It is still **not established** as the cause of the orders failure: that helper also failed once in CI on a brand-new database, where accumulated users cannot explain it.

**Open findings, not fixed** (details in `backend/docs/05-security-baseline.md`)

- Dispute creation does not verify the referenced order or review belongs to the opener.
- The idempotency store is not scoped by user.
- `trust proxy` is not configured, so IP-keyed rate limiting depends on deployment topology.
- Swagger UI is served in every environment.
- `POST /auth/refresh` has no rate limit.
- KYC approval does not grant the `seller` role, and no path grants it.
- No full CSP on the Next.js apps (needs a nonce design).
- `ci.yml` has no Postgres or Redis service and no backend environment, so the backend test step cannot pass in CI (section 24). The missing `prisma generate` step was added in the release gate.
- `notifications.integration.spec.ts` fails intermittently under load (it failed in this audit's first full test run, before any change, and in one of the final two runs). **[V]** Cause, from reading the code but **not reproduced on demand**: the outbox relay's `SKIP LOCKED` claim lets a test's `drainOutbox()` return while the app's background relay tick still has the event in flight. See `backend/docs/06-testing-strategy.md`.
- `backend/docs/06-testing-strategy.md` proposed Vitest and Testcontainers; the backend actually uses Jest against the Docker Compose Postgres and Redis. **[V]** The document now says so.
- `pnpm format:check` exits non-zero locally only because of untracked `.remember/` files, which CI does not see. All tracked files pass. **[V]**

## 24. Release gate — CI fix (2026-09-20, after the remediation)

**Change:** `.github/workflows/ci.yml` now runs `pnpm --filter @nova/backend run prisma:generate` directly after `pnpm install --frozen-lockfile`, so it precedes lint, typecheck, test and build. Nothing else in the workflow changed. `e2e.yml` already ran the same script after install.

**Validated in a clean checkout of `527516d` with only that change applied** (temporary worktree, install with scripts ignored, workflow commands run in order). **[V]**

| Step                                                                          | Result                                                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `prisma generate`                                                             | succeeds (Prisma Client v5.22.0)                                                                          |
| `turbo run lint --filter=...[HEAD^1]`                                         | 18 of 18 tasks pass, 0 cached, including `@nova/backend` (was 992 errors)                                 |
| `pnpm format:check`                                                           | passes                                                                                                    |
| `turbo run typecheck --filter=...[HEAD^1] --force`                            | 33 of 33 pass, 0 cached                                                                                   |
| `turbo run test` (CI-like: no `backend/.env`, no `DATABASE_URL`, no database) | web 55, admin 8, seller 6, design-system 40, api-client 38, ui 7 pass; **backend fails: 14 of 15 suites** |

**What this does not fix.** The backend test failures in that environment are not caused by Prisma: every failing suite stops at `new AppConfigService` because `DATABASE_URL` is not set, and `ci.yml` provides no Postgres or Redis. So once lint passes, the `test` step of `ci.yml` will still fail whenever the backend is among the selected packages. Fixing it means adding database and Redis services and the backend environment to `ci.yml`, as `e2e.yml` does for its jobs. That is a separate change and was not made here.

**Not verified:** GitHub's own run of the workflow. Nothing has been pushed, so the workflow file itself, the Semgrep step (not installed locally) and `turbo run build` were not exercised. For a push to `main`, `--filter=...[HEAD^1]` looks only at the last commit, so a push whose last commit touches only `ci.yml` would select no packages and pass without running anything.

**Post-commit validation (clean checkout of `42418e0`, whole-phase filter `...[527516d]`, all forced, no cache).** **[V]**

- Install, `prisma generate` and secretlint pass. Lint passes 13 of 13 tasks, typecheck 18 of 18, and `format:check` passes.
- Tests pass for the selected non-backend packages: api-client 38, web 56, admin 9, seller 7. The backend suite needs a database, so it was run in the main working tree against Docker Postgres and Redis, not in the clean checkout.
- Builds: the turbo build in the clean checkout ended without a compile result for the Next apps (its log stops partway through the seller build although it recorded exit 0), so it is **not counted**. Seller, admin, web and backend were then built separately in the main working tree, which matches `42418e0` apart from the unrelated `.claude/settings.json`. All four succeed. Web compiles with warnings from the existing Sentry and OpenTelemetry integration, none from the security-header change.

## 25. Phase 5 progress (2026-09-21)

Working branch `phase-5/ci-gate`, pull request #21 (a **draft opened only to make GitHub run the workflows; do not merge**). Full detail is in `NOVA_PHASE_5_FOUNDATION_PLAN.md`; the record of corrected findings is there too.

**GitHub CI, observed on the pull request. [V]**

| Commit    | Result                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `82ee464` | Lint, typecheck and secretlint pass. Test step fails: 15 of 16 backend suites cannot start (no database, no environment).                   |
| `1e38bd2` | Services and backend environment added. Same failure: the variables never reach Jest.                                                       |
| `39eb431` | Turbo strict-mode fix. Backend passes except one orders test (a helper signup failure).                                                     |
| `c68abc8` | **Green**, every step: backend 16 suites and 137 tests against live Postgres and Redis, build included. The scope step reported `mode=all`. |
| `e6234be` | **Green**: backend 17 suites and 141 tests.                                                                                                 |
| `9b56505` | **Green**: backend 18 suites and 149 tests, build included.                                                                                 |

**Root cause of the intermediate failures.** Turbo 2 runs tasks in strict environment mode and passes only variables that `turbo.json` declares. It declared none, so `DATABASE_URL`, `REDIS_URL` and the key variables set by the job never reached the test process. That is invisible locally because `backend/.env` supplies them.

**E2E workflow. [V]** 15 runs, 15 failures. Both jobs fail at "Build and start backend" with `SyntaxError: Unexpected token 'export'` at `packages/validation/src/index.ts`: `node dist/main.js` loads `@nova/validation`, whose `main` is raw TypeScript. It works locally only because Node 24 strips types; CI uses Node 20, which the repository's `engines` allows. So the built backend cannot start on the declared Node range. Not fixed yet (plan item F4).

**Test reliability. [V]** The notifications race was reproduced, explained by instrumentation and fixed in test code only (40 of 40 runs, against 2 of 14 failing). Test phone numbers were replaced by a collision-proof generator. Frontend timeouts were measured and no change was made: the only observed timeouts came from machine load, and CI has large headroom. Details and the open items are in the plan (items A and E).

**Package classification.** `NOVA_PACKAGE_STATUS.md` classifies every workspace package and application; five packages are PLACEHOLDER, none is DEPRECATED or REMOVE.

**Limits of this verification.** GitHub has executed the `pull_request` path only. The scope script's `filtered` and `none` branches and the `push` path have not run on GitHub. The frontend load condition "three suites plus the backend at once" was not reproduced because it exhausted this machine's memory during measurement (Docker restarted once).
