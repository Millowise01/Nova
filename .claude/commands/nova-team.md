---
description: Assemble and run the right Nova specialist team for a request
argument-hint: <describe the task>
---

Coordinate the following request: $ARGUMENTS

Use the smallest group of specialists that can do the job, following `.claude/CLAUDE.md`:

1. Classify the work and pick the matching flow:
   - Feature: `technical-product-engineer` -> `software-architect` (when needed) -> implementation agents -> `qa-engineer`
   - Checkout: `technical-product-engineer` -> `software-architect` -> `ui-ux-engineer` -> `frontend-engineer` -> `api-engineer` -> `backend-engineer` -> `database-engineer` -> `payment-engineer` -> `cybersecurity-engineer` -> `qa-engineer`
   - Search: `technical-product-engineer` -> `software-architect` -> `search-engineer` -> `backend-engineer`/`api-engineer` -> `database-engineer` -> `frontend-engineer` -> `qa-engineer`
   - Deployment: `devops-engineer` -> `cloud-engineer`/`platform-engineer` -> `sre-engineer` -> `cybersecurity-engineer` -> `qa-engineer`
   - AI: `technical-product-engineer` -> `software-architect` -> `data-engineer` -> `ai-ml-engineer` -> `backend-engineer`/`api-engineer` -> `frontend-engineer` -> `analytics-engineer` -> `qa-engineer`
2. Inspect the repository before delegating (git status, manifests, conventions).
3. Delegate in dependency order. Give each agent standalone context: goal, files, constraints, and the handoff it must return.
4. Require the handoff protocol from every agent: what was inspected, what changed, what remains, files affected, contracts changed, risks, validation performed, follow-up required.
5. Check each result against the CLAUDE.md quality gates and Definition of Done before moving on.
6. Return one concise report: what was done, key decisions, risks, what remains.

Do not invoke agents the task does not need. Do not commit unless asked.
