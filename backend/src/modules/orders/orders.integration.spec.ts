import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";
import { uniqueTestPhone } from "../../test-utils/users";

describe("Orders (integration) — including idempotent checkout orchestration", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let buyerId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const suffix = randomUUID().slice(0, 8);
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: "Buyer",
        lastName: "Test",
        email: `buyer-${suffix}@example.test`,
        phone: uniqueTestPhone(),
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      });
    buyerToken = signup.body.data.accessToken;
    buyerId = signup.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  /** Full setup: seller + product + cart + line + checkout session, ready for POST /v1/orders. */
  async function setUpCheckoutSession(stockQuantity = 100, quantity = 2, ownerToken?: string) {
    // When an owner is given, the cart (and so the checkout session) belongs to that user.
    const asOwner = (req: request.Test) =>
      ownerToken ? req.set("Authorization", `Bearer ${ownerToken}`) : req;
    const suffix = randomUUID().slice(0, 8);
    const sellerEmail = `order-seller-${suffix}@example.test`;
    const seller = await request(app.getHttpServer()).post("/v1/auth/signup").send({
      firstName: "Seller",
      lastName: "Test",
      email: sellerEmail,
      phone: uniqueTestPhone(),
      password: "correct-horse-battery-staple",
      confirmPassword: "correct-horse-battery-staple",
    });
    await promoteRole(prisma, seller.body.data.user.id, ["customer", "seller", "admin"]);
    const sellerRelogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: sellerEmail, password: "correct-horse-battery-staple" });
    const sellerToken = sellerRelogin.body.data.accessToken;

    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "Order Test", slug: `order-cat-${suffix}` });

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Order Test Product",
        slug: `order-product-${suffix}`,
        variants: [
          {
            sku: `ORD-${suffix}`,
            name: "Default",
            priceAmount: "25.00",
            priceCurrency: "SLE",
            stockQuantity,
          },
        ],
      });
    const variantId = product.body.data.variants[0].id;

    const cart = await asOwner(request(app.getHttpServer()).post("/v1/cart")).expect(201);
    const cartId = cart.body.data.cartId;
    await asOwner(request(app.getHttpServer()).post(`/v1/cart/${cartId}/lines`))
      .send({ variantId, quantity })
      .expect(201);

    const session = await asOwner(
      request(app.getHttpServer()).post(`/v1/carts/${cartId}/checkout/session`),
    )
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "standard",
        // "card" (not "wallet") deliberately — routes through the always-succeeding
        // stub PSP adapter, not a real wallet balance the test buyer never funded.
        // Wallet-specific payment behavior (including insufficient-balance) is
        // covered by payments-wallet's own integration tests.
        paymentMethod: "card",
      })
      .expect(201);

    return { checkoutSessionId: session.body.data.id, sellerId: seller.body.data.user.id };
  }

  it("requires a bearer token", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession();
    const response = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(401);
    expect(response.body.error.code).toBe("MISSING_BEARER_TOKEN");
  });

  it("only the owner of a checkout session can turn it into an order", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession(100, 1, buyerToken);
    const suffix = randomUUID().slice(0, 8);
    const intruder = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: "Intruder",
        lastName: "Test",
        email: `intruder-${suffix}@example.test`,
        phone: uniqueTestPhone(),
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      });

    const denied = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${intruder.body.data.accessToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(403);
    expect(denied.body.error.code).toBe("CHECKOUT_SESSION_ACCESS_DENIED");

    // Nothing was consumed or created for the victim by the failed attempt...
    const session = await prisma.checkoutSession.findUnique({ where: { id: checkoutSessionId } });
    expect(session?.status).toBe("pending");
    expect(await prisma.order.count({ where: { userId: intruder.body.data.user.id } })).toBe(0);

    // ...and the real owner can still place the order.
    await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(201);
  });

  it("requires the Idempotency-Key header", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession();
    const response = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ checkoutSessionId })
      .expect(400);
    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
  });

  it(
    "creates an order, writes the OrderPlaced outbox event, and — this is the core " +
      "idempotency proof — a retried request with the same key does NOT create a second order",
    async () => {
      const { checkoutSessionId } = await setUpCheckoutSession();
      const idempotencyKey = randomUUID();

      const first = await request(app.getHttpServer())
        .post("/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .set("Idempotency-Key", idempotencyKey)
        .send({ checkoutSessionId })
        .expect(201);

      // "confirmed", not "placed" — the stub PSP adapter succeeds synchronously, so by
      // the time this response is returned the payment has already been processed and
      // Orders has already transitioned the order forward (backend/docs/09). "placed"
      // is now a transient, never-externally-observable intermediate state.
      expect(first.body.data.status).toBe("confirmed");
      expect(first.body.data.paymentIntentId).toEqual(expect.any(String));
      // 25.00 * 2 subtotal + 15.00 flat "standard" shipping stub (backend/src/modules/
      // cart-checkout/domain/pricing/) — no promo code applied.
      expect(first.body.data.total.amount).toBe("65.00");
      expect(first.body.data.subOrders).toHaveLength(1);

      // The outbox row — written in the same transaction as the Order (backend/docs/04).
      const outboxRow = await prisma.outboxEvent.findFirst({
        where: {
          aggregateType: "Order",
          aggregateId: first.body.data.id,
          eventType: "OrderPlaced",
        },
      });
      expect(outboxRow).not.toBeNull();
      expect((outboxRow?.payload as { total: { amount: string } }).total.amount).toBe("65.00");

      // THE RETRY — same key, same body. This is the actual proof, not just an assertion
      // about the mechanism: verify no duplicate Order was created in the database.
      const retry = await request(app.getHttpServer())
        .post("/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .set("Idempotency-Key", idempotencyKey)
        .send({ checkoutSessionId })
        .expect(201);

      expect(retry.body).toEqual(first.body); // byte-for-byte identical response

      const ordersForSession = await prisma.order.findMany({ where: { checkoutSessionId } });
      expect(ordersForSession).toHaveLength(1); // NOT 2 — the actual idempotency proof

      const outboxRowsForOrder = await prisma.outboxEvent.findMany({
        where: { aggregateType: "Order", aggregateId: first.body.data.id },
      });
      expect(outboxRowsForOrder).toHaveLength(1); // the retry didn't publish a second event either
    },
  );

  it("rejects reusing the same Idempotency-Key for a genuinely different request body", async () => {
    const session1 = await setUpCheckoutSession();
    const session2 = await setUpCheckoutSession();
    const idempotencyKey = randomUUID();

    await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", idempotencyKey)
      .send({ checkoutSessionId: session1.checkoutSessionId })
      .expect(201);

    const conflict = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", idempotencyKey)
      .send({ checkoutSessionId: session2.checkoutSessionId })
      .expect(409);
    expect(conflict.body.error.code).toBe("IDEMPOTENCY_KEY_CONFLICT");
  });

  it("rejects creating a second order from an already-consumed checkout session under a DIFFERENT idempotency key", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession();

    await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID()) // a genuinely different key — not a retry
      .send({ checkoutSessionId })
      .expect(409);
    expect(response.body.error.code).toBe("CHECKOUT_SESSION_ALREADY_CONSUMED");
  });

  it("rejects order creation when stock is insufficient, re-confirmed synchronously against Catalog", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession(1, 5); // only 1 in stock, cart has 5

    const response = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(400);
    expect(response.body.error.code).toBe("ORDER_STOCK_UNAVAILABLE");
  });

  it("enforces the order state machine: a placed order can be cancelled once, not twice", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession();
    const created = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(201);
    const orderId = created.body.data.id;

    const cancelled = await request(app.getHttpServer())
      .patch(`/v1/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ reason: "Changed my mind" })
      .expect(200);
    expect(cancelled.body.data.status).toBe("cancelled");

    const secondCancel = await request(app.getHttpServer())
      .patch(`/v1/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({})
      .expect(400);
    expect(secondCancel.body.error.code).toBe("ORDER_NOT_CANCELLABLE");

    const cancelEvent = await prisma.outboxEvent.findFirst({
      where: { aggregateType: "Order", aggregateId: orderId, eventType: "OrderCancelled" },
    });
    expect(cancelEvent).not.toBeNull();
  });

  it("lists order history for the authenticated user only", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession();
    await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(201);

    const history = await request(app.getHttpServer())
      .get("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .expect(200);

    expect(history.body.data.length).toBeGreaterThan(0);
    for (const order of history.body.data) {
      expect(order.userId).toBe(buyerId);
    }
  });

  it(
    "rejects a different customer from reading or cancelling this order — proves the " +
      "ABAC condition (order.userId === requester.id), not just that SOME auth is present",
    async () => {
      const { checkoutSessionId } = await setUpCheckoutSession();
      const created = await request(app.getHttpServer())
        .post("/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .set("Idempotency-Key", randomUUID())
        .send({ checkoutSessionId })
        .expect(201);
      const orderId = created.body.data.id;

      const otherSuffix = randomUUID().slice(0, 8);
      const otherCustomer = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send({
          firstName: "Other",
          lastName: "Customer",
          email: `other-customer-${otherSuffix}@example.test`,
          phone: uniqueTestPhone(),
          password: "correct-horse-battery-staple",
          confirmPassword: "correct-horse-battery-staple",
        });
      const otherToken = otherCustomer.body.data.accessToken;

      const readAttempt = await request(app.getHttpServer())
        .get(`/v1/orders/${orderId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .expect(403);
      expect(readAttempt.body.error.code).toBe("ORDER_ACCESS_DENIED");

      const cancelAttempt = await request(app.getHttpServer())
        .patch(`/v1/orders/${orderId}/cancel`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({})
        .expect(403);
      expect(cancelAttempt.body.error.code).toBe("ORDER_ACCESS_DENIED");

      // The actual owner can still read/cancel it fine — this isn't a broken order.
      await request(app.getHttpServer())
        .get(`/v1/orders/${orderId}`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .expect(200);
    },
  );

  it("writes audit log entries for order creation and cancellation with the correct actor/target/correlationId", async () => {
    const { checkoutSessionId } = await setUpCheckoutSession();
    const created = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId })
      .expect(201);
    const orderId = created.body.data.id;

    const createLog = await prisma.auditLog.findFirst({
      where: { action: "order.create", targetId: orderId },
    });
    expect(createLog).not.toBeNull();
    expect(createLog?.actorId).toBe(buyerId);
    expect(createLog?.correlationId).toEqual(expect.any(String));
    expect(createLog?.occurredAt).toBeInstanceOf(Date); // server-generated, never client-supplied

    await request(app.getHttpServer())
      .patch(`/v1/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({ reason: "Testing audit trail" })
      .expect(200);

    const cancelLog = await prisma.auditLog.findFirst({
      where: { action: "order.cancel", targetId: orderId },
    });
    expect(cancelLog).not.toBeNull();
    expect(cancelLog?.actorId).toBe(buyerId);
    expect(cancelLog?.reason).toBe("Testing audit trail");
  });
});
