# Glossary — Phase 1 Ubiquitous Language

Source: Nova Enterprise Blueprint, **Volume 2, Part D2** (entity design — the primary source for these definitions), **Part B1** (bounded context responsibilities), **Part C3** (endpoint names), cross-referenced with **Volume 1, Part D2** (fulfillment models) and **Volume 1, Appendix** (business-level glossary) where a Phase 1 term also has a business meaning worth aligning to.

Scope: only terms belonging to **Identity, Catalog, Cart & Checkout, and Orders** — Phase 1's four contexts ([00-bounded-contexts.md](00-bounded-contexts.md)). A term not listed here either belongs to a deferred context or isn't yet formally defined anywhere in the blueprint — in either case, don't guess at a definition; extend this file when that context's doc gets written.

**Purpose:** every term below should mean exactly one thing whether it appears in code (a class or table name), in this doc set, or in a conversation between engineers. If a PR or a Slack thread uses one of these words differently than defined here, that's a bug in the conversation, not a valid alternate meaning.

---

### Address

An `Identity`-owned entity belonging to a `User`. Referenced by ID from `Cart & Checkout` during checkout (address selection), never joined into directly. _(Vol 2, D2)_

### AuthFactor

An `Identity`-owned entity representing one way a `User` can prove their identity — password, OTP, social login, or passkey. A `User` has many. _(Vol 2, D2)_

### Cart

Belongs to a `User` or a guest `Session`; has many `CartLine`s. Exists and can be modified for an arbitrary length of time before a `Checkout Session` is ever created from it — a `Cart` is not itself a commitment to buy. _(Vol 2, D2)_

### CartLine

A single line item within a `Cart`, referencing one `Variant`. _(Vol 2, D2)_

### Category

Hierarchical, self-referencing (parent/child) grouping that a `Product` belongs to one or more of — supports the multi-tier navigation described in Volume 6. Owned by `Catalog`. _(Vol 2, D2)_

### Checkout Session

Created via `POST /v1/checkout/session`, capturing address, shipping option, and payment method selection for a specific `Cart` before an `Order` is created from it. Distinct from `Cart` — see `00-bounded-contexts.md` for why this doc treats it as its own table rather than extra `Cart` columns. Owned by `Cart & Checkout`. _(Vol 2, C3; entity existence inferred — not named explicitly in D2's prose)_

### Device

An `Identity`-owned entity — the hardware/browser a `Session` is bound to, contributing to device-fingerprint-based risk scoring (Volume 3). _(Vol 2, D2)_

### Idempotency Key

A client-generated key (proposed format: UUIDv4 — see `02-api-standards.md`) attached to a mutating request that may be retried (checkout, order creation, payment). The server guarantees a repeated key returns the original result without re-executing the operation. _(Vol 2, C2)_

### Marketplace Seller / Retail Partner

Two of Nova's inventory & fulfillment models, both live at launch: a **Marketplace Seller** is an independent third-party who lists, manages, and fulfills their own inventory through the Seller Portal; a **Retail Partner** is a curated brand/retail partner with closer integration, potentially including Nova-managed merchandising. Both are represented by the same `Seller` profile entity in `Identity`'s schema — the distinction is a business/operational one (how onboarding and merchandising work), not a separate data model. _(Vol 1, Part D, C2)_

### Media

An asset (image, etc.) attached to a `Product`. Owned by `Catalog`. _(Vol 2, D2)_

### Money

The shared structured monetary value type — `{ amount: string, currency: CurrencyCode }` in `@nova/types`, backed by `numeric(14,2)` + a currency code column in Postgres. Never a raw `number`. See `03-database-conventions.md` for the full rule; referenced constantly across `Cart & Checkout` and `Orders` (totals, line prices). _(Vol 2, D3; Vol 7, A2)_

### Order

Created from a successful `Checkout Session`. May contain multiple `Sub-Order`s (one per seller represented in the originating `Cart`). Has a strict state machine — see `Order State` below — enforced at the application layer, never treated as a free-text status column. Owned by `Orders`. _(Vol 2, D2)_

### Order State

One of exactly eight values, transitioned through by the `Orders` module's state machine: `placed → confirmed → packed → shipped → delivered → completed`, or `cancelled` / `returned` as terminal exception paths. No other status string is valid, and no code outside `Orders`' domain layer is permitted to write to an order's status directly (per the module contract — `01-module-contract.md`). _(Vol 2, D2)_

### Product

Owned by a `Seller` (referenced by ID, not joined — the `Seller` profile itself lives in `Identity`'s schema); has many `Variant`s; belongs to one or more `Category`; has many `Media` and `Review`s. Owned by `Catalog`. _(Vol 2, D2)_

### Review

Belongs to a `Product`; storage-owned by `Catalog`, but _moderation_ of a `Review` is a `Trust & Safety` responsibility (Phase 2+) exercised through `Catalog`'s public API or events — not a direct write to `Catalog`'s table. _(Vol 2, B1, D2)_

### Session

An `Identity`-owned entity representing one authenticated (or guest) browsing session, carrying the short-lived JWT / refresh-token pair described in `05-security-baseline.md`. A guest `Session` can own a `Cart` before the shopper ever creates a `User` account. _(Vol 2, D2)_

### SKU

> **Terminology note, flagged for your confirmation — not a direct blueprint definition.** The word "SKU" does not appear anywhere in Volume 2's entity design (Part D2); the blueprint's own term for "one specific purchasable size/color/configuration of a Product" is **`Variant`** (see below). This doc treats **SKU as the informal, industry-standard synonym for a `Variant`'s unique identifying code** (i.e., "SKU" = the human-readable/scannable code that identifies one `Variant` row) — a common enough usage that it's likely to show up in conversation and in seller-facing UI copy regardless of what the schema calls it internally. If Volume 6 (Seller Experience) or a future revision of Volume 2 defines "SKU" as something more specific (e.g. a seller-assigned code distinct from Nova's internal `Variant` ID), that definition should supersede this one and this entry should be updated accordingly.

### Sub-Order

One seller's portion of an `Order` — a single customer `Cart` can span multiple sellers, and each `Sub-Order` is fulfilled and paid out independently. Owned by `Orders`. _(Vol 2, D2)_

### User

One record per natural person — a customer, seller staff member, rider, or admin, distinguished by role assignment, not by separate tables. Has many `Session`s, `Device`s, and `AuthFactor`s; zero or one `Seller` profile; zero or one `Rider` profile (inert until `Logistics` ships in Phase 2+); many `Address`es. Owned by `Identity`. _(Vol 2, D2)_

### Variant

One specific purchasable configuration of a `Product` — size, color, etc. Referenced by `CartLine` and carries the price/stock information that `Cart & Checkout` and `Orders` both synchronously confirm against `Catalog` at the moments that matter (session creation, order creation — see `02-api-standards.md`'s worked example). Owned by `Catalog`. See also `SKU` above. _(Vol 2, D2)_
