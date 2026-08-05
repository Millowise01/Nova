# Module Contract

Source: Nova Enterprise Blueprint, **Volume 2, Part B2** (module contract), **Part B3** (cross-module communication rules), **Part B4** (component-to-bounded-context mapping), and **Volume 7, Part A2** (architecture conventions).

## The contract (Vol 2, B2 — every module must)

1. Own its own database schema; no cross-schema joins from outside the module.
2. Expose a versioned public API (internal RPC/HTTP interface, plus the external REST/GraphQL surface where relevant — see [02-api-standards.md](02-api-standards.md)).
3. Publish domain events for every meaningful state change via the transactional outbox — see [04-events-and-jobs.md](04-events-and-jobs.md).
4. Own its background jobs and queue consumers.
5. Declare its own permission set, consumed by the RBAC/ABAC engine — see [05-security-baseline.md](05-security-baseline.md).
6. Ship with its own unit, integration, and contract test suite — see [06-testing-strategy.md](06-testing-strategy.md).

Vol 2, B4 (Component Level) is explicit about why this matters beyond tidiness: "This component-to-bounded-context mapping is what makes the eventual microservices extraction a matter of moving a folder into its own deployable, rather than disentangling business logic that was never cleanly separated." Every rule below exists to keep that true.

## What the blueprint leaves unspecified — and this doc's proposed answer

Vol 2 describes the contract at the architecture level ("controllers, services, repositories, event handlers" per B4) but doesn't give a concrete folder layout, file-naming convention, or the exact mechanism for a "synchronous internal call." Those are proposed below, marked clearly, so there's one unambiguous answer instead of each module inventing its own shape.

> **Proposed, not yet confirmed:** Since Nova is a modular monolith at Phase 1 (Vol 2, A1) — not yet split into network-addressable services — a "synchronous call (internal API)" between modules (Vol 2, B3) is implemented as a **direct in-process call to the target module's exported public service via NestJS dependency injection**, not an HTTP round-trip. Rationale: B4 says extraction should be "a matter of moving a folder," which only holds if today's in-process public-service boundary _is_ tomorrow's network boundary — so the call shape (a typed method call against a narrow public interface) has to be identical in both cases; only the transport changes. This mirrors exactly how Vol 2, E3 describes the outbox-to-Kafka swap for async events ("only the transport changes, not the application's event-publishing contract").

## Standard module folder structure (proposed)

```text
src/modules/<context>/
  <context>.module.ts        # NestJS module definition — wires everything below together
  index.ts                   # PUBLIC BARREL — the only file other modules may import from
  public/
    <context>.public-service.ts   # exported service — the module's internal "API"
    dto/                          # request/response shapes used across module boundaries
  http/
    <context>.controller.ts       # REST controllers — thin, delegate to services immediately
    dto/                          # HTTP-layer request/response DTOs (may differ from public/ dto)
  domain/
    <context>.service.ts          # domain logic — the only place business rules live (Vol 7, A2)
    entities/                     # TypeORM/Prisma entity definitions — schema this module owns
  infra/
    <context>.repository.ts       # persistence — the ONLY code that queries this module's tables
  events/
    publishers/                   # helpers that write outbox rows for this module's events
    handlers/                     # subscribers to OTHER modules' events (cross-module side effects)
  jobs/
    <job-name>.processor.ts       # this module's queue consumers (Vol 2, B2, rule 4)
  <context>.permissions.ts        # this module's declared permission set (Vol 2, B2, rule 5)
  <context>.module.spec.ts        # + colocated *.spec.ts per file per Volume 7 testing conventions
```

**The rule that makes this enforceable, not aspirational:** only `index.ts` is importable from outside the module. Everything else is invisible to the rest of the codebase — not by convention alone, but by an ESLint boundary rule (e.g. `eslint-plugin-boundaries` or a custom `no-restricted-imports` pattern per module) that fails CI on a deep import like `import { OrderService } from "../orders/domain/order.service"` from outside the `orders/` folder. Vol 2, B1's "no other module reads or writes another module's tables directly" is a promise about behavior; the lint rule is what actually keeps the promise true as the team grows past the size where everyone remembers it by hand.

## Concrete example: Orders module public surface

```typescript
// src/modules/orders/index.ts
// The ENTIRE public surface of the Orders module. Anything not exported
// here does not exist as far as the rest of the codebase is concerned.

export { OrdersModule } from "./orders.module";
export { OrdersPublicService } from "./public/orders.public-service";
export type { CreateOrderInput, OrderSummary, OrderStatus } from "./public/dto/orders.dto";
```

```typescript
// src/modules/orders/public/orders.public-service.ts
// This is the ONLY way another module (e.g. Cart & Checkout) is allowed
// to interact with Orders. It is intentionally narrower than OrderService
// (domain/order.service.ts), which has methods no other module should call.

import { Injectable } from "@nestjs/common";
import { OrderService } from "../domain/order.service";
import type { CreateOrderInput, OrderSummary } from "./dto/orders.dto";

@Injectable()
export class OrdersPublicService {
  constructor(private readonly orderService: OrderService) {}

  /** Called by Cart & Checkout after a successful checkout session. */
  async createFromCheckout(input: CreateOrderInput): Promise<OrderSummary> {
    return this.orderService.createFromCheckout(input);
  }

  /** Called by Payments & Wallet's webhook handler to confirm an order. */
  async markConfirmed(orderId: string): Promise<void> {
    return this.orderService.transitionTo(orderId, "confirmed");
  }
}
```

```typescript
// src/modules/cart-checkout/domain/checkout.service.ts
// Cart & Checkout consuming Orders' public service — a same-process method
// call today; identical shape to what an HTTP client call would look like
// after Orders is extracted (Vol 2, Part F2, strangler fig).

import { Injectable } from "@nestjs/common";
import { OrdersPublicService } from "../../orders"; // <- via the public barrel ONLY

@Injectable()
export class CheckoutService {
  constructor(private readonly orders: OrdersPublicService) {}

  async completeCheckout(sessionId: string) {
    // ... validate session, confirm price/stock via Catalog's public service ...
    return this.orders.createFromCheckout({/* ... */});
  }
}
```

Note what's _not_ here: `CheckoutService` never imports `OrderService` or `OrderRepository` directly, and never queries the `orders` schema. If Orders is extracted into its own deployable per Vol 2, Part F, `OrdersPublicService`'s two methods become the literal shape of its external API client — nothing in `CheckoutService` needs to change except the import path and the fact that the call becomes a network round-trip instead of an in-process one.
