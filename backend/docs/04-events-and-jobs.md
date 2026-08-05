# Events & Background Jobs

Source: Nova Enterprise Blueprint, **Volume 2, Part E3** (event bus & outbox relay), **Part E2** (background jobs & queues), **Part A1** (outbox pattern rationale), **Part B3** (when to use events vs. synchronous calls).

## Why the outbox pattern exists (Vol 2, A1)

> "Every meaningful state change writes an outbox row in the same database transaction as the state change itself, guaranteeing at-least-once delivery of events without dual-write inconsistency."

The problem this solves: without it, "write the order row" and "publish `OrderPlaced`" are two separate operations that can fail independently — the order commits but the event is lost (a crash between the two writes), or the event fires but the transaction rolls back (a message sent for something that never actually happened). The outbox makes them **one atomic operation**: the event row is written in the _same_ database transaction as the domain change, so it either both happen or neither does. This is the single most structurally important pattern in this doc set — it's what makes [01-module-contract.md](01-module-contract.md)'s "no cross-module table access, ever" rule survivable in practice, because it's the mechanism that replaces those cross-module reads with reliable async notification instead.

## When to use an event vs. a synchronous call (Vol 2, B3)

| Pattern                                                                          | When                                                                                                                                                | Example                                                                                              |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Synchronous call (internal API — [01-module-contract.md](01-module-contract.md)) | The caller needs an immediate, consistent answer before proceeding — typically a validation or read.                                                | Checkout calls Catalog to confirm current price and stock before creating an order.                  |
| Asynchronous event (outbox + subscriber)                                         | The side effect can happen after the originating transaction commits, and the originating module shouldn't be coupled to every downstream consumer. | `OrderPlaced` triggers Notification, Analytics, Finance, and Sustainability consumers independently. |

If you're not sure which one applies: ask whether the _caller_ needs the answer to decide what to do next (→ synchronous), or whether the caller's job is done regardless of what downstream consumers do with the information (→ event). Money movement has its own stricter rule layered on top of this, from Vol 2, B3: "every payment, refund, and payout operation carries an idempotency key, and every state transition is recorded as an immutable, append-only ledger entry before any balance is considered changed. This rule has no exceptions anywhere in the platform" — relevant once Payments & Wallet enters the build order, noted here because it's the same B3 section this table comes from.

## The outbox table

> **Proposed, not yet confirmed — exact schema.** Vol 2 D3 and E3 establish that an `outbox_events` table exists and is written in the same transaction as the domain change, but don't give column-level detail. Proposed:

```sql
create table outbox_events (
  id              uuid primary key default gen_random_uuid(),
  aggregate_type  text not null,        -- e.g. 'Order'
  aggregate_id    uuid not null,        -- e.g. the order's id
  event_type      text not null,        -- e.g. 'OrderPlaced'
  event_version   int not null,         -- see "payload versioning" below
  payload         jsonb not null,
  occurred_at     timestamptz not null default now(),
  published_at    timestamptz null,     -- null = not yet relayed
  attempts        int not null default 0
);

create index outbox_events_unpublished_idx
  on outbox_events (occurred_at)
  where published_at is null;
```

The partial index only over unpublished rows is what keeps the relay's polling query fast regardless of how large the (append-only, rarely-deleted) table grows.

## The relay (Vol 2, E3)

> "At launch, the outbox table is polled by a lightweight relay process that publishes pending events to module-specific consumers within the same monolith deployment — sufficient for Phase 1 scale without introducing a distributed message broker. As event volume and the number of independent consumers grow (Phase 2+...), the relay is replaced with Kafka or Redpanda, with the outbox pattern unchanged on the producing side — only the transport changes, not the application's event-publishing contract."

This means: **the code that writes to `outbox_events` never changes when the relay is swapped for Kafka later.** Only the relay process — the thing that reads `outbox_events` and hands rows to subscribers — is replaced. Design every event publisher against that assumption: never let a module reach past the outbox table into "how events actually get delivered," because that's precisely the part scheduled to change.

> **Proposed, not yet confirmed — poll interval.** Proposed: **poll every 500ms**, using `SELECT ... FOR UPDATE SKIP LOCKED` to claim a batch of unpublished rows safely if the relay ever runs more than one instance. 500ms keeps Phase 1 end-to-end event latency low (well under the sub-second budget implied by Volume 7's SLOs for order-status updates) without polling aggressively enough to matter at Phase 1's transaction volume. Reasonable to tighten later with Postgres `LISTEN`/`NOTIFY` as a wake-up signal instead of pure polling, without changing the outbox contract itself.

## Event payload versioning

> **Proposed, not yet confirmed.** The blueprint doesn't specify how an event's shape is allowed to evolve once consumers depend on it. Proposed: each event carries an `event_version` integer (see schema above), starting at `1`. Changes are **additive-only within a version** (new optional fields are fine); any change that could break an existing consumer's parsing — removing a field, changing a field's type, renaming a field — requires bumping `event_version` and having the publisher emit both versions during a deprecation window, mirroring the API versioning policy in [02-api-standards.md](02-api-standards.md). This keeps one consistent versioning philosophy across the whole platform instead of the REST API and the event bus evolving under different rules.

## Worked example: `OrderPlaced`, publish to consumption

**1. Publish — inside the same transaction as the order write**

```typescript
// src/modules/orders/domain/order.service.ts
async createFromCheckout(input: CreateOrderInput): Promise<OrderSummary> {
  return this.dataSource.transaction(async (tx) => {
    const order = await this.orderRepository.insert(tx, {
      status: "placed",
      /* ...totals, sub-orders, etc... */
    });

    // Same transaction, same commit-or-rollback as the insert above.
    await this.outboxPublisher.publish(tx, {
      aggregateType: "Order",
      aggregateId: order.id,
      eventType: "OrderPlaced",
      eventVersion: 1,
      payload: {
        orderId: order.id,
        userId: order.userId,
        subOrders: order.subOrders.map((s) => ({ id: s.id, sellerId: s.sellerId })),
        total: order.total, // Money — { amount: string, currency: CurrencyCode }
        placedAt: order.createdAt,
      },
    });

    return toOrderSummary(order);
  });
}
```

**2. Relay** polls `outbox_events`, finds the row, hands it to every registered subscriber for `OrderPlaced`, then marks `published_at`.

**3. Consumption — four independent subscribers, per the B3 example**

```typescript
// src/modules/notifications/events/handlers/order-placed.handler.ts
@OnEvent("OrderPlaced")
async handleOrderPlaced(event: OrderPlacedEvent) {
  await this.notificationService.send(event.payload.userId, "order-confirmation", {
    orderId: event.payload.orderId,
  });
}
```

```typescript
// src/modules/analytics/events/handlers/order-placed.handler.ts
@OnEvent("OrderPlaced")
async handleOrderPlaced(event: OrderPlacedEvent) {
  await this.analyticsIngest.record("order_placed", event.payload);
}
```

Finance and Sustainability subscribe the same way, each in its own module, each unaware the other three exist. If Notification's handler throws, Analytics's handler still runs — subscribers are independent, and a slow or failing consumer never blocks the transaction that originally placed the order (it already committed before the relay even picked the event up). Per-consumer retry and dead-letter handling is a background-job concern — see below.

## Background jobs & queues (Vol 2, E2)

> "Asynchronous work — sending notifications, indexing search documents, generating reports, processing payout batches, running fraud scoring — is handled by queue-backed background workers, decoupled from the request/response cycle. Each module owns the queue consumers relevant to its domain. Jobs are designed to be idempotent and safely retryable, with dead-letter queues and alerting for jobs that exceed their retry budget."

This is a distinct mechanism from the outbox relay above: the outbox relay delivers _events between modules_; background jobs are how a single module does _its own_ async work (a Catalog job re-indexing a product into OpenSearch, an Orders job generating a shipment label) — often triggered _by_ an incoming event, but not the event-delivery mechanism itself.

> **Proposed, not yet confirmed — queue technology.** Vol 2, A2 already commits to Redis as the platform's cache/ephemeral-state store, but no specific queue library is named. Proposed: **BullMQ** (`@nestjs/bullmq`), Redis-backed, with first-class NestJS integration, built-in retry/backoff, and dead-letter ("failed") queue support out of the box — satisfying the E2 requirement without introducing infrastructure beyond what A2 already committed to. Every module's `jobs/` folder ([01-module-contract.md](01-module-contract.md)) registers its own BullMQ queue and processor; no shared "god queue" that every module dumps jobs into.

Each job handler must be **idempotent** — safe to run twice with the same input and produce the same end state — because BullMQ's at-least-once retry semantics mean it _will_ occasionally run twice. A job that isn't idempotent (e.g. one that appends to a list rather than upserting) is a bug, not an acceptable tradeoff.
