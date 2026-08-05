# Security Implementation Checklist

Source: Nova Enterprise Blueprint, **Volume 3 — Security & Compliance** (all Parts, cited inline), reconciled against a general-purpose six-category security reference checklist (Identity & Access, Data Protection, Input & Output, API Security, Infrastructure, Monitoring). Where the generic checklist and Volume 3 diverge, **Volume 3 is authoritative** — this document exists because a generic checklist, applied uncritically, silently understates or misstates five specific Nova requirements (flagged below with ⚠️). Cross-referenced with `backend/docs/01-module-contract.md` (Vol 2, B2) and the four Phase 1 modules already implemented (Identity, Catalog, Cart & Checkout, Orders).

## How to read this document

Each item states: **Generic checklist says** → **Volume 3 actually requires** (cited Part) → **Authoritative version**. Implementation status for Phase 1 is noted per item; the full must-implement-now vs. deferred classification is in [Scope for This Phase](#scope-for-this-phase) below, and every genuinely open tool/infrastructure decision is called out in [Needs Your Confirmation](#needs-your-confirmation) rather than assumed.

---

## 1. Identity & Access

### 1.1 Multi-factor authentication ⚠️ _(understated in the generic checklist)_

- **Generic checklist says:** "Enable MFA" — implies a blanket, uniform feature toggle.
- **Volume 3 actually requires (B1):** "Multi-factor authentication (MFA) — Available to all users and **required for seller and administrative accounts**." Part B2 sharpens this further for internal staff: "MFA is mandatory (not optional)."
- **Authoritative version:** MFA is **role-conditional**, not a blanket switch — optional for customers, mandatory for seller and admin accounts. A checklist item that just says "MFA: done/not done" hides this distinction entirely; "MFA is enabled" is meaningless without specifying for which role.
- **Phase 1 status:** No differentiated seller/admin signup flow exists yet (every `POST /v1/auth/signup` produces a `customer`-role user — Catalog's `createProduct` doesn't grant a seller role, it only checks that _a_ JWT is present). The mandatory-for-seller/admin _gate_ is implemented now regardless (see [Implementation Report](#implementation-report)), so the rule is enforced the moment a seller/admin role exists, rather than requiring a later retrofit.

### 1.2 Authorization model ⚠️ _(understated in the generic checklist)_

- **Generic checklist says:** "Implement role-based access control" — flat roles-and-permissions, one model.
- **Volume 3 actually requires (B3):** "Nova uses role-based access control (RBAC) as the default authorization model and **layers attribute-based access control (ABAC) on top** for complex, context-sensitive marketplace and administrative operations where a static role is insufficient." Example given: "A Finance approver may authorize a payout only below a configured value threshold and only for sellers they are not personally connected to."
- **Authoritative version:** Two models, deliberately layered — RBAC answers "can this role ever do this," ABAC answers "can this specific actor do this to this specific object, given the current context." A pure-RBAC implementation cannot express "a customer may cancel their own order but not anyone else's" without either a role explosion (one role per customer) or an inline `if` check outside the authorization system — which is exactly the "no module implements ad hoc permission checks" violation Vol 2, B2 (point 5) and Vol 3, B3 ("authorization is enforced centrally by a policy engine... individual controllers never implement their own ad hoc permission checks") both prohibit.
- **Phase 1 status:** Implemented as a central policy engine (CASL) this pass — see below. Replaces an inline `if (order.userId !== requesterId) throw Forbidden` that existed in `OrdersService` from the previous implementation pass — a real, small instance of exactly the ad hoc pattern Vol 3 prohibits, caught and fixed as part of this work.

### 1.3 Dual authorization for sensitive operations ⚠️ _(a distinct control, absent from the generic checklist entirely)_

- **Generic checklist says:** Nothing — most generic checklists stop at "authorization," treating RBAC/ABAC as sufficient for every operation.
- **Volume 3 actually requires (B4):** "Every sensitive operation — refunds above a configured threshold, seller payouts, role assignment changes, seller approval/suspension, and direct financial ledger adjustments — passes through a configurable approval workflow rather than executing on a single actor's authority alone... Dual authorization is required by default for any direct ledger adjustment and for payouts above a configured value threshold — one actor proposes, a second actor with the appropriate role approves, and neither step is skippable."
- **Authoritative version:** This is a **distinct control layered on top of authorization**, not a stricter form of it. Authorization (RBAC/ABAC) answers "is this actor allowed to attempt this action." Dual authorization answers "must a _second, different_ actor also approve before this action executes" — a question authorization alone never asks. A system can have perfect RBAC/ABAC and still be missing this control entirely, which is exactly the gap a generic "authorization: ✅" checklist item would hide.
- **Phase 1 status:** **Deferred — no sensitive financial operation exists yet.** Every operation Vol 3 B4 names (refunds, payouts, role changes, seller suspension, ledger adjustments) belongs to Payments & Wallet, Finance, or Trust & Safety — all explicitly out of scope for this phase per `backend/docs/00-bounded-contexts.md`. Documented here so the requirement isn't lost, not implemented against operations that don't exist.

### 1.4 Session management

- **Generic checklist says:** "Use short-lived tokens."
- **Volume 3 actually requires (B1):** "Short-lived JWT access tokens (15-minute expiry) with rotating refresh tokens, device binding, and a server-side revocation list so any session can be force-terminated immediately."
- **Authoritative version:** Matches — the generic item is directionally correct here, just less specific (no expiry number, no rotation, no revocation-list requirement).
- **Phase 1 status:** **Implemented and verified** (prior pass) — 15-minute access tokens, single-use rotating refresh tokens with a server-side `Session` table enabling revocation. See `backend/docs/05-security-baseline.md`.

---

## 2. Data Protection

### 2.1 Field-level encryption ⚠️ _(understated in the generic checklist)_

- **Generic checklist says:** "Encrypt data at rest" — implies whole-database/disk-level encryption is sufficient.
- **Volume 3 actually requires (D1):** "AES-256 encryption for the primary database, object storage, and backups" (whole-database) **plus, separately**: "Field-level encryption: Phone numbers, email addresses, government ID numbers, and other high-sensitivity fields are encrypted at the field level **in addition to** whole-database encryption, so a database-level compromise alone does not expose raw PII."
- **Authoritative version:** Two layers, not one. Whole-database encryption protects against physical disk/backup theft; it does **not** protect against a compromised database credential or a SQL-injection-style read, because the database engine itself decrypts transparently for any authenticated query. Field-level encryption is what keeps a stolen credential or a leaked query result from exposing raw PII. A checklist that only asks "is the database encrypted" would rate Nova as compliant even without field-level encryption — the wrong answer.
- **Phase 1 status:** **Implemented and verified** (prior pass) — `PiiCryptoService` (AES-256-GCM, HKDF-derived subkeys) encrypts `User.emailEncrypted`/`phoneEncrypted`; a separate HMAC-SHA256 hash column (`emailHash`/`phoneHash`) provides deterministic lookup without needing to decrypt for uniqueness checks. Confirmed via direct DB assertion in `identity.integration.spec.ts` that stored values never contain the plaintext. See [Needs Your Confirmation](#needs-your-confirmation) for the key-management caveat.

### 2.2 Money representation

- **Generic checklist says:** Not typically covered by generic security checklists at all.
- **Volume 3 / Volume 2 D3 requires:** `numeric(14,2)` plus explicit currency code; never floating-point.
- **Phase 1 status:** **Implemented and verified.** Included here because a Money-handling bug (Prisma `Decimal` losing trailing zeros on serialization) was found and fixed during Phase 1 implementation — see `backend/docs/03-database-conventions.md`.

### 2.3 PCI scope

- **Generic checklist says:** "Don't store card data."
- **Volume 3 actually requires (J1):** Card data is never stored; tokenization through PCI-DSS-compliant PSPs keeps Nova in SAQ-A, the lowest-burden self-assessment category, by architecture.
- **Phase 1 status:** **Not applicable yet** — no payment method is implemented in this phase (Payments & Wallet is Phase 2+). No card-data handling exists to be out of compliance with.

---

## 3. Input & Output

### 3.1 Input validation

- **Generic checklist says:** "Validate all inputs."
- **Volume 3 / Volume 7 A1 requires:** Zod schemas, shared between frontend and backend.
- **Phase 1 status:** **Implemented and verified.** Every mutating endpoint across all four modules validates its request body against a `@nova/validation` Zod schema via `ZodValidationPipe` — confirmed by a real 400 response with `VALIDATION_FAILED` in every module's integration test suite.

### 3.2 Parameterized queries / no raw SQL

- **Generic checklist says:** "Use parameterized queries, never string-concatenate SQL."
- **Volume 3 actually requires (J4):** "parameterized data access patterns enforced at the framework level" as part of OWASP Top 10 injection mitigation.
- **Phase 1 status:** **Implemented and verified.** Every database access goes through Prisma's generated client — confirmed by direct code search: zero occurrences of `$queryRaw`, `$executeRaw`, `$queryRawUnsafe`, or `$executeRawUnsafe` anywhere in `backend/src`. Prisma parameterizes every query it generates; there is no code path where user input reaches a SQL string directly.

### 3.3 Output escaping

- **Generic checklist says:** "Escape output to prevent XSS."
- **Volume 3 actually requires (J4):** Covered under OWASP Top 10 alignment, but framed around broken access control and injection as "consistently the highest-impact categories," not XSS specifically for this kind of backend.
- **Phase 1 status:** **Not directly applicable to this backend the way it would be to a server-rendered HTML app.** Every Phase 1 endpoint returns `application/json`; there is no server-side HTML templating anywhere in `backend/`, so there is no HTML-injection surface for the backend itself to escape. Output escaping is real and necessary — it's `apps/web`'s responsibility (React escapes by default; see `docs/frontend/06-accessibility-and-performance.md`), not this backend's. Noted here so this item isn't silently dropped, not marked "implemented" against a surface that doesn't exist.

### 3.4 No stack traces in error responses

- **Generic checklist says:** "Don't leak stack traces to clients."
- **Volume 3 actually requires:** Implied by the audit/error-handling discipline in Part E and the general Zero Trust "assume breach" posture (A1) — an error response is attacker-visible surface.
- **Phase 1 status:** **Implemented and verified.** `ApiExceptionFilter` (`backend/src/common/filters/api-exception.filter.ts`) logs the full exception (including stack) server-side via `Logger.error`, but the client response only ever contains `{ code, message, correlationId, details? }` — confirmed by code review: the `exception.stack` value is never referenced in any response-construction path.

---

## 4. API Security

### 4.1 Rate limiting

- **Generic checklist says:** "Add rate limiting."
- **Volume 3 actually requires (C1):** "Enforced at both the Cloudflare edge (coarse, IP/ASN-based) and the application layer via Redis (fine-grained, per-account/per-endpoint)."
- **Authoritative version:** Two layers again — edge and application. The edge layer (Cloudflare) is infrastructure, out of scope for this phase (see below). The **application layer, Redis-backed, per-account/per-endpoint**, is in scope now.
- **Phase 1 status:** **Implemented and verified this pass** — see [Implementation Report](#implementation-report).

### 4.2 CORS

- **Generic checklist says:** "Configure CORS."
- **Volume 3 / general API hygiene requires:** Locked to known origins, not a wildcard.
- **Phase 1 status:** **Implemented this pass.**

### 4.3 Versioning, pagination, error shape

- Already fully specified and implemented per `backend/docs/02-api-standards.md` — not re-covered here to avoid duplicating that document.

### 4.4 Idempotency for financial-adjacent operations

- **Volume 3 / Volume 2 C2 requires:** Idempotency-Key for retryable mutating requests (checkout, payment, payout).
- **Phase 1 status:** **Implemented and verified** (prior pass) — `POST /v1/orders`. See `backend/docs/02-api-standards.md`'s worked example and the Phase 1 implementation report's idempotency proof.

---

## 5. Infrastructure

### 5.1 Edge security (WAF, DDoS, bot management)

- **Volume 3 actually requires (C1):** Cloudflare WAF blocking SQLi/XSS/path-traversal patterns before they reach the application; network-level and application-level DDoS mitigation; challenge-based bot management on signup/login/OTP/checkout.
- **Phase 1 status:** **Deferred — infrastructure-layer, belongs to the deployment/Terraform phase** (Vol 2, Part G), not application code. Nothing in `backend/` can substitute for this; it doesn't exist until there's a real deployment to front.

### 5.2 Network segmentation

- **Volume 3 actually requires (C2):** Database tier not directly reachable from the public internet; administrative infrastructure access on a separate, audited path from customer traffic.
- **Phase 1 status:** **Deferred** — same reasoning as 5.1. Locally, Postgres is only reachable via `localhost:5433` (Docker port mapping), which is a development convenience, not a statement about production network topology.

### 5.3 Secrets management

- **Volume 3 actually requires (D2):** Centralized secrets manager, never committed to a repo, short-lived workload-specific credentials where supported.
- **Phase 1 status:** **Partially addressed.** Repo-level protection is real and already enforced (`secretlint` pre-commit hook + CI gate, from earlier this session). A production-grade centralized secrets manager (Vault, AWS Secrets Manager, etc.) does not exist yet — local development uses a git-ignored `.env`, which is the correct _local_ pattern but is explicitly not what Vol 3, D2 describes for production. See [Needs Your Confirmation](#needs-your-confirmation) for the specific open question this raises for the PII encryption key.

---

## 6. Monitoring

### 6.1 Audit logging ⚠️ _(understated in the generic checklist)_

- **Generic checklist says:** "Log security events" — vague, no required fields.
- **Volume 3 actually requires (E1):** A specific, seven-field record for every sensitive action: **Actor** (authenticated identity), **Action** (controlled vocabulary), **Target** (entity affected), **Reason/justification** (required for sensitive ops), **Timestamp** (UTC, server-generated, never client-supplied), **Source context** (IP, device fingerprint, session ID), **Correlation ID** (links to the originating request/trace). "Audit records can never be edited or deleted through any application code path."
- **Authoritative version:** A generic "we log stuff" checklist item is nowhere close to satisfying this — Vol 3 specifies exact fields and an append-only, immutable guarantee. Vol 3, E2 also makes an important connection explicit: "the audit logging requirement... and the core financial data model are the same architectural pattern applied consistently — Nova does not maintain a separate, weaker audit mechanism for money than it does for every other sensitive action." That's a design constraint, not just a logging preference.
- **Phase 1 status:** **Implemented this pass** — see [Implementation Report](#implementation-report). This is the cross-cutting piece `backend/docs/05-security-baseline.md` flagged as needing to exist ahead of the rest of Trust & Safety: "stand up the `audit_log` table and a minimal `AuditLogger` shared library ahead of the rest of Trust & Safety... not the full Trust & Safety module."

### 6.2 DevSecOps pipeline gates ⚠️ _(understated in the generic checklist)_

- **Generic checklist says:** "Run security scans in CI" — one undifferentiated line item.
- **Volume 3 actually requires (G1), as a named, staged list:**

  | Control                   | Catches                                            | Cadence                                               |
  | ------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
  | SAST                      | Insecure coding patterns, injection risks          | Every pull request                                    |
  | DAST                      | Runtime vulnerabilities against a running instance | Pre-release, every major build                        |
  | SCA (dependency scanning) | Known vulnerabilities in dependencies              | Every PR + recurring schedule                         |
  | Container scanning        | Vulnerable/misconfigured base images               | Every image build                                     |
  | Supply chain / SBOM       | Build-pipeline tampering, traceability             | Every release build                                   |
  | Secret scanning           | Committed credentials                              | Every commit, continuously                            |
  | Penetration testing       | Real-world exploitable vulnerabilities             | Quarterly + before major architecture/payment changes |

  Plus a **hard release gate** (G2): "A release is blocked from reaching production if it introduces any new critical or high-severity finding across the scans above. This is a hard gate, not a guideline... zero critical/high findings in production scans before release."

- **Authoritative version:** Six distinct, differently-cadenced controls plus a non-negotiable release gate — not "we have CI security scanning: ✅/❌."
- **Phase 1 status — mixed, itemized:**
  - **Secret scanning: implemented and verified** (this session, earlier — `secretlint` pre-commit hook + CI step, `237030b`/`1d6e6a1`).
  - **SAST, SCA: tooling not yet decided** — see [Needs Your Confirmation](#needs-your-confirmation). Not wired into CI until that decision is made.
  - **DAST, container scanning, SBOM/supply-chain, penetration testing: deferred.** All require a real staging environment and deployment pipeline, which don't exist yet (the repository audit's CI/CD gap finding). No amount of application-code work substitutes for infrastructure that isn't there.
  - **Release gate (zero new critical/high blocks production): deferred** — there is no production release process to gate yet.

---

## Scope for This Phase

### Must implement now (cross-cutting, not deferrable)

| Control                                                                                                       | Why now, not later                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Central RBAC/ABAC policy engine                                                                               | Retrofitting after four modules already have inline permission checks is expensive — cheaper to build once, correctly, and have every module (including future ones) consume it from day one (Vol 2, B2 point 5).                                                                                 |
| Field-level PII encryption                                                                                    | Already scoped in the Phase 1 backend prompt; this pass confirms it's a real, tested mechanism, not aspirational.                                                                                                                                                                                 |
| Audit logging standard                                                                                        | Vol 3, E1 applies the moment _any_ sensitive action exists (admin login, content moderation-adjacent actions). Building the table/writer now means every future module (including Payments/Finance) writes to the same mechanism from day one, rather than each module inventing its own logging. |
| Input validation, parameterized queries, output-escaping posture, rate limiting, CORS, no leaked stack traces | Baseline hygiene controls with no dependency on later phases — there's no reason to ship an endpoint without them.                                                                                                                                                                                |
| Password hashing (bcrypt 12+)                                                                                 | Already implemented; re-confirmed here for completeness of this audit.                                                                                                                                                                                                                            |
| MFA mandatory-for-seller/admin gate                                                                           | The _gate_ (the check that would block a seller/admin login without MFA) costs little to build now and means Vol 3 B1's mandatory rule is enforced the instant a seller/admin role exists — not something that needs remembering to add later.                                                    |

### Explicitly deferred (documented, not implemented)

| Control                                                                   | Why deferred                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dual-authorization approval workflows                                     | No sensitive financial operation exists yet — Payments/Wallet, Finance, Trust & Safety are all Phase 2+/3+ per `backend/docs/00-bounded-contexts.md`. Building the workflow engine against operations that don't exist would be speculative. |
| Immutable financial ledger                                                | Belongs to the Finance module, not built yet.                                                                                                                                                                                                |
| OAuth/SSO (Google/Facebook)                                               | A sequencing choice from the original Phase 1 scoping, not an omission — Volume 3, B1 does specify it as an available factor; it's simply not built in this pass.                                                                            |
| DAST, container scanning, SBOM/supply-chain scanning, penetration testing | All require a real staging environment and deployment pipeline that don't exist yet.                                                                                                                                                         |
| Cloudflare WAF/DDoS/bot management, network segmentation                  | Infrastructure-layer (Vol 2, Part G / Vol 3, Part C) — belongs to the deployment/Terraform phase, not application code.                                                                                                                      |

---

## Needs Your Confirmation

Resolved — decisions recorded below.

1. **SAST and SCA tooling — confirmed: Semgrep (SAST) + Dependabot (SCA).** Wired into CI this pass.
2. **PII encryption key management — confirmed: keep the local/dev-only `.env` key, clearly marked non-production.** No change to the existing mechanism; documentation strengthened to make the non-production status explicit (see `.env.example`).

---

## Implementation Report

All items below are implemented and verified (39/39 backend tests passing, real Postgres + Redis, no mocks). Full evidence and per-control detail is in the chat response for this task; summarized here for anyone reading this doc in isolation:

| Control                                                                                                                       | Status                      | Key evidence                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Central RBAC/ABAC policy engine (CASL)                                                                                        | Implemented                 | `common/policy/` — `PolicyGuard` (route-level RBAC) + `AbilityFactory` (service-level ABAC via `subject()`). Replaced an inline `if` in `OrdersService`.        |
| Field-level PII encryption                                                                                                    | Confirmed real (prior pass) | `identity.integration.spec.ts` asserts encrypted columns never contain plaintext.                                                                               |
| Audit logging (7-field standard)                                                                                              | Implemented                 | `common/audit/` — `AuditLog` table + `AuditLogger`, wired into login (success/fail/MFA-blocked), signup, product creation, order creation/cancellation.         |
| Redis-backed rate limiting                                                                                                    | Implemented                 | `common/rate-limit/` — per-account-or-IP, per-endpoint. `rate-limit.integration.spec.ts` proves a real 429 after the limit and per-endpoint scoping.            |
| CORS locked to known origins                                                                                                  | Implemented                 | `CORS_ALLOWED_ORIGINS` env-driven allowlist in `main.ts`; never `*`.                                                                                            |
| No stack traces in responses                                                                                                  | Confirmed (code review)     | `ApiExceptionFilter` never references `exception.stack` in a response body.                                                                                     |
| No raw SQL / parameterized queries                                                                                            | Confirmed (grep)            | Zero `$queryRaw`/`$executeRaw`/unsafe variants anywhere in `backend/src`.                                                                                       |
| Password hashing (bcrypt 12+)                                                                                                 | Confirmed real (prior pass) | `password.startsWith("$2b$")` assertion in tests.                                                                                                               |
| MFA mandatory-for-seller/admin gate                                                                                           | Implemented                 | `AuthService.login`'s MFA check — 4 dedicated tests proving it blocks/unblocks correctly for seller and admin roles, doesn't affect customers.                  |
| SAST (Semgrep) in CI                                                                                                          | Wired, unverified live      | Added to `.github/workflows/ci.yml`, scoped to `backend/src`. Could not execute a real CI run this pass (no push made) — flagged, not silently assumed working. |
| SCA (Dependabot)                                                                                                              | Wired                       | `.github/dependabot.yml`, weekly, npm + github-actions ecosystems.                                                                                              |
| Dual authorization, immutable ledger, OAuth/SSO, DAST, container scanning, SBOM, pen testing, Cloudflare/network segmentation | Deferred                    | See [Scope for This Phase](#scope-for-this-phase) — reasons given per item, not silently dropped.                                                               |

One behavior change surfaced during implementation, disclosed rather than silently shipped: migrating `Order` access to the ABAC policy engine closed a minor pre-existing gap where any authenticated user could read a _guest_ order (no `userId`) by ID — now only an admin-level ability can, since there's no owner identity to match against.
