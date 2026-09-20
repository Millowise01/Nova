---
description: Design or review a Nova architecture decision
argument-hint: <the architecture question or proposal>
---

Address the following architecture question: $ARGUMENTS

Use `software-architect` (load the `nova-architecture` skill). Bring in `database-engineer` for data-layer decisions, `cloud-engineer`/`platform-engineer` for infrastructure, and `cybersecurity-engineer` for security implications.

Requirements:

- Inspect the current architecture first (monorepo layout, `backend/docs/`, existing modules and packages). Do not assume an earlier stack is current.
- Lay out real options with explicit trade-offs (cost, complexity, risk, reversibility), then recommend one.
- Keep server-side systems authoritative for business-critical state; note retry, concurrency and partial-failure behavior.
- Record significant decisions as an ADR (CLAUDE.md: document major architectural decisions) in the existing docs location.
- Flag open questions that need the user's input rather than deciding high-stakes trade-offs unilaterally.
