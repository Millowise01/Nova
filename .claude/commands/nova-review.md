---
description: Review recent Nova changes (correctness, security, QA as warranted)
argument-hint: [optional - specific files, PR, or diff to focus on]
---

Review the following (or, if empty, the current uncommitted/branch changes): $ARGUMENTS

Run `git status` and `git diff` first, and review the actual diff.

- Always: `qa-engineer` for correctness, regressions, test coverage, and loading/error/empty states.
- Auth, payments, wallet, personal data, secrets, webhooks or infrastructure: also `cybersecurity-engineer` (and `payment-engineer` for payment logic).
- UI changes: also `ui-ux-engineer` for design-system, mobile-first and accessibility consistency.
- Structural or cross-domain changes: also `software-architect`.
- Database/migration changes: also `database-engineer`.

Check against `.claude/CLAUDE.md`: server authority (no trusted client prices/inventory/payment success), no secrets, existing patterns and dependencies preserved, docs updated where required.

Report findings with severity, evidence (file and line), and a suggested direction, plus an overall verdict: ready / needs changes / blocked. Do not modify code in this command; consolidate findings into one prioritized list.
