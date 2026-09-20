---
description: Clean up dead code, unused dependencies, or repo hygiene in Nova
argument-hint: [optional - specific area to focus cleanup on]
---

Clean up: $ARGUMENTS

Use `codebase-cleaner` for dead code, `dependency-manager` for dependency cleanup, and `platform-engineer` for shared tooling or workspace hygiene. Use `qa-engineer` to confirm nothing regressed.

Rules (per `.claude/CLAUDE.md`):

- Run `git status` first. Never discard unrelated user changes.
- Verify something is actually unused by searching real usages across `apps/`, `packages/` and `backend/` before removing it.
- Prefer existing dependencies. Before removing a package, check every workspace that could import it.
- Small, reviewable, focused changes - not one giant sweep.
- Do not reset, rebase, force-push or delete branches. Explain and get confirmation before any destructive operation.
- Do not touch `.env` files or secrets.
- Confirm build, tests and lint/typecheck still pass afterward.

Report exactly what was removed and why it was confirmed safe.
