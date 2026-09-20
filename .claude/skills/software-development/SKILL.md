---
name: software-development
description: General software engineering best practices - code quality, dependency management, error handling. Load for any implementation task regardless of stack.
---

# Software Development

## When to use this skill

- Any task that writes, edits, or reviews application code, regardless of language or framework.

## Checklist / best practices

- Inspect existing code and conventions before writing anything new.
- Prefer the smallest change that correctly solves the problem.
- Reuse existing utilities/patterns instead of duplicating logic.
- Handle errors explicitly - no silent failure, no swallowed exceptions.
- Add or update tests proportional to the risk of the change.
- Keep functions/modules focused on one responsibility.
- Justify any new dependency by what it replaces or enables.
- Leave no dead code, commented-out blocks, or TODOs without an owner.

## Common pitfalls

- Rewriting working code instead of extending it.
- Introducing a new pattern/library alongside an existing equivalent one.
- Claiming a change is 'done' without actually running validation.
- Fixing a symptom instead of the root cause.

## Standards & references

- Match the linter/formatter configuration already in the repo.
- Follow the project's existing error-handling convention (exceptions vs. result types, etc.).
