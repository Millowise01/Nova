# API Standards

Source: Nova Enterprise Blueprint, **Volume 2, Part C2** (REST API standards), **Part C3** (representative endpoint spec), **Part C4** (rate limiting & abuse controls).

## URL structure & versioning (Vol 2, C2)

- All endpoints are versioned under `/v1/...` and never make a breaking change in place — a new version is introduced instead, with a published deprecation window.
- Resource-oriented, plural nouns: `/v1/products`, `/v1/orders`, `/v1/cart` (singular because there's exactly one active cart per session — see the worked example pattern below).
- Every endpoint declares its required permission scope, enforced centrally by the RBAC/ABAC engine (Vol 3, Part B) — **authorization logic never lives inside individual controllers.** A controller that contains an `if (user.role !== "admin")` check is a Definition-of-Done violation, not a style nit.

> **Proposed, not yet confirmed — deprecation window length:** Vol 2, C2 requires "a published deprecation window" but doesn't state a duration. Proposed default: **minimum 6 months** from the day `/v2/...` ships before `/v1/...` is removed, communicated via a `Sunset` HTTP header (RFC 8594) on every `/v1/` response once a successor version exists. Rationale: 6 months gives the mobile app store review cycle (Volume 1, Part D) enough headroom that a slow-to-update installed base isn't broken by a backend-only change.

## Pagination (Vol 2, C2)

> "Pagination is cursor-based for any list endpoint expected to grow unbounded (orders, products, audit logs); offset pagination is reserved for small, bounded result sets."

| Endpoint shape                                                         | Pagination   |
| ---------------------------------------------------------------------- | ------------ |
| Unbounded lists (`/v1/orders`, `/v1/products`, `/v1/admin/audit-logs`) | Cursor-based |
| Small, bounded lists (e.g. a user's saved addresses)                   | Offset-based |

> **Proposed, not yet confirmed — cursor format:** the blueprint mandates cursor pagination but not a wire format. Proposed default: an **opaque, base64url-encoded JSON envelope** — `{ "sortValue": <value of the last row's sort column>, "id": <last row's id> }` — returned as `nextCursor` in the response body and accepted as a `?cursor=` query param. Treating it as opaque (rather than a raw offset or exposed column value) means the underlying sort/index strategy can change later without breaking clients that only ever pass the cursor back verbatim.

```json
{
  "data": [/* ...rows... */],
  "pageInfo": {
    "nextCursor": "eyJzb3J0VmFsdWUiOiIyMDI2LTAxLTE1VDEwOjAwOjAwWiIsImlkIjoib3JkXzQ0MiJ9",
    "hasMore": true
  }
}
```

## Error response shape (Vol 2, C2)

> "Errors follow a single consistent contract: HTTP status code, a machine-readable error code, a human-readable message, and a correlation ID for support and audit traceability."

> **Proposed, not yet confirmed — exact JSON shape.** The blueprint names the four required fields but not their key names or nesting. Proposed:

```json
{
  "error": {
    "code": "ORDER_STOCK_UNAVAILABLE",
    "message": "One or more items in this order are no longer in stock.",
    "correlationId": "req_9f8e2a1b4c",
    "details": [{ "variantId": "var_8821", "requested": 3, "available": 1 }]
  }
}
```

`code` is `SCREAMING_SNAKE_CASE`, stable, and part of the versioned API contract (changing an existing code is a breaking change under the C2 rule above). `correlationId` matches the request's distributed trace correlation ID (Volume 7, Part E1) so a support agent or engineer can go from a customer-reported error straight to the trace, logs, and audit trail for that exact request. `details` is optional and error-specific — present when there's structured data a client can act on (e.g. highlighting the specific out-of-stock line item), omitted otherwise.

## Idempotency (Vol 2, C2)

> "Mutating requests that may be retried (checkout, payment, payout) require an `Idempotency-Key` header; the server guarantees the same result is returned for a repeated key without double-executing the operation."

This is not optional for the endpoints it applies to — a checkout or order-creation request submitted without an `Idempotency-Key` header is rejected with `400 IDEMPOTENCY_KEY_REQUIRED`, it does not silently proceed unprotected.

> **Proposed, not yet confirmed — key format and retention window.** Proposed: the client generates a **UUIDv4** per logical operation attempt (not per HTTP request — a client retrying the _same_ checkout attempt reuses the _same_ key; a genuinely new checkout generates a new one). The server stores `(idempotency_key, endpoint, request_body_hash) → response` for **24 hours**, matching the outbox/session-adjacent state Redis already holds per Vol 2, Part E1. A repeated key with a _different_ request body hash is a client bug, not a legitimate retry, and is rejected with `409 IDEMPOTENCY_KEY_CONFLICT` rather than silently returning the first response.

## Rate limiting & abuse controls (Vol 2, C4)

Two layers, not one:

| Layer               | Grain                      | Purpose                                                                        |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| Cloudflare (edge)   | IP / ASN                   | Coarse-grained volumetric abuse protection — never touches application code.   |
| Redis (application) | Per-account / per-endpoint | Fine-grained business rules — OTP requests, checkout attempts, search queries. |

"Limits are configuration-driven per endpoint class rather than hard-coded, so they can be tuned without a deployment" (Vol 2, C4) — a rate limit is a config value read at request time, not a constant compiled into the controller. Full bot protection and WAF configuration is Volume 3's scope, not this doc's (see [05-security-baseline.md](05-security-baseline.md) for what's in scope for Phase 1).

## Worked example: `POST /v1/orders`

Chosen from Vol 2, C3's representative endpoint table because it's the one endpoint in that list explicitly marked `JWT + Idempotency-Key` — it's the canonical example of everything above (versioning, auth, idempotency, error shape) in one place, and it's squarely a Phase 1 (Orders context) endpoint.

**Request**

```http
POST /v1/orders HTTP/1.1
Authorization: Bearer <jwt>
Idempotency-Key: 6b1f2e3a-0c9d-4e12-9a7b-1f5c8d2e4a11
Content-Type: application/json

{
  "checkoutSessionId": "chk_9f2a1b3c"
}
```

The request body is deliberately thin — everything about _what's_ being ordered (items, address, shipping, payment method) was already captured and validated when the `CheckoutSession` was created via `POST /v1/checkout/session` (Vol 2, C3). Creating an order from a checkout session ID, rather than re-submitting the full cart, is what makes retrying this exact request safe under the idempotency guarantee: the server has one immutable source of truth (the checkout session) for what the order should contain, so a duplicate request can't accidentally create an order with different contents than the original attempt.

**Success response — `201 Created`**

```json
{
  "data": {
    "id": "ord_7d3e1f2a",
    "status": "placed",
    "subOrders": [
      { "id": "sub_a1", "sellerId": "sel_442", "status": "placed" },
      { "id": "sub_a2", "sellerId": "sel_889", "status": "placed" }
    ],
    "total": { "amount": "184.50", "currency": "SLE" },
    "createdAt": "2026-08-05T10:00:00Z"
  }
}
```

(`total` uses the shared `Money` shape from `@nova/types` — see [03-database-conventions.md](03-database-conventions.md) for why `amount` is a string, not a number.)

**Retried request (same `Idempotency-Key`, same body)** → same `201` response replayed verbatim, order is **not** created a second time. Internally: the Orders module's public service (see [01-module-contract.md](01-module-contract.md)) checks the idempotency store before calling `OrderService.createFromCheckout`, and returns the stored response on a hit without re-executing domain logic.

**Failure — checkout session already consumed — `409 Conflict`**

```json
{
  "error": {
    "code": "CHECKOUT_SESSION_ALREADY_CONSUMED",
    "message": "This checkout session has already been used to create an order.",
    "correlationId": "req_a83f0c12"
  }
}
```

**Failure — stock changed between checkout and order creation — `409 Conflict`**

```json
{
  "error": {
    "code": "ORDER_STOCK_UNAVAILABLE",
    "message": "One or more items in this order are no longer in stock.",
    "correlationId": "req_bb219c4e",
    "details": [{ "variantId": "var_8821", "requested": 2, "available": 0 }]
  }
}
```

This second failure is the synchronous-call pattern from Vol 2, B3 in action: Cart & Checkout already confirmed price/stock with Catalog when the session was created, but Orders re-confirms via the same synchronous call at order-creation time, because time has passed and stock is one of the few things Nova can't treat as eventually-consistent at the point of an irreversible commitment (money changing hands).
