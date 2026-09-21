# Testing Strategy

Source: Nova Enterprise Blueprint, **Volume 7, Part D1** (testing pyramid), **Part D2** (test data management), adapted here specifically for backend modules.

## The pyramid (Vol 7, D1)

| Level                  | Scope                                                                                                                      | Owned by                                                          | Target                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Unit**               | Pure functions, domain service logic, validation rules — fast, deterministic, no I/O.                                      | The engineer writing the code.                                    | **100% of business logic in service layers**; lower for utility code.           |
| **Integration**        | Module-level behavior including database interactions and event publishing, run against a test database container.         | The engineer writing the code, reviewed by QA for critical paths. | Full happy path and documented error paths for every module's public interface. |
| **Contract**           | The API contract between frontend/mobile consumers and the backend — verifying both sides agree on request/response shape. | Shared between backend and frontend/mobile engineers.             | Every endpoint version in use by a production consumer.                         |
| **End-to-end (E2E)**   | Critical user journeys (signup, checkout, seller payout initiation) exercised against a full staging stack.                | QA engineering, with developer support for maintenance.           | Top 10 revenue-critical journeys; expanded as the platform matures.             |
| **Performance / load** | Sustained and spike load simulations against staging, validating SLO targets before release.                               | DevOps / SRE, run pre-release.                                    | Checkout flow, search, and order-status update paths.                           |

## What "done" means for a Phase 1 module, concretely

A module isn't done when it compiles and the happy path works in manual testing. Per Volume 7, Part A3's Definition of Done, a module is done when: code is implemented and peer-reviewed, **all CI gates pass (lint, type-check, tests, security scans)**, acceptance criteria are verified by the engineer and confirmed by QA, documentation is updated, and there are **no new critical/high security findings**. For the testing gates specifically, that means before a Phase 1 module (Identity, Catalog, Cart & Checkout, or Orders) is considered done:

- Every method in its `domain/*.service.ts` has unit tests covering the happy path and every documented error path — not just the happy path.
- Every method in its public service (`public/<context>.public-service.ts` — [01-module-contract.md](01-module-contract.md)) has an integration test that runs against a real Postgres instance, not a mock — a mocked repository can't catch a bad migration, a missing index that changes query semantics, or a constraint violation.
- If the module publishes any events ([04-events-and-jobs.md](04-events-and-jobs.md)), there's an integration test asserting the outbox row is written **in the same transaction** as the domain change — this is the property the whole architecture depends on, so it's tested explicitly, not assumed to work because the code looks right.
- Every REST endpoint it exposes has a contract test (see below).

## Tooling

> **Proposed, not yet confirmed.** Volume 7 specifies the pyramid's shape and coverage targets but doesn't name specific tooling. Proposed, chosen to match what's already standard elsewhere in this monorepo rather than introduce a second test runner:
>
> - **Unit & integration tests: Vitest.** Already the test runner for every existing `@nova/*` package (`vitest` is a root devDependency, every package has a `test` script wired through Turborepo) — the backend uses the same tool rather than NestJS's more common default (Jest), so there's one test runner and one config pattern across the entire monorepo, not two.
> - **Integration test database: Testcontainers** (`@testcontainers/postgresql`), spinning up a real, disposable PostgreSQL 16 container per test run. This is the concrete implementation of D1's "run against a test database container" requirement — a fresh container per run means tests are hermetic (Vol 7, D2) by construction, with no shared test-database state to accidentally leak between runs or between engineers' machines.
> - **Contract tests: generated from the OpenAPI 3.1 spec**, not a separate consumer-driven-contract framework (e.g. Pact). Vol 2, C3 already commits to maintaining `Nova_OpenAPI_Spec.yaml` as the living source of truth for every endpoint's request/response schema — validating actual responses against that same spec (e.g. via `express-openapi-validator` or an equivalent schema-diff check in CI) means there's one artifact describing the contract instead of the OpenAPI spec and a separate Pact contract silently drifting apart over time.
> - **E2E tests: Playwright**, already the root-level `@playwright/test` dependency and `test:e2e` script used for frontend E2E — the same tool now driving journeys that start in the browser and end in real backend/database state on staging.

## Test data (Vol 7, D2)

> "Test fixtures and seed data are version-controlled alongside tests. No test depends on data created by another test (tests are hermetic). Sensitive data (real phone numbers, real payment credentials) never appears in test fixtures; synthetic, obviously-fake data is used throughout, with clear naming conventions (`test-phone-1`, `test-card-4242`, etc.) that cannot be confused with real identifiers."

Concretely for Phase 1: a fixture for a `User` uses a phone number that is structurally valid (passes `@nova/validation`'s `phoneSchema`) but obviously synthetic — matching the codebase's existing pattern for the Sierra Leone locale (e.g. a clearly-marked test range) — never a real or real-looking number. Every integration test creates its own fixtures inside its own transaction/container rather than relying on a shared seed dataset another test might mutate; this is what "hermetic" means in practice, not just in principle.

## How the backend integration tests run (added 2026-09-20)

They run under Jest against the real Postgres and Redis from `docker-compose.yml`, with `maxWorkers: 1` (spec files run one after another) and a 20 second `testTimeout`. The Vitest and Testcontainers tooling proposed above is not what is in use today. The database is never cleaned between runs, so users accumulate.

Two intermittent failures were investigated in Phase 5.

- **Notifications outbox-drain race: reproduced, explained and fixed.**
  - _Reproduced:_ `notifications.integration.spec.ts` failed in 2 of 14 runs of the spec alone, in different tests each time, and in 3 of 25 runs of an instrumented copy. No handler or relay error was logged in any failing run.
  - _Explained:_ the instrumented copy logged the unpublished outbox rows right after each drain. Every failing run coincided with a drain that returned while rows were still unpublished, and no failure occurred without one.
  - _The contract:_ the relay claims rows with `FOR UPDATE SKIP LOCKED` inside one transaction, handlers write on their own connections, and `published_at` is set only when that transaction commits, after the handlers have run. The app also runs its own background poll every 500 ms. While that poll holds rows in flight, a second `processPendingEvents()` skips them and returns 0 although their handlers have not finished. So "`processPendingEvents()` returned 0" does not mean "handled"; "no unpublished rows remain" does.
  - _The fix:_ `test-utils/drain-outbox.ts` waits for that condition, with a bounded timeout that names the stuck rows instead of returning early. It is test-only; the relay is unchanged. `drain-outbox.integration.spec.ts` reproduces the race deterministically with a slow handler and covers the helper.
  - _Verified:_ 40 of 40 runs of the spec pass with the helper, against 2 failures in 14 before.
- **Signup conflicts from colliding test phone numbers: observed directly, fixed.** The specs built phone numbers from a fixed prefix plus four hex characters (65,536 values) or from six random digits (900,000). The database is never cleaned, so users accumulate across runs, and a new signup can hit an existing user's unique `phoneHash`.
  - _Observed:_ an instrumented run captured `409 PHONE_ALREADY_REGISTERED` (phone `+2327564813`) inside a helper, which then failed with `Cannot read properties of undefined`. Separately, a full run failed in the identity spec with `expected 201, got 409` on a `+2327600` plus four hex characters payload, and its signup statuses showed exactly one more 409 than the specs deliberately produce (the identity spec makes two).
  - _The fix:_ `test-utils/users.ts` draws ten random digits (10^10 values) and `signUpWithRetry` retries only a phone or email conflict, giving up after a few attempts. Any other failure throws with the status and response body in the message, so a signup problem explains itself instead of surfacing later as an undefined property. Nine specs use the shared `signUpAndPromote`/`signUpTestUser` or the generator; no ad-hoc phone generator remains in the specs.
  - _Still unexplained:_ the same helper failure was seen once in CI (`seller.body.data` undefined in the orders spec) on a brand-new database, where accumulated users cannot explain it. The cause of that occurrence is not established; if it recurs, the new error message will say why.

Two other kinds of failure appeared while measuring, and neither is a test defect: the Docker containers restarted during a run when the machine ran out of memory (the suite then reported "Can't reach database server"), and two 20-second timeouts in the logistics spec occurred while the machine had roughly 100–250 MB of free memory. The second is suspected, not proven, to be memory starvation.

Rate limits are keyed by `req.ip`, every test request comes from one address, and `createTestApp` flushes Redis when each app is created. A single spec file that signed up more than 20 users within 60 seconds would receive 429s, so keep that in mind when adding tests to a file that signs up many users.
