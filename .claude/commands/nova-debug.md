---
description: Investigate and fix a bug in Nova, from an error message or a description
argument-hint: <error message, stack trace, or description of the broken behavior>
---

Debug the following: $ARGUMENTS

If the root cause is unknown, start with `problem-solver`. Once it is localized, hand the fix to the owner: `frontend-engineer`, `backend-engineer`, `api-engineer`, `database-engineer` or `payment-engineer`. Use `qa-engineer` to verify.

Workflow:

1. Inspect `git status` and recent commits, then reproduce or precisely characterize the problem.
2. Form and test hypotheses - do not patch the first symptom found.
3. Trace to the actual root cause, including config/env issues and cross-package contracts.
4. Fix the cause and related edge cases without weakening security checks to make something pass.
5. Add a regression test that fails without the fix and passes with it.
6. Run the relevant build, test and lint/typecheck gates.
7. Report the root cause, the fix, files changed, and how it was verified.

Do not commit unless asked. Never print secrets while debugging.
