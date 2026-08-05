# Security Baseline (Phase 1)

Source: Nova Enterprise Blueprint, **Volume 3 — Security & Compliance**, Parts B (identity & access), D (encryption & secrets), and E (audit logging), filtered to what's actually relevant to Identity, Catalog, Cart & Checkout, and Orders. This is deliberately **not** a full reproduction of Volume 3 — see "Explicitly deferred" at the end for what's intentionally left out and why.

## Authentication & session handling (Vol 3, B1)

| Capability             | Specification                                                                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication factors | Email/phone with OTP or magic link; password with **bcrypt, cost factor 12+, never reversible**; social login (Google/Facebook OAuth); biometric unlock on mobile (device-native, never transmitted to Nova servers). |
| MFA                    | Available to all users; **mandatory** for seller and administrative accounts.                                                                                                                                         |
| Passkeys               | Supported as a phishing-resistant option.                                                                                                                                                                             |
| Device fingerprinting  | Each session associated with a device fingerprint, used as a _risk-scoring input_, not a standalone gate.                                                                                                             |
| Risk-based auth        | Login and high-value actions (large orders, payout changes, password resets) scored for risk (device, velocity, geo); elevated risk triggers step-up authentication.                                                  |
| Session management     | Short-lived JWT access tokens (**15-minute expiry**) with rotating refresh tokens, device binding, and a server-side revocation list so any session can be force-terminated immediately.                              |

> **Proposed, not yet confirmed — JWT signing algorithm.** Vol 3, B1 specifies the 15-minute expiry and rotation behavior but not the signing algorithm. Proposed: **RS256** (asymmetric), not HS256. Rationale: with RS256, any Phase 1 or future module — and eventually any extracted microservice (Vol 2, Part F) — can _verify_ a token using only the public key, without holding the private signing key. That matches the modular-monolith-to-microservices path this whole doc set is built around; HS256 would mean every future service that verifies tokens needs the same shared secret Identity uses to sign them, which is a needless secret-sprawl problem to create now and unwind later.

> **Proposed, not yet confirmed — refresh token lifetime & rotation.** Proposed: refresh tokens are valid **30 days, sliding** (each use extends the window), **single-use** — using a refresh token issues a new one and immediately invalidates the old one. If an already-used (and therefore invalid) refresh token is presented again, that's a signal of token theft: the entire token family is revoked and the user is forced to re-authenticate. This is standard refresh-token-rotation practice and directly serves Vol 3's "assume breach" tenet (Part A1) — it turns a stolen refresh token into a self-limiting exposure instead of a 30-day-valid credential in an attacker's hands.

## Authorization: RBAC and ABAC (Vol 3, B3)

> "Nova uses role-based access control (RBAC) as the default authorization model and layers attribute-based access control (ABAC) on top for complex, context-sensitive marketplace and administrative operations where a static role is insufficient."

| Model | Use                                                                  | Example                                                                                                                               |
| ----- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| RBAC  | Coarse-grained access by job function — the default for most checks. | A Customer Support agent can view order and customer records but not modify the ledger.                                               |
| ABAC  | Fine-grained, combines role with contextual attributes.              | A Finance approver may authorize a payout only below a configured threshold and only for sellers they're not personally connected to. |

**"Authorization is enforced centrally by a policy engine consumed by every backend module — individual controllers never implement their own ad hoc permission checks"** (Vol 3, B3). This is the same rule stated from the API side in [02-api-standards.md](02-api-standards.md) ("every endpoint declares its required permission scope... authorization logic never lives inside individual controllers") — one rule, two docs, because it matters at both the architecture level and the endpoint level.

> **Proposed, not yet confirmed — policy engine implementation.** Vol 3 mandates a centralized "policy engine" without naming a library. Proposed: **CASL** (`@casl/ability`), the standard Node/NestJS choice for exactly this RBAC-with-ABAC-on-top shape — it expresses both "Support can read Order" (RBAC) and "Finance can approve Payout where amount < threshold and approver.id != seller.ownerId" (ABAC) in the same rule format, evaluated centrally via a NestJS guard (`@RequirePermission("order:read")` decorator + a global `PolicyGuard`), never inline in a controller. Every module declares its permission set (Vol 2, B2, rule 5) as CASL rule definitions colocated in `<context>.permissions.ts` ([01-module-contract.md](01-module-contract.md)).

For Phase 1, this means: **Identity** owns authentication and issues the roles/attributes a token carries; **Catalog**, **Cart & Checkout**, and **Orders** each declare their own permission set (e.g. `catalog:product:write` scoped to the product's owning seller) and enforce it through the shared `PolicyGuard` — none of them implement their own auth logic.

## Input validation (tied to `@nova/validation`)

Volume 7, Part A1 establishes Zod as the shared validation layer across the stack ("Zod for shared, type-safe validation between client and server"), and the repo already has a `@nova/validation` package (`packages/validation/src/index.ts`) re-exporting `z` plus shared primitive schemas (`emailSchema`, `phoneSchema`, `urlSchema`) consumed by frontend feature schemas today (e.g. `apps/web/src/features/checkout/checkout.schemas.ts`).

**Rule for backend modules:** every HTTP-layer DTO ([01-module-contract.md](01-module-contract.md)'s `http/dto/`) is a Zod schema built from `@nova/validation`'s shared primitives wherever one exists — a backend endpoint accepting a phone number uses `phoneSchema` from `@nova/validation`, not a hand-rolled regex, so the exact same validation rule the frontend form already enforces (and that a user already satisfied to get this far) is re-verified server-side rather than re-invented and potentially drifting from it. Validation happens at the controller boundary via a NestJS `ZodValidationPipe`, before any request body reaches a service — a service method is never called with unvalidated input, and a service method's own TypeScript types can be trusted as _already true_, not merely hoped-for.

This is Zero Trust's "verify explicitly" tenet (Vol 3, A1) applied at the API boundary: the backend never trusts that a request is well-formed just because it came from Nova's own frontend.

## Secrets handling (Vol 3, D2)

> "Application secrets (API keys, database credentials, signing keys) are stored exclusively in a centralized secrets manager — never in source control, configuration files, or environment variables checked into a repository."

This backend build inherits an already-enforced version of this rule at the repo level: `secretlint` runs on every commit (pre-commit hook) and in CI, blocking any commit that introduces a credential pattern (AWS keys, private keys, database connection strings with embedded credentials, etc.) — see the root `.secretlintrc.json`. Volume 7, Part A2 adds the complementary application-level rule: **"All environment-specific configuration (secrets, external service URLs, feature flags) is injected through the application's config module, never accessed directly via `process.env` in business logic."** Concretely: a backend module's service or repository code never calls `process.env.DATABASE_URL` directly — it receives configuration through NestJS's `ConfigService`, which is the _only_ place that reads `process.env`, so there's exactly one place to point to when auditing what environment variables the backend actually consumes.

Service-to-service identities — the backend calling itself in CI, background jobs authenticating to Redis or Postgres — use scoped, short-lived, workload-specific credentials issued through the secrets manager (Vol 3, D2), never a shared human's credentials and never a long-lived static key where the infrastructure supports rotation.

## Explicitly deferred — not applicable to Phase 1

The following Volume 3 requirements are real, correctly specified, and **not being skipped** — they apply once the bounded contexts they govern actually enter the build order (see [00-bounded-contexts.md](00-bounded-contexts.md)'s phase table). Listing them here is intentional, so Phase 1 work doesn't get gold-plated with controls that have nothing to protect yet:

| Deferred requirement                                                                                   | Applies once...                       | Source               |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------- | -------------------- |
| Dual-authorization workflows for refunds, payouts, and ledger adjustments                              | Payments & Wallet / Finance are built | Vol 3, B4            |
| Immutable financial ledger mechanics (append-only `WalletLedgerEntry`/`LedgerEntry`, derived balances) | Payments & Wallet / Finance are built | Vol 3, E2; Vol 2, D2 |
| Fraud detection tiers, velocity/geo-velocity checks, human review queue                                | Trust & Safety is built               | Vol 3, F1–F2         |
| Seller/rider KYC verification tiers                                                                    | Trust & Safety is built               | Vol 3, F1            |
| PCI-DSS SAQ-A scope (tokenized card data)                                                              | Payments & Wallet is built            | Vol 3, J1            |

One item does **not** wait, and is flagged here specifically because it cuts across the phase boundary: **audit logging (Vol 3, E1).** The `AuditLog` table is schema-owned by Trust & Safety (Vol 2, D2) — a Phase 2+ context — but Vol 3, E1 requires it for "administrative logins, permission changes... and data access to PII," some of which (admin login, PII access) already happens in Phase 1's Identity and Catalog contexts.

> **Proposed, not yet confirmed — how Phase 1 writes to a Phase 2+ context's table.** This is a genuine tension the blueprint doesn't resolve explicitly: Vol 2, B1's "no other module writes to another module's tables" rule would normally mean Identity can't insert directly into Trust & Safety's `audit_log` table, but Vol 3, E1 requires audit writes to be synchronous and reliable (an audit record can't be lost to eventual-consistency lag the way an analytics event tolerably can). Proposed: **stand up the `audit_log` table and a minimal `AuditLogger` shared library ahead of the rest of Trust & Safety**, in Phase 1, as infrastructure every module imports and calls synchronously (`auditLogger.record({...})`) — not a full Trust & Safety module, just the one table and a thin write interface, with the rest of Trust & Safety's actual domain logic (KYC, disputes, fraud rules) staying deferred to Phase 2+ as planned. This keeps the "single schema owner" rule technically intact (nothing outside this thin interface ever queries `audit_log` directly) while not leaving Phase 1 admin actions unaudited for an entire phase.
