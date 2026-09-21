import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { OutboxRelayService } from "../../common/outbox/outbox-relay.service";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { drainOutbox as drainOutboxUntilEmpty } from "../../test-utils/drain-outbox";
import { promoteRole } from "../../test-utils/promote-role";

describe("Notifications (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let relay: OutboxRelayService;
  let sellerToken: string;
  let variantId: string;

  async function signUpAndPromote(prefix: string, roles: string[]) {
    const suffix = randomUUID().slice(0, 8);
    const email = `${prefix}-${suffix}@example.test`;
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: prefix,
        lastName: "Test",
        email,
        phone: `+2327${Math.floor(Math.random() * 900000 + 100000)}`,
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      });
    if (roles.length > 0) {
      await promoteRole(prisma, signup.body.data.user.id, ["customer", ...roles]);
      const relogin = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email, password: "correct-horse-battery-staple" });
      return {
        token: relogin.body.data.accessToken as string,
        userId: signup.body.data.user.id as string,
      };
    }
    return {
      token: signup.body.data.accessToken as string,
      userId: signup.body.data.user.id as string,
    };
  }

  /** Places one order for `buyerToken`, returns the created order body. */
  async function placeOrder(buyerToken: string, method: "card" | "wallet", quantity = 1) {
    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const cartId = cart.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${cartId}/lines`)
      .send({ variantId, quantity })
      .expect(201);

    const session = await request(app.getHttpServer())
      .post(`/v1/carts/${cartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district: "Western Area",
        phone: "+23276000000",
        deliveryMethod: "standard",
        paymentMethod: method,
      })
      .expect(201);

    return request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId: session.body.data.id });
  }

  /** Waits until every outbox event has been handled. See test-utils/drain-outbox.ts: the
   *  completion condition is "no unpublished rows remain", not "a poll returned 0" — the
   *  app's own background poll can hold rows in flight while a second call returns 0. */
  const drainOutbox = () => drainOutboxUntilEmpty({ relay, prisma });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);
    relay = app.get(OutboxRelayService);

    const seller = await signUpAndPromote("notif-seller", ["seller", "admin"]);
    sellerToken = seller.token;

    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "Notif Test", slug: `notif-cat-${suffix}` });

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Notif Test Product",
        slug: `notif-product-${suffix}`,
        variants: [
          {
            sku: `NOTIF-${suffix}`,
            name: "Default",
            priceAmount: "100.00",
            priceCurrency: "SLE",
            stockQuantity: 100,
          },
        ],
      });
    variantId = product.body.data.variants[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires auth for all notification routes", async () => {
    await request(app.getHttpServer()).get("/v1/notifications").expect(401);
    await request(app.getHttpServer()).patch(`/v1/notifications/${randomUUID()}/read`).expect(401);
    await request(app.getHttpServer()).patch("/v1/notifications/read-all").expect(401);
  });

  it("OrderPlaced creates an in-app notification for the buyer", async () => {
    const buyer = await signUpAndPromote("notif-orderplaced", []);
    const order = await placeOrder(buyer.token, "card");
    expect(order.status).toBe(201);

    await drainOutbox();

    const list = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);

    const orderPlaced = list.body.data.find((n: { type: string }) => n.type === "order.placed");
    expect(orderPlaced).toBeDefined();
    expect(orderPlaced.referenceType).toBe("Order");
    expect(orderPlaced.referenceId).toBe(order.body.data.id);
    expect(orderPlaced.readAt).toBeNull();
    expect(list.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it("a failed payment's OrderCancelled event creates a notification", async () => {
    const buyer = await signUpAndPromote("notif-cancelled", []);
    const order = await placeOrder(buyer.token, "wallet"); // insufficient balance -> cancelled
    expect(order.body.data.status).toBe("cancelled");

    await drainOutbox();

    const list = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);

    const cancelled = list.body.data.find((n: { type: string }) => n.type === "order.cancelled");
    expect(cancelled).toBeDefined();
    expect(cancelled.referenceId).toBe(order.body.data.id);
  });

  it("an executed refund (RefundExecuted) creates a notification — the real event, not the task brief's assumed 'RefundApproved'", async () => {
    const buyer = await signUpAndPromote("notif-refund-exec", []);
    const order = await placeOrder(buyer.token, "card");
    expect(order.status).toBe(201);

    const refund = await request(app.getHttpServer())
      .post("/v1/wallet/refunds")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        paymentIntentId: order.body.data.paymentIntentId,
        amount: "50.00",
        reason: "Customer request",
      })
      .expect(201);
    expect(refund.body.data.status).toBe("executed");

    await drainOutbox();

    const list = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);

    const executed = list.body.data.find((n: { type: string }) => n.type === "refund.executed");
    expect(executed).toBeDefined();
    expect(executed.referenceType).toBe("RefundRequest");
    expect(executed.referenceId).toBe(refund.body.data.id);
  });

  it("a rejected refund (RefundRejected) creates a notification — this event type didn't exist before this pass", async () => {
    const buyer = await signUpAndPromote("notif-refund-reject", []);
    const order = await placeOrder(buyer.token, "card", 6); // above the dual-auth threshold
    expect(order.status).toBe(201);

    const proposer = await signUpAndPromote("notif-reject-proposer", ["admin"]);
    const rejector = await signUpAndPromote("notif-reject-rejector", ["admin"]);

    const proposed = await request(app.getHttpServer())
      .post("/v1/wallet/refunds")
      .set("Authorization", `Bearer ${proposer.token}`)
      .send({
        paymentIntentId: order.body.data.paymentIntentId,
        amount: "600.00",
        reason: "Testing rejection",
      })
      .expect(201);

    const rejected = await request(app.getHttpServer())
      .patch(`/v1/wallet/refunds/${proposed.body.data.id}/reject`)
      .set("Authorization", `Bearer ${rejector.token}`)
      .send({ reason: "Not eligible" })
      .expect(200);
    expect(rejected.body.data.status).toBe("rejected");

    await drainOutbox();

    const list = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);

    const rejectedNotif = list.body.data.find(
      (n: { type: string }) => n.type === "refund.rejected",
    );
    expect(rejectedNotif).toBeDefined();
    expect(rejectedNotif.referenceId).toBe(proposed.body.data.id);

    const outboxRow = await prisma.outboxEvent.findFirst({
      where: {
        aggregateType: "RefundRequest",
        aggregateId: proposed.body.data.id,
        eventType: "RefundRejected",
      },
    });
    expect(outboxRow).not.toBeNull();
  });

  it("marks a single notification read, and read/unread state transitions correctly", async () => {
    const buyer = await signUpAndPromote("notif-markread", []);
    const order = await placeOrder(buyer.token, "card");
    expect(order.status).toBe(201);
    await drainOutbox();

    const before = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    const target = before.body.data[0];
    expect(target.readAt).toBeNull();
    expect(before.body.unreadCount).toBe(before.body.data.length);

    const marked = await request(app.getHttpServer())
      .patch(`/v1/notifications/${target.id}/read`)
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(marked.body.data.readAt).not.toBeNull();

    const after = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(after.body.unreadCount).toBe(before.body.unreadCount - 1);

    // Marking an already-read notification read again is a no-op, not an error.
    await request(app.getHttpServer())
      .patch(`/v1/notifications/${target.id}/read`)
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
  });

  it("marks all notifications read via read-all", async () => {
    const buyer = await signUpAndPromote("notif-readall", []);
    await placeOrder(buyer.token, "card");
    await placeOrder(buyer.token, "card");
    await drainOutbox();

    const before = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(before.body.unreadCount).toBeGreaterThanOrEqual(2);

    await request(app.getHttpServer())
      .patch("/v1/notifications/read-all")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);

    const after = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(after.body.unreadCount).toBe(0);
    expect(after.body.data.every((n: { readAt: string | null }) => n.readAt !== null)).toBe(true);
  });

  it("a user only ever sees their own notifications, and cannot mark someone else's as read", async () => {
    const ownerBuyer = await signUpAndPromote("notif-owner", []);
    const otherBuyer = await signUpAndPromote("notif-other", []);

    const order = await placeOrder(ownerBuyer.token, "card");
    expect(order.status).toBe(201);
    await drainOutbox();

    const ownerList = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${ownerBuyer.token}`)
      .expect(200);
    const ownedNotificationId = ownerList.body.data.find(
      (n: { referenceId: string }) => n.referenceId === order.body.data.id,
    ).id;

    const otherList = await request(app.getHttpServer())
      .get("/v1/notifications")
      .set("Authorization", `Bearer ${otherBuyer.token}`)
      .expect(200);
    expect(otherList.body.data.some((n: { id: string }) => n.id === ownedNotificationId)).toBe(
      false,
    );

    const forbidden = await request(app.getHttpServer())
      .patch(`/v1/notifications/${ownedNotificationId}/read`)
      .set("Authorization", `Bearer ${otherBuyer.token}`)
      .expect(403);
    expect(forbidden.body.error.code).toBe("NOTIFICATION_ACCESS_DENIED");
  });

  it("404s marking a nonexistent notification read", async () => {
    const buyer = await signUpAndPromote("notif-404", []);
    const response = await request(app.getHttpServer())
      .patch(`/v1/notifications/${randomUUID()}/read`)
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(404);
    expect(response.body.error.code).toBe("NOTIFICATION_NOT_FOUND");
  });
});
