# Database Conventions

Source: Nova Enterprise Blueprint, **Volume 2, Part D1** (storage topology), **Part D3** (data patterns & conventions), **Part D4** (migration policy).

## Storage topology (Vol 2, D1)

| Store                 | Role                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **PostgreSQL 16**     | System of record for all transactional data — identity, catalog, orders, payments, the financial ledger, logistics, and trust & safety records.                                                                          |
| Redis                 | Cache, rate-limit counters, transient session state, distributed locks, internal pub/sub. Not a system of record for anything.                                                                                           |
| OpenSearch            | Product search index, filters, facets — kept in sync with PostgreSQL via outbox-driven indexing jobs ([04-events-and-jobs.md](04-events-and-jobs.md)). Rebuildable from Postgres at any time; never the source of truth. |
| AWS S3                | Object storage — media, documents, invoices, exports.                                                                                                                                                                    |
| ClickHouse (Phase 2+) | Analytical event store, once event volume justifies separating analytics from the transactional database. Not relevant to Phase 1.                                                                                       |

Every Phase 1 bounded context's schema lives in the same PostgreSQL 16 instance, as separate logical schemas per module (see below) — not separate databases. This is a Phase 1 implementation detail consistent with the modular-monolith architecture (Vol 2, A1): the schema boundary is enforced by code discipline and the module contract ([01-module-contract.md](01-module-contract.md)), not by physical database separation, because physical separation is exactly what happens at microservices extraction time (Vol 2, Part F) — not before.

## Entity design patterns (Vol 2, D3)

| Pattern                     | Requirement                                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Money**                   | `numeric(14,2)` plus an explicit currency code column. Floating-point types are never used for monetary values anywhere in the schema.                                                              |
| **Time**                    | All timestamps stored as `timestamptz` in UTC; presented in local time at the application layer only.                                                                                               |
| **Soft delete**             | Nullable `deleted_at` column, with partial indexes that exclude deleted rows — preserves referential and audit history without physical deletion.                                                   |
| **Optimistic locking**      | A `version` integer column on high-conflict entities (inventory, wallet balances) to prevent lost updates under concurrent writes.                                                                  |
| **Outbox**                  | Every meaningful state change writes a corresponding row to an `outbox_events` table in the _same transaction_ — see [04-events-and-jobs.md](04-events-and-jobs.md).                                |
| **PII protection**          | Field-level encryption for phone numbers, email addresses, and government ID numbers; tokenized replicas for analytics so raw PII never reaches the analytics store.                                |
| **Multi-country readiness** | A `country_code` column on every organization-scoped table from day one, even while only Sierra Leone is active.                                                                                    |
| **Indexing**                | B-tree indexes on foreign keys, status columns, and `created_at`; GIN indexes on JSONB and full-text search columns; unique constraints on natural keys (email, phone, seller registration number). |

### Money — matching `@nova/types`

The codebase already has a canonical `Money` type in `packages/types/src/index.ts`:

```typescript
export type CurrencyCode = "SLE" | "USD";

export interface Money {
  amount: string;
  currency: CurrencyCode;
}
```

This is the same rule as Vol 2, D3's "Money" row and Volume 7, Part A2 ("Money values are always typed as a structured object... never as raw number or float"), with one implementation detail worth being explicit about: **the database column is Postgres's native `numeric(14,2)`, but the application-layer / wire representation is a decimal _string_, not a `Decimal` class instance** — JavaScript has no native arbitrary-precision decimal type, and a string survives JSON serialization without the precision loss a `number` would introduce. Every backend query result that touches a money column is mapped through this `Money` type at the repository boundary — a raw `number` never crosses out of a repository method.

### Naming conventions

> **Proposed, not yet confirmed.** Vol 2, D3 doesn't specify a naming convention (snake_case vs. camelCase, singular vs. plural table names) — the table above covers _what_ to store, not _what to call it_. Proposed default, matching standard PostgreSQL/NestJS-with-TypeORM convention:
>
> - Table names: `snake_case`, plural — `orders`, `cart_lines`, `wallet_ledger_entries`.
> - Column names: `snake_case` — `created_at`, `seller_id`, `deleted_at`.
> - TypeScript entity classes: `PascalCase`, singular — `Order`, `CartLine`, `WalletLedgerEntry` — matching the entity names already used in Vol 2, D2's prose.
> - Foreign key columns: `<referenced_entity>_id` — `seller_id`, `order_id`. No abbreviations.

### Audit columns

> **Proposed, not yet confirmed.** D3's "Time" row establishes `timestamptz`/UTC but doesn't enumerate which timestamp columns are mandatory, and D3 has no explicit row for "who made this change." Proposed default, required on every table in every Phase 1 context:
>
> | Column       | Type                                   | Notes                                                                                                              |
> | ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
> | `created_at` | `timestamptz not null default now()`   | Never updated after insert.                                                                                        |
> | `updated_at` | `timestamptz not null default now()`   | Bumped on every write; enforced by a trigger or ORM hook, not left to application code to remember.                |
> | `created_by` | `uuid, nullable, references users(id)` | Null for system-initiated writes (a background job, a migration backfill) — never null for a user-initiated write. |
> | `updated_by` | `uuid, nullable, references users(id)` | Same rule as `created_by`.                                                                                         |
>
> This is distinct from — and doesn't replace — the platform-wide `AuditLog` table (Vol 2, D2, Trust & Safety) which records _sensitive actions_ with full context (actor, reason, IP, correlation ID). These four columns answer "who last touched this specific row," which the `AuditLog` table doesn't need to duplicate for every routine write.

### Soft delete vs. hard delete

D3 establishes soft delete (`deleted_at`) as _the_ pattern — it does not describe a hard-delete path at all.

> **Proposed, not yet confirmed.** Hard delete is reserved exclusively for GDPR/data-subject-erasure requests (Volume 3, Part J2 — "documented processes for access, correction, **deletion**, and data portability requests, with defined response SLAs"), executed through a dedicated, audited erasure procedure — never as a general-purpose delete path available to application code. Every other deletion, anywhere in the platform, is a soft delete. If a future feature seems to need a hard delete for a reason other than a legal erasure request, that's a sign the actual requirement is better modeled as an access-control change (hide the row) than a data-removal one.

## Phase 1 entities, scoped by context

Restated from [00-bounded-contexts.md](00-bounded-contexts.md) with the conventions above applied — this is the concrete table list Phase 1 migrations need to produce.

| Context         | Tables                                                      |
| --------------- | ----------------------------------------------------------- |
| Identity        | `users`, `sessions`, `devices`, `auth_factors`, `addresses` |
| Catalog         | `products`, `variants`, `categories`, `media`, `reviews`    |
| Cart & Checkout | `carts`, `cart_lines`, `checkout_sessions`                  |
| Orders          | `orders`, `sub_orders`                                      |

Every table in this list gets: the four audit columns above, `deleted_at` (soft delete), `country_code`, and the outbox-relevant triggers described in [04-events-and-jobs.md](04-events-and-jobs.md) wherever the table represents a meaningful state change worth publishing.

## Migration policy (Vol 2, D4)

- Schema changes are managed through **versioned, reversible migrations** checked into the same repository as the code that depends on them.
- Every migration touching a table larger than a defined row-count threshold must be reviewed for lock behavior and, where necessary, executed as an **online/non-blocking strategy** — add a column as nullable first, backfill in batches, then enforce constraints, rather than a single blocking `ALTER TABLE ... NOT NULL`.
- **No migration is ever run directly against production** outside the CI/CD pipeline (Volume 7) — there is no manual `psql` against prod, ever, by anyone, including in an incident.
- Volume 7, Part C3 adds a constraint this doc inherits directly: "Database migrations must be backward-compatible with the previous application version so that a rollback does not require a simultaneous schema rollback" — every migration must work with both the old and new application code running against it simultaneously, for the duration of a rollout.

> **Proposed, not yet confirmed — the "defined row-count threshold."** D4 says migrations touching tables above a threshold need lock-behavior review, without giving the number. Proposed default: **10,000 rows**, reviewed and probably lowered once Phase 1 tables have real production volume — the number matters less than the review being a checklist item on the PR template for any migration, not a judgment call left to the author.
