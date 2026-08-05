# Bounded Contexts

Source: Nova Enterprise Blueprint, **Volume 2 — System Architecture & Backend, Part B1** (bounded context list and ownership rule), cross-referenced with **Part D2** (entity design by domain) for the "owned schema" columns below.

## The rule (Vol 2, B1 — verbatim)

> Each [bounded context] owns its own schema and public API and is the single source of truth for its domain; **no other module reads or writes another module's tables directly.**

This is not a style preference — it's the property that makes the microservices migration path in Vol 2 Part F possible without a rewrite (Part F2, Strangler Fig: "because every module already owns its schema and communicates only through its public API and outbox events, this process never requires touching the internals of unrelated modules"). Every table below belongs to exactly one context. If you find yourself wanting to join across two contexts' tables in a single query, that's a signal you need either a synchronous call to the owning context's public API, or a locally-cached read model built from that context's published events — not a cross-schema join. See [01-module-contract.md](01-module-contract.md) for how that's implemented in code, and [04-events-and-jobs.md](04-events-and-jobs.md) for the event mechanism.

## Build order

This build order is the project's own phased plan for backend implementation, not a sequencing given verbatim in Vol 2 B1 (B1 lists the 12 contexts without attaching phase labels itself — the phasing below was specified directly for this documentation pass).

| Phase                   | Contexts                                          | Status                                                                             |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Phase 1**             | Identity, Catalog, Cart & Checkout, Orders        | **Built**                                                                          |
| **Phase 2**             | Payments & Wallet                                 | **In progress** — see [09-payments-wallet-design.md](09-payments-wallet-design.md) |
| **Phase 2** (remaining) | Logistics, Finance, Trust & Safety                | Deferred                                                                           |
| **Phase 3+**            | Sustainability, Marketing, Analytics, AI Platform | Deferred                                                                           |

---

## Phase 1 — Build now

### Identity

**Responsibilities** (Vol 2, B1): Accounts, sessions, MFA, OAuth, devices, passwords, OTP, login risk signals.

**Owned schema** (Vol 2, D2): `User` (one record per natural person — customer, seller staff member, rider, or admin, distinguished by role assignment), `Session`, `Device`, `AuthFactor` (password, OTP, social, passkey), `Address`. A `User` has zero or one `Seller` profile and zero or one `Rider` profile — the _profile_ record (business registration, verification status) is Identity-owned; Catalog and Logistics reference the `Seller`/`Rider` ID as an opaque foreign key, never joining into it directly.

### Catalog

**Responsibilities** (Vol 2, B1): Products, variants, categories, brands, attributes, media, search indexing triggers.

**Owned schema** (Vol 2, D2): `Product` (owned by a `Seller`, referenced by ID only — see Identity above), `Variant` (size, color, etc. — see [07-glossary.md](07-glossary.md) for how this maps to "SKU"), `Category` (hierarchical, self-referencing parent/child), `Media`, `Review`. Catalog also owns the triggers that keep the OpenSearch index in sync (Vol 2, E4) — indexing itself is a background job, not a separate context.

> Review moderation is a **Trust & Safety** responsibility (Vol 2, B1), but the `Review` row itself is Catalog-owned data (Vol 2, D2). Trust & Safety doesn't get its own table for this — it acts on Catalog's `Review` rows through Catalog's public API or by publishing a moderation-decision event Catalog subscribes to (exact mechanism deferred with Trust & Safety itself, since it's Phase 2+).

### Cart & Checkout

**Responsibilities** (Vol 2, B1): Cart sessions, address selection, shipping options, totals/coupon calculation, idempotent checkout orchestration.

**Owned schema** (Vol 2, D2 + C3): `Cart` (belongs to a `User` or a guest `Session`), `CartLine` (references a `Product` `Variant` by ID), `CheckoutSession` (address, shipping option, payment method selection — this entity isn't named explicitly in D2's prose, but its existence is implied directly by the `/v1/checkout/session` endpoint in C3, "Create a checkout session with address, shipping option, and payment method"; treated here as a distinct table from `Cart` rather than extra columns bolted onto it, since a cart can exist and be modified long before checkout begins).

### Orders

**Responsibilities** (Vol 2, B1): Order state machine, cancellations, shipment linkage, history, order-related notifications.

**Owned schema** (Vol 2, D2): `Order` (created from a successful checkout; "may itself contain `Sub-Orders` grouped by seller — a single customer cart can span multiple sellers, each fulfilled and paid out independently"), `SubOrder`. `Order` has a strict state machine — `placed, confirmed, packed, shipped, delivered, completed, cancelled, returned` — **enforced at the application layer, not merely as a status string** (Vol 2, D2).

> **Notifications ambiguity, flagged for your confirmation:** B1's table lists exactly 12 bounded contexts, and none of them is called "Notifications" — sending order notifications is listed as part of _Orders'_ own responsibility. But Part B3's worked example says "`OrderPlaced` event triggers Notification, Analytics, Finance, and Sustainability consumers independently," and Part F3 separately lists "Notifications" as its own future microservice-extraction candidate. The blueprint isn't fully self-consistent here — it's not clear whether Notification delivery is (a) a shared/cross-cutting capability each context triggers for its own domain events (what this doc assumes), or (b) an implicit 13th bounded context that B1 just didn't enumerate. This doc treats it as (a) since that's what B1's context list actually supports, but it's worth you settling explicitly before Phase 1 build starts. See the consolidated confirmation list.

---

## Phase 2 — In progress

### Payments & Wallet

**Responsibilities:** Payment intents, PSP adapters, refunds, wallet ledger entries (Volume 5). **Settlement and reconciliation are explicitly excluded from this context's build** — settlement/seller payouts are Finance's entities per this doc's own split (below), and reconciliation depends on a real PSP integration that doesn't exist yet. See [09-payments-wallet-design.md](09-payments-wallet-design.md) for the full design, the PSP-adapter stubbing decision, and where dual authorization (Vol 3, B4) becomes real the moment this context exists.

**Owned schema:** `PaymentIntent` (references a PSP adapter and provider transaction ID), `WalletAccount` (one per `User` or `Seller`), `WalletLedgerEntry` (immutable, append-only; balances are _always derived by summing ledger entries, never stored and mutated directly_ — Vol 2, D2 calls this "the single most important integrity rule in the entire schema"), `RefundRequest` (the dual-authorization propose/approve record for refunds above a configured threshold).

---

## Phase 2 (remaining) — Deferred

### Logistics

**Responsibilities:** Riders, delivery jobs, dispatch, routing, proof of delivery, failed-delivery handling, COD reconciliation (Volume 5).
**Owned schema:** `DeliveryZone`, `DeliveryJob` (created from a fulfilled `SubOrder`, assigned to a `Rider`; status timeline `assigned → picked up → in transit → delivered/failed`), `ProofOfDelivery`, `CODReconciliation`.

### Finance

**Responsibilities:** Double-entry ledger accounts and entries, fees, taxes, invoices, seller payouts.
**Owned schema:** `LedgerAccount` (chart of accounts — revenue, commission, tax payable, seller payable), `LedgerEntry` (posted in double-entry pairs so the books always balance), `SellerPayout`.

### Trust & Safety

**Responsibilities:** KYC, fraud rules, disputes, review moderation, immutable audit logs (Volume 3).
**Owned schema:** `KYCSubmission` (belongs to a `Seller` or `Rider`; review state `pending/approved/rejected`), `Dispute` (references an `Order` or `Review`), `DisputeEvent`, `AuditLog` (platform-wide, append-only — written to by every other domain when a sensitive action occurs; see the confirmation list in [05-security-baseline.md](05-security-baseline.md) for how that's reconciled with the single-owner-schema rule).

---

## Phase 3+ — Deferred

### Sustainability

**Responsibilities:** Eco-score calculation, carbon calculator, recycling rewards, impact dashboard data.
**Owned schema:** Not yet specified — Vol 2's D2 entity design covers Identity, Catalog, Cart/Checkout/Orders, Payments & Wallet, Finance, Logistics, and Trust & Safety only. Sustainability has no entity design in the source blueprint yet; do not invent one here — define it when this context enters the build order.

### Marketing

**Responsibilities:** Campaigns, coupons, flash sales, banners, segmentation, referrals, loyalty.
**Owned schema:** Not yet specified (same reasoning as Sustainability above).

### Analytics

**Responsibilities:** Event ingestion, funnels, cohorts, dashboards, scorecards, exports.
**Owned schema:** Not yet specified. Vol 2 D1 does note its eventual storage tier: ClickHouse, "Phase 2+ ... once event volume justifies separating analytical workloads from the transactional database" — so this context's datastore is already decided even though its entities aren't.

### AI Platform

**Responsibilities:** Model-serving interfaces for search, recommendations, fraud scoring, and support assist (Volume 4).
**Owned schema:** Not yet specified — full design lives in Volume 4, out of scope for this backend doc set until AI Platform enters the build order.
