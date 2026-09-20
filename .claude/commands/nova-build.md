---
description: Implement a Nova feature or change end-to-end with the right specialist agents
argument-hint: <describe what to build>
---

Implement the following: $ARGUMENTS

Follow `.claude/CLAUDE.md`. The repository is the source of truth - do not assume an earlier stack is still current.

1. **Inspect first.** Check `git status`, package manifests, workspace config (`pnpm-workspace.yaml`, `turbo.json`), the relevant app under `apps/`, shared packages under `packages/`, `backend/` conventions (`backend/docs/`), env examples, existing tests, and existing design-system components.
2. **Pick the smallest team** using the CLAUDE.md agent-selection flows:
   - Feature: `technical-product-engineer` -> `software-architect` (only if the design is unclear) -> implementation agents (`frontend-engineer`, `backend-engineer`, `api-engineer`, `database-engineer`, `fullstack-engineer`, `mobile-engineer`, `ui-ux-engineer`) -> `qa-engineer`.
   - Checkout: add `payment-engineer` and `cybersecurity-engineer` per the Checkout flow.
   - Search: lead with `search-engineer`. AI: `data-engineer` -> `ai-ml-engineer`.
   - Load the `ecommerce`, `frontend`, `design-system`, `payments`, `nova-security` and `nova-testing` skills where relevant.
3. **Server stays authoritative** for prices, inventory, discounts, permissions, payment state and order state. Account for retries, concurrency, partial failure and idempotency in critical flows.
4. **Security is part of implementation.** Anything touching auth, payments, personal data or secrets gets `cybersecurity-engineer` before it is called done.
5. **Validate against the quality gates:** build, relevant tests, lint/typecheck, the critical user journey, loading/error/empty states, API/database consistency, no unrelated regressions.
6. **Update docs** if architecture, API contracts, database behavior, deployment, security behavior or developer workflow changed.
7. Do not commit unless asked. Never expose secrets.

End with the handoff summary: what was inspected, what changed, what remains, files affected, contracts changed, risks, validation performed, follow-up required.
