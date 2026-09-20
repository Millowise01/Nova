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

## Integration-test isolation (added 2026-09-20)

The backend integration suites run under Jest against the real Postgres and Redis from `docker-compose.yml`; the Vitest and Testcontainers tooling proposed above is not what is in use today.

- **Rate limits.** Spec files run in parallel workers against one Redis, and limits are keyed by `req.ip`. `test-utils/create-test-app.ts` therefore gives each test app its own client address, so suites no longer share one budget (signup is 20 per 60 seconds) and adding tests to one file cannot make another fail with a 429. The limiter itself is unchanged, and `rate-limit.integration.spec.ts` still trips it deliberately.
- **Known race, not yet fixed.** The outbox relay claims rows with `FOR UPDATE SKIP LOCKED`, and the app also runs its own background relay tick. If that tick has an event locked in flight, a test's `drainOutbox()` sees nothing pending and returns while the handler is still writing, so a following read can miss the result. `notifications.integration.spec.ts` fails intermittently for this reason under load. The fix belongs in the test helper (wait until no claimed rows remain) or in disabling the background tick for test apps.
