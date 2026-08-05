# Payments & Wallet — Design

Source: Nova Enterprise Blueprint, **Volume 5 — Payments, Wallet & Logistics, Parts A–C** (Part D, Seller Settlement & Payouts, and Part E, Delivery & Logistics, are explicitly out of scope here — see [Scope](#scope) below), cross-referenced with **Volume 2, Part B1/D2** (this context's entity ownership) and **Volume 3, Part B4** (dual authorization).

## Scope

Per `backend/docs/00-bounded-contexts.md`, the **Payments & Wallet** bounded context owns: "Payment intents, PSP adapters, refunds, wallet ledger entries, settlement, reconciliation." This pass builds **PaymentIntent, WalletAccount, WalletLedgerEntry, and refunds** — the pieces Volume 5, Parts A–C actually specify in enough detail to implement now. Two things Vol 5 describes are explicitly **not** built this pass, because they belong to a different bounded context per Vol 2's own split, not because they're unimportant:

- **Settlement & seller payouts** (Vol 5, Part D) — `SellerPayout` and the double-entry `LedgerAccount`/`LedgerEntry` model are **Finance**'s entities (`backend/docs/00-bounded-contexts.md`: "Finance: Double-entry ledger accounts and entries, fees, taxes, invoices, **seller payouts**"), not Payments & Wallet's. Finance wasn't the context selected for this pass.
- **Delivery & Logistics** (Vol 5, Part E) — a separate bounded context entirely, not selected for this pass.
- **Reconciliation** (Vol 5, A2's "Reconcile" adapter responsibility, and Part D4's COD reconciliation) — D4's COD reconciliation needs Logistics (out of scope); the daily-reconciliation-job half of A2 needs a real PSP settlement report to reconcile against, which doesn't exist while the PSP adapter is stubbed. Deferred until both exist.

## PSP integration — stubbed, per the confirmed decision

Volume 5, Part A2 specifies a `PaymentProvider` adapter interface (initiate / confirm / refund / reconcile) so "adding a new provider is a configuration and adapter-implementation exercise, not a change to checkout, order, or ledger logic." This pass implements that interface and **one stub adapter** behind it — no real Orange Money, Afrimoney, or card-PSP integration, matching Phase 1's OTP-stub pattern exactly (a real, working `TODO`-marked integration point, not a fake success path with no seam to plug a real provider into later).

## Payment methods (Vol 5, A1) — reconciled against what's already shipped

Vol 5, A1 specifies five launch methods: Orange Money, Afrimoney, Card, Cash on Delivery, Nova Wallet. The **already-shipped, tested** `checkoutSchema` in `@nova/validation` (Phase 1, consumed by the real `CheckoutFlow` component in `apps/web`) only offers three: `"wallet" | "card" | "mobile-money"` — no Orange-vs-Afrimoney distinction, and no COD option at all.

> **Scope decision, disclosed rather than silently picked either way.** Changing `checkoutSchema`'s enum to match Vol 5 exactly would mean modifying an already-shipped, tested Phase 1 schema and its real frontend form — out of proportion for a backend-only pass, and the kind of change that should be deliberate, not a side effect of building Payments & Wallet. This pass implements `PaymentIntent.method` against the **existing** three-value enum, not Vol 5's five. Two consequences, both worth confirming rather than assuming:
>
> - **Orange Money and Afrimoney are not distinguished** — `"mobile-money"` is routed through one generic stub adapter. Fine while the adapter is stubbed (nothing behaves differently per-provider yet); becomes a real question the moment a real integration is built, since Orange and Afrimoney are genuinely different APIs.
> - **Cash on Delivery is not implemented this pass** — it isn't a selectable `checkoutSchema` option today, so there's no checkout flow that would ever produce a COD order to process. Vol 5, B4's COD flow is fully specified in this doc's citations above for when it's added, but no code exists for it.

| Method           | This pass                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"card"`         | Routed through the stub `PaymentProviderAdapter` (Vol 3, J1's tokenization requirement is inherent to the adapter boundary — Nova's backend never receives raw card fields at any point, stub or real). |
| `"mobile-money"` | Routed through the same stub `PaymentProviderAdapter` — represents Orange Money and Afrimoney undifferentiated, per the scope decision above.                                                           |
| `"wallet"`       | **Real, no adapter** — a wallet payment is a direct ledger debit, nothing external to call.                                                                                                             |
| Cash on Delivery | **Not implemented this pass** — not a `checkoutSchema` option today.                                                                                                                                    |

## PaymentIntent state machine (Vol 5, B1)

> "pending → processing → succeeded/failed → (optionally) refunded. Every transition is idempotent and tied to the Idempotency-Key convention... so a customer's retried tap, a flaky network, or a duplicated webhook never results in a double-charge or a double-fulfilled order."

Created in **the same transaction as the Order itself** (see [Cross-module wiring](#cross-module-wiring--the-direction-matters) below) — the `Idempotency-Key` on `POST /v1/orders` already covers this whole transaction, so no separate idempotency key is needed for intent creation specifically.

```text
pending --[adapter.initiate() returns pending]--> processing
processing --[adapter confirms success]--> succeeded
processing --[adapter confirms failure]--> failed
succeeded --[refund issued]--> refunded
```

`failed` and `refunded` are terminal. A `pending` PaymentIntent that never resolves is exactly the "indefinite pending state without a resolution path" Vol 5, B2 says must never happen — the stub adapter always resolves synchronously (no genuinely-indefinite-pending state is reachable this pass), and the real webhook-driven confirmation path (Vol 5, B2's bounded-polling-fallback requirement) is left as a documented gap for when a real adapter exists, not silently assumed solved.

## Wallet (Vol 5, C1–C3)

> "Balances are always derived from immutable, append-only ledger entries, never stored and mutated as a mutable number. This is a deliberate, non-negotiable continuation of the financial-integrity rule established across Volumes 2 and 3."

Same pattern already established for `IdempotencyKey`/`AuditLog`/`OutboxEvent` in this codebase — an append-only table, balance computed by `SUM()`, never a `balance` column anyone writes to directly. One `WalletAccount` per `User` (customer) or `Seller`; `WalletLedgerEntry` rows for refund credits, cashback, store credit — **not** cashback/loyalty accrual logic itself (that depends on the Marketing campaign engine, Phase 3+, out of scope) — this pass implements the ledger mechanism, wallet-as-payment-method debits, and the refund-to-wallet credit path, the wallet-crediting/debiting flows Vol 5, Parts A–C fully specify.

### No peer-to-peer transfers (Vol 5, C3) — an architectural exclusion, not a missing feature

> "This boundary is enforced at the application layer... not left as an unimplemented feature that could be added casually later."

There is no endpoint, service method, or code path anywhere in this module that moves a ledger entry from one `WalletAccount` to another. The only ways a `WalletLedgerEntry` is created are: a refund credit, or a checkout debit (both this module). Enforced by omission — the same technique used for cross-module table boundaries — rather than a runtime check, because the correct way to guarantee a capability doesn't exist is to not write the code for it, not to write it and then block it.

## Refunds — where dual authorization actually becomes real

`backend/docs/08-security-implementation-checklist.md` deferred dual authorization entirely: _"no sensitive financial operation exists yet."_ That's no longer true the moment this module exists — Vol 3, B4 names "refunds above a configured threshold" specifically, and Vol 5, C2 confirms wallet refunds are a real, in-scope flow. This pass implements it for real, not as another deferred line item.

- Refund requests **at or below** the threshold: proposer's action executes immediately (single-actor authority, matching Vol 3, B4's "configured approval chain... set by risk tier" — a low-risk refund doesn't need a committee).
- Refund requests **above** the threshold: `RefundRequest` created in `proposed` status; a **second, different** actor with the appropriate role must approve before the wallet credit executes. Neither step is skippable — there is no code path that lets the proposer also approve their own request.
- Every step (propose, approve, reject, execute) is audit-logged (Vol 3, E1 — already-built `AuditLogger`, reused here, not reinvented).

> **Proposed, not yet confirmed — the threshold amount.** Vol 3, B4 says "a configured value threshold" without a number, and Vol 5 doesn't specify one either. Proposed: **NLe 500** (roughly the order-of-magnitude of a typical order per Vol 1's GMV/order-count figures — Year 1 GMV $150K over 5,000 orders is an average order value around $30, i.e. roughly NLe 690 at the blueprint's implied exchange rate; NLe 500 sits comfortably below a typical order so most legitimate single-order refunds still complete same-day via a lone approver, while anything larger gets the second-actor check). This is a business/risk decision, not an engineering one — flagged for confirmation, implemented as a single config constant so changing it later is a one-line edit, not a code change.

> **Proposed, not yet confirmed — the approver role.** Vol 3, B3's worked example uses a "Finance approver" role that doesn't exist in this codebase's role model yet (`customer` | `seller` | `admin`). Proposed: `admin` is the approver for this pass, rather than introducing a new `finance` role for one operation — a dedicated Finance role is a real Vol 1, G2 role category, but modeling it properly (with its own scoped permissions beyond just refund approval) belongs with the Finance module itself, not bolted on here for a single use case.

## Entities (Prisma, this pass)

Following `backend/docs/03-database-conventions.md`'s conventions exactly (soft delete, audit columns, `country_code`, Money as `numeric(14,2)` + currency, no cross-module `@relation`):

| Table                   | Purpose                                                                                                                                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wallet_accounts`       | One per `User`/`Seller` (opaque `ownerId` — could be either, no FK).                                                                                                                                                                                        |
| `wallet_ledger_entries` | Append-only. `walletAccountId` (real `@relation`, same module), `amount`/`currency` (signed — positive = credit), `type` (`refund_credit` \| `checkout_debit` \| ...), `referenceType`/`referenceId` (what caused this entry — an order, a refund request). |
| `payment_intents`       | `orderId` (opaque, Orders-owned), `method`, `status`, `amount`/`currency`, `providerReference` (nullable — populated by a real adapter later).                                                                                                              |
| `refund_requests`       | `paymentIntentId` (same-module `@relation`), `amount`/`currency`, `status` (`proposed` \| `approved` \| `rejected` \| `executed`), `proposedBy`/`approvedBy` (opaque `User` references — never the same actor).                                             |

## Cross-module wiring — the direction matters

A first design pass had Orders call into Payments & Wallet to create a `PaymentIntent`, and Payments & Wallet call back into Orders on success/failure — a circular module dependency, caught before implementation, not after. The corrected, one-directional design:

- **Orders → Payments & Wallet, one direction only.** Inside the same `$transaction` that creates the `Order`/`SubOrder`s (`backend/docs/02`'s idempotent `POST /v1/orders`), Orders calls `PaymentsWalletPublicService.processPaymentForOrder(tx, {...})`, passing the Prisma transaction client through — the exact same pattern already established for `CartCheckoutPublicService.tryConsumeSession(tx, ...)`. This method creates the `PaymentIntent`, runs it through the (stub) adapter or wallet debit, and returns `{ succeeded: boolean }`.
- **Orders decides its own status — no callback.** Based on that boolean, Orders sets `order.status` to `confirmed` or `cancelled` **itself**, inline, in the same transaction — Payments & Wallet never touches the `orders` table and never needs to know Orders' state machine exists.
- **Outbox**: `PaymentSucceeded`/`PaymentFailed`/`RefundExecuted` events written to the same `outbox_events` table, same pattern as `OrderPlaced` — no new mechanism.

This keeps the dependency graph a DAG (Cart & Checkout → Catalog; Orders → Cart & Checkout, Catalog, **and now Payments & Wallet**) — nothing Payments & Wallet depends on ever depends back on Payments & Wallet.

**A documented limitation this creates**: because payment processing happens synchronously inside the order-creation transaction, it only works because the stub adapter resolves instantly, in-process. A real PSP integration doing actual network I/O inside a held database transaction would be bad practice (long lock hold times) — when a real adapter is built, this synchronous-inside-the-transaction design needs revisiting (likely: create the `Order` and a `pending` `PaymentIntent` in one transaction, then process the payment asynchronously afterward, with Orders' status update happening via an event rather than inline). Flagged here so it isn't mistaken for a permanent decision.

## Known risks in this area for Nova specifically

- **The refund threshold and approver role are guesses pending your confirmation** — using either for anything beyond local testing before that confirmation would be wrong.
- **The stub adapter can never actually fail in a way that exercises the real webhook/polling reconciliation path** Vol 5, B2 requires — that gap stays open until a real PSP is integrated, and is exactly the kind of thing that's easy to forget is still stubbed once the rest of the system around it looks finished.
- **The synchronous-inside-transaction payment processing design is stub-adapter-only**, documented above — don't carry it forward unexamined once a real PSP exists.
- **Settlement/payouts (Finance) and COD reconciliation (Logistics) are real, named Vol 5 requirements with no home yet** — a customer refund can be issued, but a seller has no way to actually get paid out through this pass alone. That's Finance's job, not a gap in this module.
