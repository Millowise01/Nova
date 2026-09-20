---
description: Prepare and execute a Nova deployment with release safeguards
argument-hint: <what to deploy and where>
---

Handle deployment for: $ARGUMENTS

Follow the CLAUDE.md Deployment flow: `devops-engineer` -> `cloud-engineer`/`platform-engineer` -> `sre-engineer` -> `cybersecurity-engineer` -> `qa-engineer` (load the `deployment` skill).

Before deploying:

- Inspect the current CI/CD (`.github/`, `turbo.json`, `docker-compose.yml`) and deploy through the established pipeline.
- Confirm build, tests, lint and typecheck pass, and required review/security gates are done.
- Confirm environment config for the target is correct and no secrets are hardcoded or printed.
- Check database migrations and observability (logging, Sentry, metrics) for the target.
- Confirm a rollback path exists and is understood.
- Production or destructive actions need explicit user confirmation.

After deploying:

- Verify health checks and the critical user journeys rather than assuming success.
- Report what was deployed, to where, how it was verified, and how to roll it back.
