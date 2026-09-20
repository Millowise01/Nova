---
name: devops
description: CI/CD, deployment automation, and operational practices. Load for pipeline, deployment, or release-process work.
---

# DevOps

## When to use this skill

- Setting up or changing CI/CD pipelines, deployment automation, or release process.

## Checklist / best practices

- Fail fast on the cheapest checks first (lint/typecheck before slow integration/e2e tests).
- Cache and parallelize pipeline steps where it's safe to do so.
- Keep environments (dev/staging/prod) as close to identical as practical.
- Automate repeatable operational steps rather than leaving them manual.
- Ensure every deployment has a known rollback path before it ships.
- Gate deployment on real signals (tests passing, health checks) not just manual approval.
- Keep secrets out of pipeline config; use the platform's secret store.

## Common pitfalls

- A pipeline that passes without actually exercising the change (e.g. cached stale build).
- No rollback plan for a risky deployment.
- Manual, undocumented deployment steps that only one person knows.
- Long-running pipelines nobody trusts, so people skip them.

## Standards & references

- Deployment should be repeatable and idempotent - running it twice shouldn't cause harm.
