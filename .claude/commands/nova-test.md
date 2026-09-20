---
description: Add or run Nova tests appropriate to a change's risk level
argument-hint: [optional - what to test; defaults to recent changes]
---

Handle testing for: $ARGUMENTS

Use `qa-engineer` (load the `nova-testing` skill) to assess what needs coverage and to run the existing relevant tests. Implementation agents write tests for their own layer; add `payment-engineer` or `cybersecurity-engineer` for payment and security-critical paths.

Rules:

- Inspect the repo's existing test setup first (unit runner, Playwright E2E, backend test-isolation gotchas) and use it. Do not introduce a new framework without justification.
- Prioritize business-critical behavior: auth, catalog, cart, checkout, payment, orders, inventory, seller/admin permissions.
- Choose the cheapest test level that actually verifies the risk; cover error paths and edge cases, not only the happy path.
- Critical commerce flows: cover retries, concurrency and idempotency.
- A new test must fail without the fix and pass with it.
- Do not run expensive full-suite or E2E runs for small, low-risk changes.

Report what was tested, what passed or failed (with output for failures), and any coverage gaps left open.
