# Nova Phase 5 — Foundation Plan

**Status: APPROVED 2026-09-21 and IN PROGRESS.** Items A, E (backend), F1 and F2 are done; the rest follow the order below. Each item records its own outcome.

**Working branch:** `phase-5/ci-gate` (pull request #21, a **draft opened only to make GitHub run the workflows; do not merge**). Nothing has been pushed to `main`.

**Evidence tags:** **[V]** verified in this session, **[N]** carried from earlier notes and not re-verified, **[H]** hypothesis that has not been reproduced.

## Approved decisions (2026-09-21)

1. **`@nova/app-shell`.** A new package for shared application-shell concerns: shared providers, shared authentication infrastructure, application-level configuration, and role-specific configuration passed as parameters. It contains no seller- or admin-specific business logic; seller and admin each supply their own role, cookie configuration, login destination, permission configuration and application settings. Domain and business logic stay outside it.
2. **Component imports.** `@nova/ui` is the application-facing component API: application → `@nova/ui` → `@nova/design-system`. No second component implementation. Before migrating seller and admin imports: measure current bundle sizes, measure the effect of the migration, inspect the `recharts` dependency and the packages' exports, and avoid unnecessary growth. No blind mass replacement.
3. **GitHub CI.** Push to a dedicated branch only, never `main`, to observe the real workflow. The CI gate is not called verified until GitHub has executed the relevant jobs.
4. **CI backend test infrastructure (F1/F2).** Give the backend job the Postgres, Redis and environment it needs; do not weaken or skip backend tests. A workflow must not report a meaningful green because relevant jobs were filtered out (the `HEAD^1` behaviour).
5. **Frontend `testTimeout`.** Do not raise it first. Measure the timeout, actual durations, the slowest tests, correlation with Turbo concurrency and whether there is a genuine performance problem; adjust only if evidence requires it, and document why.
6. **Placeholder packages and `apps/docs`.** Keep them; classify them ACTIVE, PLANNED, PLACEHOLDER, DEPRECATED or REMOVE (see `NOVA_PACKAGE_STATUS.md`); spend little effort on `apps/docs`.
7. **Corrected findings** are preserved without rewriting history (next section).
8. **Order:** A/E test reliability → F1/F2 CI infrastructure → D component boundary → B shared app-shell and providers → C shared authentication. After each step: inspect the diff, run tests, typecheck and lint, check bundle impact where relevant, update documentation, report. No customer-marketplace expansion in Phase 5.
9. **Notifications race.** Reproduce first; identify the synchronization contract before changing production behaviour.
10. **Definition of done:** CI backend infrastructure functional; GitHub executes the relevant jobs; backend tests run against their services; reliability issues fixed or explicitly documented; component boundaries intentional; providers and authentication extracted without behaviour, role or cookie regressions; bundle impact measured; typecheck, lint and tests pass; documentation matches the final architecture; no unreviewed architectural duplication remains.

## Corrected findings (record)

| Item                    | Previous statement                                                                                                              | Correct finding                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate-limit explanation  | Parallel Jest workers shared a signup rate-limit budget, so added tests made unrelated suites fail with 429 (commit `02b6a3e`). | **Wrong.** The backend Jest configuration sets `maxWorkers: 1`, so spec files run one after another, and the only 429s in the logs are the rate-limit spec's own deliberate ones. Corrected by `82ee464`, which removed the per-app client IP. History was not rewritten.                                                                                                                         |
| Phone-number collisions | Suspected as the cause of the orders-test failure (unconfirmed).                                                                | **Still unconfirmed as the cause of the orders failure.** In Phase 5 a collision was observed directly (`409 PHONE_ALREADY_REGISTERED` in the notifications helper, and a 409 in the identity spec), so collisions do happen and are now prevented. The orders failure was also seen once in CI on a brand-new database, where accumulated users cannot explain it; its cause is not established. |
| Provider duplication    | `theme-provider` and `toast-provider` are identical across web, seller and admin.                                               | Identical between **seller and admin only**. Web hard-codes its cookie and storage key and imports `Toast` from `@nova/ui` instead of `@nova/design-system`.                                                                                                                                                                                                                                      |
| Component libraries     | Two component libraries, `@nova/ui` and `@nova/design-system`.                                                                  | `@nova/ui` **re-exports** `@nova/design-system`; they are not two independent implementations. Web imports through `@nova/ui` (54 import statements, none from `@nova/design-system`); seller and admin mostly import from `@nova/design-system` (6 and 7 statements) and take only `DataTable` and `StatCard` from `@nova/ui`.                                                                   |

## Progress

| Item                             | State                                           | Evidence                                                                                                                                                  |
| -------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A notifications race             | **Done** (`e6234be`)                            | Reproduced, explained, fixed test-only; 40 of 40 runs pass against 2 of 14 failing before; GitHub CI green.                                               |
| E test reliability, backend      | **Done** (`9b56505`)                            | Shared user helper and collision-proof phone numbers; details below.                                                                                      |
| E test reliability, frontend     | **Measured; no change needed**                  | See item E.                                                                                                                                               |
| F1 CI backend infrastructure     | **Done, verified on GitHub**                    | Backend runs 137 tests against live Postgres and Redis in CI.                                                                                             |
| F2 CI scope                      | **Done, verified on GitHub**                    | `select-scope.sh` reports its decision in the job summary.                                                                                                |
| D component boundary             | **Done, verified on GitHub**                    | Charts behind `@nova/ui/charts`, `sideEffects` flags, 13 imports moved, rule enforced; bundle effect in ADR-0001.                                         |
| B shared app-shell and providers | **Done, verified on GitHub**                    | `@nova/app-shell`: theme, toast and query client; GitHub build: 0 of 55 routes changed size.                                                              |
| C shared authentication          | **Done** (login mutation and form left per app) | Redirect, JWT, cookie, role guard, session service and AuthProvider in `@nova/app-shell`; 101 package tests; GitHub `verify` green, 4 of 55 routes +1 kB. |
| F4 E2E workflow                  | Cause verified; fix not started                 | See item F.                                                                                                                                               |

## Recommended order

| Step | Items                                                            | Why here                                                                                      |
| ---- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1    | **A** notifications race, **E** timeouts and test-data flakiness | Every later refactor is only as trustworthy as the tests that guard it.                       |
| 2    | **F1** CI backend tests, **F2** CI change filter                 | So CI actually runs what the refactors need. Needs a pushed branch to verify (your decision). |
| 3    | **D** one import path for components                             | Smallest and lowest risk; settles which package the shared providers import from.             |
| 4    | **B** shared providers, then **C** shared authentication         | Largest changes; B before C because auth is the security-sensitive part.                      |
| 5    | **F3–F8** remaining debt                                         | As capacity allows.                                                                           |

**Working rules for every item:** one focused commit (or a small series) per item; run typecheck, lint, the relevant tests and a build before and after; no behaviour change unless the item says so; update the listed documents in the same commit; report changed files, results and risks.

---

## A. Notifications integration-test race

**Current implementation.**

- `OutboxRelayService` (`backend/src/common/outbox/outbox-relay.service.ts`) starts its own self-rescheduling timer in `onModuleInit`, polling every 500 ms in batches of 20. **[V]**
- `processPendingEvents()` claims rows with `SELECT … FOR UPDATE SKIP LOCKED` inside one transaction, runs the handlers, then marks the rows published. Handlers write through Prisma outside that transaction, so a notification can be committed before the relay's transaction commits. **[V]**
- `notifications.integration.spec.ts` is the only spec that drains the outbox. Its `drainOutbox()` loops `processPendingEvents(200)` until it returns 0. **[V]**

**Problem.** If the background timer's tick has already claimed a row, the test's call skips it (`SKIP LOCKED`), returns 0 and the helper concludes the outbox is empty while the handler is still running. The next read then misses the result. **[H]** — the mechanism follows from the code, but it has not been reproduced on demand. Observed failures: `unreadCount` was 0 after `OrderPlaced`; a `refund.executed` notification was missing. The spec failed in 3 of the 8 full backend runs made in this session (a small sample). **[V]**

**Proposed target.**

1. **Reproduce first:** run the spec in a loop (for example 30 times, under load) and record the failure rate and which assertion fails.
2. **Fix in the test helper only:** a shared `test-utils/drain-outbox.ts` that keeps processing and also waits until no `outbox_events` row has `published_at IS NULL`, with a bounded timeout that fails loudly. Rows stay unpublished until the claiming transaction commits, so "zero unpublished" is the correct completion condition.
3. **Only if that is not enough:** an explicit configuration switch to disable the background timer in test apps. That touches production code and needs its own review.

**Files/packages.** `backend/src/modules/notifications/notifications.integration.spec.ts`, new `backend/src/test-utils/drain-outbox.ts`; `outbox-relay.service.ts` only for step 3.

**Migration risk.** Low; test-only. The risk is a helper that hides a real bug, which the bounded, loud timeout prevents.

**Tests required.** The failure-rate loop before and after (same count, same conditions). A test of the helper itself: hold a row locked in an open transaction, start the drain, release the lock, and assert the drain waits and then completes.

**Documentation to change.** `backend/docs/06-testing-strategy.md` (change "suspected" to the confirmed cause), the audit's open-findings list, `CHANGELOG.md`.

**Outcome (2026-09-21): done, `e6234be`.** The failure was reproduced first (2 of 14 runs of the spec alone, in different tests each time; 3 of 25 in an instrumented copy; no handler or relay error logged). The synchronization contract was identified before any change: the relay claims rows in one transaction, handlers write on their own connections, and `published_at` is set only when that transaction commits, so "no unpublished rows remain" is the completion condition, and "a poll returned 0" is not. Instrumenting the drain showed every failing run coincided with a drain that returned while events (for example `OrderPlaced` and `PaymentSucceeded`) were still unpublished, and no failure occurred without one. The fix is test-only (`test-utils/drain-outbox.ts`, with a spec that reproduces the race deterministically); the relay and production behaviour are unchanged. Verified: 40 of 40 runs pass; GitHub CI green (17 suites, 141 tests).

Two observations were made and deliberately **not** acted on, because they concern production shutdown behaviour and need their own evidence-first investigation: once a Jest process did not exit after the tests finished ("Jest did not exit one second after the test run has completed"), and "Outbox relay poll failed: Transaction not found" was logged at suite teardown. A hypothesis, unverified: `PrismaService.onModuleDestroy` disconnects the database before `OutboxRelayService.onApplicationShutdown` stops the poll timer (Nest runs the former first), so a poll can start against a disconnected client.

---

## E. Test timeouts and flakiness

**Current implementation.**

- Frontend: `apps/{web,seller,admin}/vitest.config.ts` set only `environment` and `setupFiles`, so every test has Vitest's 5 s default timeout. **[V]** Under a full parallel `turbo run test`, one admin test (6.3 s) and one seller test (8.4 s) timed out; both take under 1 s alone. **[V]**
- Backend: Jest with `maxWorkers: 1` and `testTimeout: 20000`, so spec files run one after another. The database is never cleaned between runs. **[V]**
- Backend test users: 30 signup call sites in 12 spec files, 10 local `signUp*` helpers. Several build a phone number from a fixed prefix plus four hex characters, for example `+2327600${suffix.slice(0, 4)}`, which is 65,536 values. **[V]**

**Problem.**

- Frontend timeouts under load are a resource-contention symptom, not a slow-test finding. The cause has not been measured. **[H]**
- Backend: one failing full run logged three signup 409s where the specs deliberately produce two, and the failure was inside a helper's signup. This points to a colliding phone number; the run's log was not kept. **[H]** An earlier claim that parallel workers shared a rate-limit budget was wrong and has been withdrawn.
- Thirty scattered signup helpers mean any fix has to be applied thirty times.

**Proposed target.**

1. **Measure before changing anything:** run each suite repeatedly (for example 10 full `pnpm test` runs and 20 backend runs), recording failures and per-test durations. Capture the status and error code of any failing helper signup.
2. **Backend:** one shared `test-utils/users.ts` with a collision-free phone generator (a wide random range or a time-plus-counter scheme) and one `signUp` helper; migrate the specs to it in a single mechanical commit.
3. **Frontend:** limit test concurrency in CI and the root `test` script if measurement shows CPU contention; consider a documented, moderate `testTimeout` only as a stopgap, never as the fix.

**Files/packages.** `apps/{web,seller,admin}/vitest.config.ts`, root `package.json` and `turbo.json`, `backend/src/test-utils/users.ts` (new) and the 12 backend specs that sign users up.

**Migration risk.** Low. The backend change is mechanical, and each spec's assertions stay untouched.

**Tests required.** The before/after repeat-run tables. A unit test that the phone generator produces no duplicates over a large sample. Full suites green.

**Documentation to change.** `backend/docs/06-testing-strategy.md`, the audit, `CHANGELOG.md`.

**Outcome (2026-09-21).**

_Backend: done, `9b56505`._ A phone collision was observed directly: an instrumented run captured `409 PHONE_ALREADY_REGISTERED` inside a helper, and a full run failed in the identity spec with `expected 201, got 409` on a `+2327600` plus four hex characters payload, its signup statuses showing one more 409 than the specs deliberately produce. `test-utils/users.ts` now draws ten random digits (10^10 values), retries only a phone or email conflict, and throws with the status and body for anything else. Nine specs share it, the identity and rate-limit specs use the generator, and no ad-hoc generator remains. The one CI failure of the same helper on an empty database is **not** explained by this and remains open; the new error message will say why if it recurs. An earlier draft of the helper's own unit test asserted that 100,000 draws from 10^10 values are unique, which fails about 40% of the time by the birthday bound; it was corrected to a sample where a duplicate is astronomically unlikely.

_Frontend: measured, no timeout change._

| Measurement                                                                             | Result                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current timeout                                                                         | 5000 ms, the Vitest default; nothing is configured in `apps/*/vitest.config.ts`.                                                                                         |
| Slowest tests, each app run alone, this machine while short of memory (349–802 MB free) | 3.2 s (seller KYC onboarding), 2.4 s and 2.4 s (web notifications, wallet), 2.3 s (admin dispute detail). No test above 4 s; 0 failures in 6 app runs.                   |
| The same tests earlier, machine not short of memory                                     | About 1 s (admin dispute detail 0.94 s, seller catalog 1.0 s), so 2–3 times slower purely from memory pressure.                                                          |
| Total time spent inside the 56 web tests                                                | About 27 s here (short of memory); about 7–9 s on GitHub's clean 2-core runner.                                                                                          |
| GitHub CI                                                                               | Frontend suites passed in every run on this PR; no timeout.                                                                                                              |
| Where timeouts did occur                                                                | Only in the first audit run: an admin test at 6.3 s and a seller test at 8.4 s, during a full parallel `turbo run test` that also ran the backend suite on this machine. |
| Genuine performance problem                                                             | None found: these are React Testing Library flows that finish in about a second on a healthy machine.                                                                    |

Decision: **no change to `testTimeout`.** It is not necessary: CI has large headroom, and the local failures track machine load, which a longer timeout would only hide. The condition "three frontend suites plus the backend suite at once" was deliberately not reproduced: at this memory level it already crashed Docker once during measurement. If timeouts appear on a healthy runner, reopen this with the slowest-test evidence, not a blanket increase. A cap on local test concurrency would be the first thing to try, but it was not demonstrated to help and so was not added.

_Environmental failures seen while measuring_ (not test defects): the Docker containers restarted mid-run when the machine ran out of memory (`Can't reach database server`), and two 20-second timeouts occurred in the logistics spec while roughly 100–250 MB of memory was free; the latter is suspected, not proven, to be memory starvation.

---

## F1. CI cannot run the backend tests

**Current implementation.** `ci.yml` (now with `prisma generate`) has no Postgres or Redis service and no backend environment. In a clean checkout, 14 of 15 backend suites fail at `new AppConfigService` for lack of `DATABASE_URL`. **[V]** `e2e.yml` already contains a working recipe: `postgres:16-alpine` and `redis:7-alpine` services with health checks, ephemeral generated keys (JWT key pair and PII key), a composed `DATABASE_URL` and `prisma migrate deploy`. **[V]**

**Problem.** Any push or PR that selects the backend fails at the `test` step.

**Proposed target.** Reuse the `e2e.yml` recipe in `ci.yml`: services, generated keys, `migrate deploy`. No repository secrets are needed; all values are ephemeral.

**Files/packages.** `.github/workflows/ci.yml` only.

**Migration risk.** Low to medium: longer CI time; the workflow can only be verified by a real run.

**Tests required.** A pushed branch or PR whose CI run is green with the backend tests included.

**Documentation to change.** `backend/docs/06-testing-strategy.md`, `CHANGELOG.md`, the audit's section 24.

## F2. The CI change filter is vacuous on pushes

**Current implementation.** Every step uses `--filter=...[HEAD^1]`. For a push to `main` this compares only the last commit, so a last commit that touches only `ci.yml` selects no packages and the job passes without running anything. Pull requests are unaffected because the checkout is a merge commit. **[V]** (demonstrated for `42418e0`)

**Proposed target.** Use the pushed range for pushes (`github.event.before`) and the base branch for pull requests, or run everything on `main`.

**Migration risk.** Low; longer runs on `main`. **Tests required.** A pushed branch showing the intended package selection. **Documentation.** `CHANGELOG.md`, audit section 24.

**Outcome (2026-09-21): done, verified on GitHub.** Adding the services and a backend environment (`1e38bd2`) was not enough: the run failed identically (15 of 16 suites) because Turbo 2's strict environment mode passes only variables that `turbo.json` declares, and it declared none, so `DATABASE_URL`, `REDIS_URL` and the key variables never reached Jest even though the job had set them. This is invisible locally because `backend/.env` supplies them. `39eb431` adds an `@nova/backend#test` task that passes those five variables through (not part of the cache hash, verified with `turbo --dry=json`) and turns caching off for it, because a cache hit would replay a "pass" without touching the database. A composite action, `.github/actions/backend-test-env`, composes `DATABASE_URL` at runtime, generates throwaway secrets with each value masked in the log, and applies the migrations. On GitHub the backend then ran 16 suites and 137 tests green against live Postgres and Redis (migrations applied, 613 request-completed lines, no cached replay), with lint, typecheck and build green. One intermediate run failed on a single orders test (the open signup failure recorded under item E).

**Outcome (2026-09-21): done, verified on GitHub (`c68abc8`).** `.github/scripts/select-scope.sh` decides the scope, runs everything when a filter cannot be trusted (base unavailable, or CI or workspace configuration changed), filters otherwise, and says so explicitly when nothing is affected; later steps are skipped visibly, not silently. It was tested locally on real ranges (whole-phase push, last-commit range, no change, unresolvable base, zero base, and the `ci.yml`-only last commit that used to pass vacuously). On this pull request GitHub reported `mode=all` because CI files changed. **Not yet exercised on GitHub:** the `filtered` and `none` branches, and the push (as opposed to pull-request) path; they will first run on a push to `main`.

---

## D. `@nova/ui` and `@nova/design-system`

**Current implementation.** (This corrects the audit's earlier "two component libraries".)

- `@nova/ui` depends on `@nova/design-system` and re-exports every one of its components through barrel folders (`primitives`, `forms`, `feedback`, `data-display`, `navigation`, `typography`). It adds `commerce`, `dashboard` (charts, `DataTable`, `StatCard`), `layout` and `utility` components. **[V]** It also re-exports `ThemeProvider`.
- Real usage: `web` has 54 import statements from `@nova/ui` and none from `@nova/design-system`. `seller` has 6 from `@nova/design-system` and 1 from `@nova/ui`; `admin` has 7 and 4. `seller` and `admin` take only `DataTable` and `StatCard` from `@nova/ui`. **[V]**
- `docs/frontend/05-design-system-usage.md` says apps use design-system for primitives and ui for higher-level components and that `web` does exactly this. That is wrong for `web`. **[V]**
- Neither package sets `sideEffects: false`, and `@nova/ui` depends on `recharts`. **[V]**

**Problem.** One implementation with two import paths, chosen inconsistently. It is a documentation and convention drift, not duplicated code, so nothing needs merging.

**Proposed target (recommended: Option 1).**

- **Option 1:** apps import every component from `@nova/ui`; `@nova/design-system` is used only for tokens, theme and CSS entry points. 13 import statements change (in `seller` and `admin`). An ESLint `no-restricted-imports` rule in `@nova/eslint-config` enforces it.
- **Option 2:** apps import primitives from `@nova/design-system` as the docs say. About 54 statements change in `web`.
- Design-system deviations from the spec (weights 300/800/900, 6 px button and input radius against 8 px, 40 px default button, no 20 px spacing token) are a design-conformance task for the customer marketplace phase, not part of D. **[N]**

**Files/packages.** `apps/seller/src/**` and `apps/admin/src/**` (about ten files), `packages/eslint-config/`, `docs/frontend/05-design-system-usage.md`.

**Migration risk.** Low for type safety, because the bindings are the same. The real risk is bundle size: importing everything through the `@nova/ui` barrel could pull `recharts` into `seller` and `admin` if tree-shaking does not remove it. Baselines from this session's builds: shared First Load JS is 221 kB (`seller`), 221 kB (`admin`) and 222 kB (`web`). **[V]**

**Tests required.** Typecheck and existing tests. A lint fixture proving the new rule rejects a forbidden import. Build size before and after, with no growth beyond a stated tolerance; if there is growth, add `sideEffects` or `optimizePackageImports` first.

**Documentation to change.** `docs/frontend/05-design-system-usage.md` (correct the `web` claim and state the rule), the README workspace description, an ADR in `NOVA_ARCHITECTURE_DECISION_RECORDS.md`, `CHANGELOG.md`.

**Outcome (2026-09-21): done.** The measurement was done first, as decided, and it changed the plan: the bundle problem was already present, before any migration.

- _Inspected:_ `@nova/ui` ships as source (`main` is `src/index.ts`), had no `exports` map and no `sideEffects` flag, and its root barrel re-exported `BarChart`, `LineChart` and `PieChart`, the only files that import `recharts`. No app renders a chart. `@nova/design-system` has an `exports` map (`.` and its CSS) and no `sideEffects` flag. Neither package has import-time side effects (no bare imports, no top-level DOM access, CSS reached through CSS `@import`).
- _Measured (GitHub CI builds, per-route First Load JS):_ `web` loaded a 427 kB (uncompressed) `recharts` chunk on 44 of 53 routes, a median route of 377 kB against a 222 kB shared base. `seller` and `admin` did not include it.

| App                                 | Median    | p90       | Max       |
| ----------------------------------- | --------- | --------- | --------- |
| `web`, baseline                     | 377       | 395       | 414       |
| `web`, after `sideEffects` flags    | 246       | 388       | 393       |
| `web`, after charts entry point     | 246       | 276       | 285       |
| `web`, after seller/admin migration | 246       | 276       | 285       |
| `seller`, baseline → final          | 240 → 240 | 263 → 250 | 263 → 250 |
| `admin`, baseline → final           | 251 → 245 | 255 → 251 | 255 → 251 |

- _What was done:_ (1) `sideEffects` flags, which fixed 29 of 40 `web` routes but left six heavy, so they were not enough on their own; (2) the chart components moved behind `@nova/ui/charts` (an `exports` map and a `tsconfig.base.json` alias), which removed `recharts` from the root entry by construction instead of depending on tree-shaking, and fixed the remaining routes; (3) the 13 `seller` and `admin` import statements swapped to `@nova/ui`; (4) a `no-restricted-imports` rule scoped to `apps/**`, with a `node:test` suite (10 tests) and an end-to-end check that the real config rejects a planted violation.
- _Growth:_ no `web` or `admin` route grew. One `seller` route, `/analytics`, grew from 240 to 242 kB (+0.8%) with an unchanged component list; the cause was not isolated. The tolerance applied is 3 kB (about 1%) per route, treated as chunk-splitting noise.
- _Local checks:_ `ui` 12 tests, `seller` 7, `admin` 9; typecheck and lint clean for all affected packages. GitHub CI green on every commit of this step.
- _Not done here:_ the design-system deviations from the spec (weights, radii, button height) remain a design-conformance task for the marketplace phase, as planned.
- _Correction to the plan text above:_ the plan proposed measuring build size with local builds; local builds exhausted this machine's memory (a V8 out-of-memory abort, and Docker restarted twice during Phase 5), so all bundle numbers come from GitHub's builds, compared like for like.

---

## B. Shared providers

**Current implementation.** **[V]**

| File                                                                           | web        | seller | admin | Difference                                                                                                |
| ------------------------------------------------------------------------------ | ---------- | ------ | ----- | --------------------------------------------------------------------------------------------------------- |
| `providers/theme-provider.tsx`                                                 | 66         | 66     | 66    | seller and admin identical; web hard-codes its cookie and storage key, the others use `COOKIE_KEYS.theme` |
| `providers/toast-provider.tsx`                                                 | 77         | 77     | 77    | seller and admin identical; web imports `Toast` from `@nova/ui`, the others from `@nova/design-system`    |
| `providers/app-providers.tsx`                                                  | 42         | 33     | 35    | app-specific composition                                                                                  |
| `hooks/use-query-client.ts`                                                    | 23         | 23     | 23    | identical in all three                                                                                    |
| `test-utils/query-client.tsx`                                                  | 37         | 30     | 30    | 2 lines between seller and admin, 9 for web                                                               |
| `instrumentation.ts`, `instrumentation-client.ts`, `lib/sentry-before-send.ts` | 33, 21, 21 | same   | same  | identical in all three                                                                                    |

**Problem.** Three copies that have already drifted (web hard-codes keys; comments say "copied from apps/admin"). A fix has to be made three times.

**Proposed target.** A new workspace package, proposed name `@nova/app-shell`, holding React providers and hooks parameterized by props:

- `ThemeProvider({ storageKey })`, `ToastProvider`, a query-client factory, and the shared test render helper.
- The Sentry files stay in each app because Next.js requires `instrumentation.ts` at the app root, but become one-line re-exports of shared code. This is the last, optional step.

Alternatives considered: `@nova/hooks` (a 14-line stub) is the wrong shape for React providers; `@nova/auth` (9 lines, contracts only) would gain a React and Next dependency and would then have to depend on the UI layer. A new package keeps `@nova/auth` a light contract package.

**Files/packages.** `apps/*/src/providers/*`, `apps/*/src/hooks/use-query-client.ts`, `apps/*/src/test-utils/query-client.tsx`, `apps/*/src/app/layout.tsx` (imports), new `packages/app-shell/`, `tsconfig.base.json`, root `tsconfig.json` references, `transpilePackages` in the three `next.config.ts` files, `pnpm-lock.yaml` (workspace links only).

**Migration risk.** Medium.

- Cookie and `localStorage` key names must stay app-specific and unchanged. Cookies are not port-isolated on `localhost`, which is why each app has its own names; changing them would log users out and break the middleware.
- `"use client"` boundaries and Next transpilation of a new package.
- The lockfile must be changed by adding workspace links only and validated with a real frozen install (see the repository's lockfile notes).

**Tests required.** Characterization first: the existing app tests must pass unchanged. New package tests for theme persistence under a given key, toast behaviour and query-client defaults. Builds of all three apps. A browser check of theme toggling and toasts in each app.

**Documentation to change.** `docs/frontend/04-state-management.md`, `docs/frontend/05-design-system-usage.md`, the README workspace layout and "Adding a New Package" section, an ADR for the new package, `CHANGELOG.md`.

**Outcome (2026-09-21): done for the providers; authentication is item C.**

- _Re-measured before writing code:_ the toast provider (77 lines) and the query-client hook (23 lines) are byte-identical in `web`, `seller` and `admin` (the "package `Toast` is imported from" difference in the table above was removed by step D). The theme provider (66 lines) is identical in `seller` and `admin`, and `web` differs only in hard-coding `"nova_theme"`, which equals its `COOKIE_KEYS.theme`. The three apps' `QUERY_STALE_TIME.short` is the same 30 000 ms. So this was triplicated code, not near-duplicated code.
- _What was built:_ `packages/app-shell` (`@nova/app-shell`, source-only like `@nova/ui`, `sideEffects: false`, depends on `@nova/ui`, `@tanstack/react-query` and `react`). `ThemeProvider` takes a required `storageKey` (the cookie and `localStorage` name); `ToastProvider` and `useToast` are unchanged; `createQueryClient` and `useQueryClientInstance` take a required `staleTime`. It contains no seller, admin or domain logic.
- _How the apps use it:_ each app keeps its three files (`providers/theme-provider.tsx`, `providers/toast-provider.tsx`, `hooks/use-query-client.ts`) as thin wrappers that bind the app's own setting (`COOKIE_KEYS.theme`, `QUERY_STALE_TIME.short`) or re-export. Every existing import path is unchanged, so no call site moved. About 380 lines net were removed. Cookie and storage keys are unchanged, so nobody is signed out or loses a preference.
- _Tests first:_ 16 tests in the package (theme: default, persistence under the given key in both cookie and `localStorage`, two keys not leaking into each other, saved value winning over the initial one, following the OS only in system mode; toast: helpers, the 4 s default, explicit and zero durations, dismissing one of several, unique ids; query client: defaults, independence, stability across renders). Two mutations (a hard-coded key, and no listener cleanup) were introduced on purpose and each was caught by the tests.
- _One behaviour change, deliberate:_ the three original providers registered the OS colour-scheme listener once and never removed it when the user chose an explicit theme, so a later OS change replaced the user's explicit choice with the system one. The shared provider keys the listener on the current theme, so it is dropped when an explicit theme is chosen. The tests pin it. This is a bug fix in a place that had to be rewritten to be shared; it is recorded here so it is not mistaken for a pure move.
- _Wiring:_ `transpilePackages` in the three `next.config.ts` files, the workspace dependency in each app's `package.json`, `tsconfig.base.json` path alias, tsconfig references, and one entry in the ESLint default-project list for the package's Vitest config. The lockfile gained only workspace links and the new importer (37 lines added, none changed), and was validated with a real `pnpm install --frozen-lockfile`.
- _Local checks:_ package 16 tests, typecheck and lint clean; `web` 56 tests, `admin` 9, `seller` 7 (unchanged counts); typecheck and lint clean for all three apps. **Not verified locally:** a production build of any app (this machine cannot run them); that and the bundle effect come from the GitHub build. A browser check of theme toggling and toasts in each app has not been done.
- _One test flake seen:_ in the first full `seller` run after the install, `CatalogScreen > creates a product...` timed out at 5.19 s (the 5 s default). Alone it takes 0.8 to 1.4 s, and two further full runs passed. This is the load-related slowness already measured under item E (a cold run on a machine short of memory), not a result of this change; it is one more data point that a cold first run can sit close to the limit. No timeout change was made.
- _GitHub (commit `9f41687`):_ the `verify` job passed and 0 of 55 routes changed size; first-load JS median, p90 and max are web 246, 276, 285 kB, seller 240, 250, 250 kB, admin 245, 251, 251 kB, identical to the step D measurements.
- _Not done here:_ the Sentry files and `test-utils/query-client.tsx` stay per-app (the plan called the Sentry step optional and last), and the shared test render helper was not extracted.

---

## C. Shared authentication

**Current implementation.** **[V]**

| File                                 | web                | seller | admin  | Difference                                                                                                     |
| ------------------------------------ | ------------------ | ------ | ------ | -------------------------------------------------------------------------------------------------------------- |
| `providers/auth-provider.tsx`        | 113                | 106    | 106    | seller/admin differ by one comment; web by cookie-key constants, post-logout route (`/` vs `/login`), comments |
| `features/auth/login-form.tsx`       | 62 (`components/`) | 55     | 55     | seller/admin differ in two strings; web is separate                                                            |
| `services/auth.service.ts`           | 75                 | 56     | 53     | comments; web has signup and OTP flows                                                                         |
| `features/auth/auth.mutations.ts`    | 103                | 68     | 68     | seller/admin differ in comments; both carry the same `sanitizeRedirect`                                        |
| `middleware.ts`                      | 82                 | 55     | 61     | seller/admin differ only in the required role constant and comments; web also handles locale                   |
| `lib/decode-jwt.ts`, `config/app.ts` | 13, 20             | 14, 17 | 14, 16 | cookie keys and role constants                                                                                 |

**Problem.** Security-relevant logic is copied: the open-redirect sanitizer (`sanitizeRedirect`), the middleware role gate, and cookie clearing. Comments already say "copied from". The middleware gate decodes a JWT from a cookie as a UX guard; the server remains authoritative for authorization, and that must stay true.

**Proposed target.** In `@nova/app-shell`: `sanitizeRedirect`, `decodeJwt`, `createRoleGuardMiddleware({ role, cookieKey, publicRoutes, loginPath, forbiddenPath })`, `AuthProvider({ cookieKeys, postLogoutPath })`, an auth service factory taking the API client, `useLoginMutation`, and a `LoginForm` taking title and description. Each app keeps a thin `middleware.ts` (Next requires the file and its `config.matcher` in the app). Web's customer flows (signup, OTP, locale-aware middleware) stay in web; only the parts that are genuinely shared move.

**Files/packages.** As B, plus `apps/*/src/middleware.ts`, `apps/*/src/features/auth/**`, `apps/*/src/services/auth.service.ts`, `apps/*/src/lib/decode-jwt.ts`, `apps/*/src/config/app.ts`.

**Migration risk.** Higher than B, because this is the security surface.

- The role gate, redirect handling and cookie clearing must behave exactly as today; nothing may be weakened to make the extraction simpler.
- Extract in this order, one commit each: pure functions with tests (`sanitizeRedirect`, `decodeJwt`), then the service and mutations, then the provider, then the middleware factory.
- Do not start until B has landed.

**Tests required.** Unit tests: `sanitizeRedirect` (`//evil.com`, `https://evil.com`, backslash forms, non-string), `decodeJwt` (malformed input), the role gate (no cookie goes to login with a redirect parameter, wrong role goes to `/forbidden`, public routes stay public), the provider (silent refresh on boot, logout clears the cookie and routes correctly). Existing app tests unchanged. The two existing Playwright specs run locally. A manual login and logout in each of the three apps.

**Documentation to change.** `docs/frontend/03-routing-and-app-structure.md` (the two-layer guard), `docs/frontend/00-app-map.md`, `backend/docs/05-security-baseline.md` (client guard versus server enforcement), an ADR, `CHANGELOG.md`.

**Outcome (2026-09-21): done, except the login mutation and login form.**

Built in the order the plan set (pure functions first, then the guard, then the provider), tests first, one verified step at a time:

- _Redirect, JWT and cookie helpers._ `sanitizeRedirect`, `decodeJwtPayload` and the session-cookie helpers (parse, read, write, clear; the key is a parameter). **[V] A security finding came out of the tests:** the `sanitizeRedirect` copies in `seller` and `admin` accepted `/\evil.com` and paths with an embedded tab, newline or carriage return. A URL parser reads a backslash as a slash and drops tabs and newlines, so all of these resolve to another origin (checked with the WHATWG `URL` parser in Node; not exercised in a browser). After signing in, a crafted login link could have sent the user to another site. The shared version refuses them; the original implementation fails 8 of its 26 tests. `web` never reads the `redirect` parameter (it writes it into the login URL but does not consume it), so it was not exposed. This is a behaviour change, made deliberately.
- _Role guard._ `createRoleGuard({ sessionCookieKey, requiredRole, loginPath, forbiddenPath, publicRoutes })` on its own entry point, `@nova/app-shell/middleware`, because it imports `next/server`; a test keeps it out of the root entry that client components import. `seller` and `admin` keep a six-line `middleware.ts` that calls it and exports its own `config.matcher` (Next.js needs it as a literal in that file). `web` keeps its locale and protected-route logic and only shares the session parser. **One deliberate tightening:** public routes match whole path segments, where the copies used `startsWith("/login")`, so a future `/login-history` page would have been public without anyone deciding so (4 tests fail against the old matching).
- _Session service and `AuthProvider`._ `createSessionService(getApiClient)` (login, restoreSession, logout, sessionFromAuthResponse) and `AuthProvider` / `useAuth`, with the cookie key, the post-logout page, the session service and the token clearing as parameters. Cookie names (`nova_session`, `nova_seller_session`, `nova_admin_session`), roles and destinations (`/` for `web`, `/login` for the others) are unchanged. The three root layouts dropped their inline copy of the session parser.
- _Tests:_ package 101 tests in 10 files (redirect 26, guard 15, session cookie 15, provider 12, session service 8, theme 6, toast 6, JWT 5, query client 4, entry points 4). Mutations that were introduced on purpose and caught: a hard-coded cookie key, a missing boot-time sign-out, prefix matching in the guard, and the original redirect check. The app suites keep their counts (web 56, admin 9, seller 7), and `web`'s existing msw-backed tests of login, logout, restore and signup pass against the shared service unchanged.
- _Checked live (Next dev server and curl, one app at a time, then stopped):_ in `seller` and `admin`, no cookie, an unreadable cookie and another app's cookie all redirect to `/login?redirect=<path>`; a wrong role goes to `/forbidden`; the right role passes; `/login` and `/forbidden` stay public; `/login-history` is no longer public. In `web`, no or unreadable cookie redirects to the locale-aware login and a valid session passes. (One `web` attempt died of a JavaScript heap out-of-memory at a 1 GB cap I had set; the retry with 2 GB completed. That is this machine, not the code.)
- _GitHub (commit `1700c94`):_ GitHub ran the `verify` job on it and it passed (build, lint, typecheck, every test, the backend against live Postgres and Redis). Route sizes: no shared-chunk change; 4 of 55 routes grew by 1 kB each (`web` /notifications and /wishlist, `seller` /analytics, `admin` /sellers), inside the 3 kB tolerance set in ADR-0001, and none shrank. The E2E workflow still fails at "Build and start backend" with the same `SyntaxError: Unexpected token 'export'` as before this work (F4).
- _Size:_ apps lose about 880 net lines across B and C; the package holds about 530 lines of source and about 960 of tests.
- _The guard is a navigation aid, not authorization._ The session cookie is written by the browser (`document.cookie`, not `HttpOnly`) and carries `userId`, `roles` and `expiresAt`, so anyone can forge it and see an app's shell. The backend authorizes every request from the access token (RBAC and ABAC), which is what keeps this safe. Nothing server-side may ever read that cookie for a decision. Recorded in `backend/docs/05-security-baseline.md` and `docs/frontend/03-routing-and-app-structure.md`.
- _Not verified:_ a manual sign-in and sign-out through the login form in a browser, and the two Playwright specs. The machine cannot run a browser, the backend and a dev server together, and the E2E workflow on GitHub still fails for an unrelated reason (F4). The pieces are covered separately (provider and service tests, msw tests, live middleware probes), but the whole path has not run in one browser.
- _Left per app, deliberately:_ `useLoginMutation` and `useApiErrorHandler` (about 60 lines, identical in `seller` and `admin`; `web` has its own) and `LoginForm` (about 55 lines, two strings differ). They are feature-level UI: sharing them would add `react-hook-form` to the shell package, and the plan listed them as a proposal, not a requirement. Worth revisiting when the login flow next changes. This is a decision for the repository owner, not an oversight.
- _Session cookie hardening, not done (proposed):_ `Secure` on HTTPS, and moving the session summary out of a script-written cookie. Both change behaviour for signed-in users and belong to a security task of their own.

---

## F. Other foundation debt

**F3. `backend/openapi.json` is rewritten on every boot.** **[V]** `main.ts` writes `./openapi.json` at startup; the tracked file changed twice in this session with formatting churn and drift (a tag renamed from "Prometheus" to "ProtectedMetrics"). Target: generate it through an explicit script, stop writing at boot, and add a CI drift check. Files: `backend/src/main.ts`, `backend/package.json`, `ci.yml`, `backend/docs/02-api-standards.md`. Risk: low. Tests: the CI check itself.

**F4. E2E has never passed in CI (0 of 15 runs: 9 before this pull request, 6 on it); cause now verified from GitHub's own logs.** Both E2E jobs fail at "Build and start backend" with `SyntaxError: Unexpected token 'export'` at `packages/validation/src/index.ts`: `nest build` succeeds, then `node dist/main.js` tries to load `@nova/validation`, whose `main` points at raw TypeScript. It runs locally only because Node 24 strips types natively, while CI uses Node 20 (the repository allows `>=20.18`), so **the built backend cannot start on the Node range the repository declares.** Not fixed yet; the fix belongs to production readiness (build `@nova/validation` and `@nova/types` for runtime, or otherwise stop the built backend depending on source files), and `e2e.yml` should then adopt the `backend-test-env` composite action. **[V]**

**F5. Backend test-data duplication** is covered by E.

**F6. `@nova/validation` is 802 lines in one file.** **[V]** Candidate: split by bounded context behind the same barrel. Risk: low to medium (many importers; the backend Jest `moduleNameMapper` points at `src/index.ts`). Value is maintainability, so it can wait.

**F7. Placeholder packages** are classified, and kept, in `NOVA_PACKAGE_STATUS.md` (decision of 2026-09-21): five are PLACEHOLDER (`feature-flags`, `hooks`, `notifications`, `permissions`, `storage`); none is DEPRECATED or REMOVE.

**F8. `apps/docs`** is classified PLACEHOLDER and kept; it gets no Phase 5 effort (decision of 2026-09-21). Storybook remains documented as broken in the README.

**F9. Security follow-ups** from `backend/docs/05-security-baseline.md` belong to a separate security phase, not foundation: dispute creation ownership, idempotency scoping by user, `trust proxy`, Swagger UI in production, `/auth/refresh` rate limit, the seller-role path, and a nonce-based CSP for the Next apps.

**F10. Duplication I introduced:** `security-headers.test.ts` is identical in the three apps. Fold it into the shared package's tests during B.
