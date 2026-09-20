---
name: payments
description: Nova payment rules - server-authoritative payment state, verified provider callbacks, idempotent webhooks, audit records, full state coverage, no secrets in logs, never treat a frontend redirect as proof of payment. Load for any payment or wallet work.
---

# Nova Payments Skill

Payment operations must be server-authoritative.

Rules:
- Verify provider callbacks.
- Make webhook processing idempotent.
- Use transaction IDs and audit records.
- Handle pending, successful, failed, cancelled, expired, and reversed states.
- Never log payment secrets.
- Never treat a frontend redirect as proof of payment.
