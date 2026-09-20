---
description: Produce a concrete Nova implementation plan before writing code
argument-hint: <describe the feature or change>
---

Produce an implementation plan for: $ARGUMENTS

Start with `technical-product-engineer` to turn the request into acceptance criteria, dependencies and scope. Use `explorer` first if the relevant code has not been inspected. Bring in `software-architect` for architecture-level decisions and `planner` to sequence the work.

The plan must:

- State the goal and success criteria.
- Reflect the actual repository (apps, packages, `backend/`, existing conventions) - not generic assumptions or an earlier stack.
- Break the work into ordered, dependency-aware steps.
- Name which Nova specialist implements each step and where `cybersecurity-engineer`, `payment-engineer` and `qa-engineer` gates apply.
- Call out server-authoritative rules, idempotency/concurrency concerns, and migration or contract changes.
- List risks and open decisions that need the user's input.

Do not begin implementation - this command produces a plan for review.
