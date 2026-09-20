---
description: Run a defensive security review of Nova code, config, or infrastructure
argument-hint: [optional - specific scope; defaults to the whole repo]
---

Run a security review of: $ARGUMENTS

Lead with `cybersecurity-engineer` (load the `nova-security` skill). Add `payment-engineer` for payment/wallet/webhook logic, `backend-engineer`/`api-engineer` for authorization and API surface, `database-engineer` for data access, and `devops-engineer`/`cloud-engineer` for CI, secrets and infrastructure.

This is defensive only. Reviewers inspect and report; they do not produce exploit code.

Cover as relevant to scope:

- Secrets handling: nothing exposed, no `.env` with credentials committed, CI secret usage (see the existing secretlint setup).
- Authentication, MFA, RBAC/ABAC, and authorization bypass risks.
- Trusting the client: prices, inventory, discounts, permissions, payment success.
- Payment and webhook verification, idempotency, replay handling.
- Input validation, injection, XSS/CSRF, rate limiting, CORS.
- Sensitive logging, audit logging, dependency vulnerabilities.
- Cloud/infra misconfiguration.

Report a prioritized list of findings with severity and evidence, then an overall verdict. Hand fixes to the owning implementation agent; do not fix silently, and never weaken a check to make a build pass.
