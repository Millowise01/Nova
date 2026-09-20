---
name: databases
description: Schema design, indexing, query optimization, migrations, and database security. Load for any task touching schema, queries, or migrations.
---

# Databases

## When to use this skill

- Designing or changing a schema, writing non-trivial queries, or writing a migration.

## Checklist / best practices

- Model the schema around real access patterns, not just the abstract domain.
- Normalize by default; denormalize deliberately, with a stated reason.
- Index columns used in WHERE/JOIN/ORDER BY on non-trivial tables.
- Write migrations that are reversible or have a clear rollback plan.
- Wrap multi-step writes in transactions where atomicity matters.
- Check query plans (EXPLAIN/EXPLAIN ANALYZE) for anything on a hot path.
- Avoid N+1 query patterns - batch or join instead.
- Never store secrets or excessive personal data unencrypted.

## Common pitfalls

- Adding an index without checking whether it's actually used.
- A migration that isn't safe to run against a large, live table (e.g. a blocking ALTER).
- Denormalizing prematurely before a real performance problem exists.
- Trusting client-supplied IDs/ownership without a server-side check.

## Standards & references

- ACID properties and the isolation level actually in use.
- Principle of least privilege for database credentials/roles.
