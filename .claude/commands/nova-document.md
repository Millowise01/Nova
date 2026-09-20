---
description: Write or update Nova documentation - README, guides, API docs, ADRs
argument-hint: <what needs documenting>
---

Document the following: $ARGUMENTS

Route by need: `technical-writer` for guides and concept docs, `api-documentation-engineer` for API reference (with `api-engineer` to confirm contracts), `software-architect` for ADRs, and `readme-engineer` for READMEs. Use the owning implementation agent to confirm technical facts.

Requirements:

- Inspect existing docs first (`docs/frontend/`, `backend/docs/`, package READMEs) and follow their structure and numbering.
- Verify every technical claim and command against the actual code.
- Update docs the change made inaccurate; do not leave stale docs (CLAUDE.md: update docs when architecture, API contracts, database behavior, deployment, security behavior or developer workflow change).
- Include working examples. Never include secrets or real credentials.

Report what was written or updated and where it lives.
