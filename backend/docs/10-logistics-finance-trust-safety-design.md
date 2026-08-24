# Logistics, Finance, Trust & Safety — Design

Source: Nova Enterprise Blueprint, **Volume 5, Part E** (Delivery & Logistics), **Volume 5, Part D** (Settlement & Seller Payouts), **Volume 3, Part B4** (dual authorization), **Volume 3, Part F** (fraud, KYC, disputes) — cross-referenced with `backend/docs/00-bounded-contexts.md`'s entity ownership for all three contexts.

## Scope, per context

### Logistics

Owns `DeliveryZone`, `DeliveryJob`, `ProofOfDelivery`, `CODReconciliation` (`backend/docs/00`). This pass builds the first three. **`CODReconciliation` is explicitly not built this pass** — for the identical reason Cash on Delivery itself isn't in `09-payments-wallet-design.md`: `checkoutSchema`'s `paymentMethod` enum has no COD option, so no code path can ever produce a COD order to reconcile against. Building a reconciliation table with nothing that can ever populate it would be an untestable stub, not a real feature — deferred until COD payment is added (a `checkoutSchema` change, out of proportion for this pass per the same precedent).

**Dispatch, routing, and rider-matching algorithms are out of scope.** `DeliveryJob` assignment is an explicit admin/seller action (`POST /logistics/delivery-jobs {subOrderId, riderId}`), not automatic — Vol 5, Part E names "dispatch" and "routing" as real capabilities, but neither is specified in enough detail to implement, and faking an assignment algorithm (e.g. "nearest rider") would mean inventing business logic the blueprint doesn't give, the same reasoning `08-security-implementation-checklist.md` uses to defer fraud-scoring tiers.

**Replaces the checkout shipping-fee stub.** `CheckoutService`'s `LogisticsFeeZoneLookup` seam (`backend/src/modules/cart-checkout/domain/pricing/`) is now backed by a real `DeliveryZone` lookup keyed on district — when no zone row matches a district, it falls back to the same flat rates the stub used (pickup/standard/express), so an unseeded district degrades gracefully instead of breaking checkout. No per-district rates are seeded with invented numbers — Vol 5 doesn't specify real Sierra Leone district fee data, so the table starts empty and an admin populates it for real, rather than the code guessing at business data.

### Finance

Owns `LedgerAccount`, `LedgerEntry`, `SellerPayout` (`backend/docs/00`). All three built this pass — this is where Vol 3, E2's deferred "immutable financial ledger" requirement becomes real, and where `SellerPayout` closes the "payouts" item `08-security-implementation-checklist.md` left in its dual-authorization table.

> **Scope boundary, disclosed rather than silently assumed.** There is no commission-percentage, fee-schedule, or "seller's available balance" calculation anywhere in this pass, because no Nova document read so far specifies one. `proposeSellerPayout` accepts a requested amount directly from the proposer — exactly how `proposeRefund` (`payments-wallet/domain/refunds.service.ts`) already accepts an arbitrary amount rather than deriving one — not validated against any computed "this seller has earned N so far" figure. Wiring `LedgerEntry` postings to real Order commission math is real future work, blocked on a business decision (the commission rate) this pass doesn't have and won't guess at.

**Chart of accounts is minimal and code-defined**, not admin-managed: `seller_payable`, `platform_cash` — the two accounts a payout actually touches. Revenue/commission/tax accounts named in `00-bounded-contexts.md` aren't created because nothing in this pass posts to them (no commission math — see above); adding them with no entries ever posted would be schema for its own sake.

**Dual authorization**, mirroring `refunds.service.ts` exactly: propose/approve, self-approval blocked, admin-only (matching the refund approver-role precedent in `09-payments-wallet-design.md` — no dedicated `finance` role exists yet).

> **Proposed, not yet confirmed — payout dual-auth threshold.** Same NLe 500 constant as the refund threshold, and the identical caveat applies: Vol 3, B4 gives no number, and no real payout-volume data exists yet to derive one from. Reusing the refund figure means most real seller payouts (typically larger than a single order) will require the second approver by default — the conservative direction to guess in, not the permissive one.

### Trust & Safety

Owns `KYCSubmission`, `Dispute`, `DisputeEvent`, `AuditLog` (`AuditLog` already built in Phase 1 — see `05-security-baseline.md`). This pass builds `KYCSubmission`, `Dispute`, `DisputeEvent`.

**`KYCSubmission` is where "seller approval" (Vol 3, B4) becomes real.** No document review, no OCR, no third-party verification service — `documentReference` is a plain string (a reference the seller provides), stubbed the same way OTP delivery and the PSP adapter are: a real, working integration point with nothing behind it yet, not a fake pass. Decision is dual-authorized: **every** KYC decision needs a second, different admin — Vol 3, B4 names "seller approval/suspension" without a value threshold (unlike refunds/payouts), so unlike those, there's no at-or-below-threshold single-actor path here at all.

**Seller suspension**, the other named half of that same B4 item: a minimal `User.sellerSuspended` boolean (Identity), toggled through the identical propose/confirm dual-auth pattern, checked by Catalog's `createProduct` (a suspended seller can't list new products; existing listings aren't touched — de-listing them is a Catalog-side moderation action this pass doesn't build). This is the one place this pass reaches outside Trust & Safety's own schema, and does so through each owning module's existing surface (a new column Identity owns, a check Catalog already had a place to add), not a direct cross-module table write.

**`Dispute`/`DisputeEvent` are not dual-authorized** — Vol 3, B4's list names refunds, payouts, role changes, and seller approval/suspension specifically; opening or updating a dispute isn't on that list. A `Dispute` references an `Order` (opaque `orderId`) or a `Review` (opaque `reviewId`) — exactly one of the two, never both — and `DisputeEvent` is its append-only timeline (opened, commented, status-changed, resolved), the same append-only-audit-trail shape as `AuditLog` and `WalletLedgerEntry`, applied to a non-financial domain.

**Fraud scoring, velocity checks, and the human review queue remain deferred** — unchanged from `08-security-implementation-checklist.md`'s existing position; nothing in this pass touches that.

## Cross-module wiring

- **Logistics is a leaf module — it imports nothing from Orders.** The design originally called for `DeliveryJob.subOrderId` to be validated synchronously against Orders on assignment (Vol 2, B3's "caller needs an immediate answer" rule), the same way most cross-module opaque references in this codebase are checked. That's **not implemented**, and the reason is structural, not an oversight: Cart & Checkout needs to depend on Logistics (for the real shipping-fee lookup, next point), and Orders already depends on Cart & Checkout — so Logistics depending on Orders too would close a cycle (Cart & Checkout → Logistics → Orders → Cart & Checkout). Logistics stays dependency-free, the same DAG tier as Catalog and Payments & Wallet, and `assign()` accepts `subOrderId` as an unvalidated opaque value instead — disclosed in `delivery-job.service.ts`'s own comment, not silently accepted. A wrong `subOrderId` produces a working-but-orphaned `DeliveryJob`, not a 404. Fixing this for real needs an async mechanism (e.g. Logistics subscribing to `OrderPlaced` to learn which `subOrderId`s are real) that doesn't create the same cycle — left as documented future work, not guessed at here.
- **Cart & Checkout → Logistics, one direction.** `cart-checkout.module.ts` swaps `StubLogisticsFeeZoneLookup` for Logistics' real `RealLogisticsFeeZoneLookup` — the "ONE line that changes" the stub's own doc comment predicted. Logistics does not depend on Cart & Checkout.
- **Finance's `SellerPayout` and Trust & Safety's `KYCSubmission`/suspension are standalone** — no other module calls into them yet, and they call no other module's tables directly (Identity's `sellerSuspended` column is Identity's own schema, written through Identity's own service, not reached into from Trust & Safety).

## Entities (Prisma, this pass)

Following `backend/docs/03-database-conventions.md` exactly (soft delete, audit columns, `country_code`, Money as `numeric(14,2)` + currency, no cross-module `@relation`):

| Table                | Purpose                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `delivery_zones`     | `district` (unique), flat `standardFeeAmount`/`expressFeeAmount`/currency — admin-managed, starts empty.                                                       |
| `delivery_jobs`      | `subOrderId`/`riderId` (opaque), `deliveryZoneId` (same-module `@relation`, nullable), `status` (`assigned`→`picked_up`→`in_transit`→`delivered`/`failed`).    |
| `proofs_of_delivery` | `deliveryJobId` (same-module `@relation`), recipient name, note, `deliveredAt`.                                                                                |
| `ledger_accounts`    | Code-seeded: `seller_payable`, `platform_cash`.                                                                                                                |
| `ledger_entries`     | Append-only. `ledgerAccountId` (same-module `@relation`), `debitAmount`/`creditAmount` (one always `0.00`), `referenceType`/`referenceId`.                     |
| `seller_payouts`     | `sellerId` (opaque), `amount`/`currency`, `status` (`proposed`\|`approved`\|`rejected`\|`executed`), `proposedBy`/`approvedBy` (opaque, never the same actor). |
| `kyc_submissions`    | `subjectId` (opaque `User.id`), `subjectType` (`seller`\|`rider`), `documentReference`, `status`, `reviewProposedBy`/`reviewConfirmedBy`.                      |
| `disputes`           | Exactly one of `orderId`/`reviewId` set (opaque), `openedBy`, `status` (`open`\|`resolved`\|`closed`).                                                         |
| `dispute_events`     | `disputeId` (same-module `@relation`), `actorId`, `eventType`, `note`.                                                                                         |

## Implementation Report

All three contexts are built and verified — real integration tests against a real dockerized Postgres, no mocks (19 new tests across the three modules: 7 Logistics, 6 Finance, 6 Trust & Safety), plus the full pre-existing suite still green after wiring them in.

| Piece                                                | Status                           | Key evidence                                                                                                                                                                                                |
| ---------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DeliveryZone`/`DeliveryJob`/`ProofOfDelivery`       | Implemented                      | Full assign→pickup→in-transit→deliver lifecycle test, illegal-transition rejection, ABAC (only the assigned rider or admin), duplicate-assignment rejection.                                                |
| Real shipping-fee lookup replacing the checkout stub | Implemented                      | A dedicated test creates a `DeliveryZone` and proves checkout's `shippingFeeAmount` reflects the real rate, not the flat fallback — and a second test proves an unseeded district still falls back cleanly. |
| `LedgerAccount`/`LedgerEntry` double-entry           | Implemented                      | A test posts a payout and asserts the debit and credit sides of `seller_payable`/`platform_cash` moved by the identical amount.                                                                             |
| `SellerPayout` dual authorization                    | Implemented                      | At-or-below-threshold single-actor execution; above-threshold requires a second, different admin; self-approval blocked; rejection tested.                                                                  |
| `KYCSubmission` dual authorization (no threshold)    | Implemented                      | Propose/confirm by two different admins; self-confirmation blocked; reject path tested.                                                                                                                     |
| Seller suspension, enforced by Catalog               | Implemented                      | Confirmed suspension blocks `POST /v1/products` with `SELLER_SUSPENDED`; reinstatement (same dual-auth flow) restores it — proven against a real product-creation call, not just the flag.                  |
| `Dispute`/`DisputeEvent`                             | Implemented                      | Open/read/comment ABAC (opener or admin only); resolve is admin-only via CASL's `manage` action; invalid target combinations (neither/both of orderId/reviewId) rejected.                                   |
| `CODReconciliation`                                  | Not built                        | No COD payment method exists to reconcile against — see Scope above.                                                                                                                                        |
| Commission-rate-driven ledger postings from Orders   | Not built                        | No commission percentage is specified anywhere in the blueprint read so far — see Finance's Scope Boundary note.                                                                                            |
| `subOrderId` validation on delivery-job assignment   | Not built (disclosed limitation) | Would require Logistics to depend on Orders, closing a cycle with Cart & Checkout — see Cross-module wiring above.                                                                                          |

## Known risks in this area for Nova specifically

- **The payout threshold is a guess, same as the refund threshold it's copied from** — don't treat either as final without real business confirmation.
- **No commission math exists anywhere** — a `SellerPayout` can be proposed for any amount; nothing in this system currently checks it against what a seller has actually earned. This is a real gap until Orders-to-Finance revenue posting is built, which needs a commission-rate decision this pass doesn't have.
- **`CODReconciliation` has no home yet**, same as COD payment itself — both wait on the same `checkoutSchema` change.
- **Dispatch/routing is entirely manual (admin-assigned)** — there is no "suggest a rider" capability, and Vol 5, Part E's fuller dispatch/routing vision isn't represented here at all, just the state machine a real dispatch system would drive.
