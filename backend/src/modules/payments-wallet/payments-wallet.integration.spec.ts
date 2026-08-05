import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Payments & Wallet (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
      return { token: relogin.body.data.accessToken, userId: signup.body.data.user.id };
    }
    return { token: signup.body.data.accessToken, userId: signup.body.data.user.id };
  }

  /** Places one order for `buyerToken` with the given payment method, returns the
   *  created order body (including its paymentIntentId). */
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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const seller = await signUpAndPromote("pw-seller", ["seller", "admin"]);
    sellerToken = seller.token;

    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({ name: "PW Test", slug: `pw-cat-${suffix}` });

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "PW Test Product",
        slug: `pw-product-${suffix}`,
        variants: [
          {
            sku: `PW-${suffix}`,
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

  it("a fresh user's wallet balance is 0.00", async () => {
    const buyer = await signUpAndPromote("balance-check", []);
    const response = await request(app.getHttpServer())
      .get("/v1/wallet/balance")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(response.body.data.amount).toBe("0.00");
    expect(response.body.data.currency).toBe("SLE");
  });

  it("a card payment succeeds via the stub adapter, confirming the order", async () => {
    const buyer = await signUpAndPromote("card-buyer", []);
    const order = await placeOrder(buyer.token, "card");
    expect(order.status).toBe(201);
    expect(order.body.data.status).toBe("confirmed");

    const intent = await prisma.paymentIntent.findUniqueOrThrow({
      where: { id: order.body.data.paymentIntentId },
    });
    expect(intent.status).toBe("succeeded");
    expect(intent.method).toBe("card");
  });

  it("a wallet payment with insufficient balance fails cleanly, cancelling the order — not crashing it", async () => {
    const buyer = await signUpAndPromote("poor-buyer", []);
    const order = await placeOrder(buyer.token, "wallet");

    expect(order.status).toBe(201);
    expect(order.body.data.status).toBe("cancelled");
    const intent = await prisma.paymentIntent.findUniqueOrThrow({
      where: { id: order.body.data.paymentIntentId },
    });
    expect(intent.status).toBe("failed");

    const cancelLog = await prisma.outboxEvent.findFirst({
      where: {
        aggregateType: "Order",
        aggregateId: order.body.data.id,
        eventType: "OrderCancelled",
      },
    });
    expect(cancelLog).not.toBeNull();
    expect((cancelLog?.payload as { reason: string }).reason).toBe("payment_failed");
  });

  it(
    "refunds at or below the threshold execute immediately (single-actor authority) and " +
      "credit the wallet — proven by balance before/after, not just a 200 response",
    async () => {
      const buyer = await signUpAndPromote("refund-low-buyer", []);
      const order = await placeOrder(buyer.token, "card");
      expect(order.status).toBe(201);

      const before = await request(app.getHttpServer())
        .get("/v1/wallet/balance")
        .set("Authorization", `Bearer ${buyer.token}`)
        .expect(200);
      expect(before.body.data.amount).toBe("0.00");

      const refund = await request(app.getHttpServer())
        .post("/v1/wallet/refunds")
        .set("Authorization", `Bearer ${sellerToken}`) // pw-seller has the admin role too
        .send({
          paymentIntentId: order.body.data.paymentIntentId,
          amount: "50.00",
          reason: "Customer request",
        })
        .expect(201);
      expect(refund.body.data.status).toBe("executed");

      const after = await request(app.getHttpServer())
        .get("/v1/wallet/balance")
        .set("Authorization", `Bearer ${buyer.token}`)
        .expect(200);
      expect(after.body.data.amount).toBe("50.00");

      const proposeLog = await prisma.auditLog.findFirst({
        where: { action: "refund.propose", targetId: refund.body.data.id },
      });
      const executeLog = await prisma.auditLog.findFirst({
        where: { action: "refund.execute", targetId: refund.body.data.id },
      });
      expect(proposeLog).not.toBeNull();
      expect(executeLog).not.toBeNull();
    },
  );

  it(
    "refunds ABOVE the threshold require a second, different approver — the actual dual-" +
      "authorization proof: proposer cannot self-approve, and nothing executes until approved",
    async () => {
      const buyer = await signUpAndPromote("refund-high-buyer", []);
      const order = await placeOrder(buyer.token, "card", 6); // 100*6 = 600, above the 500 threshold
      expect(order.status).toBe(201);

      const proposer = await signUpAndPromote("refund-proposer", ["admin"]);
      const approver = await signUpAndPromote("refund-approver", ["admin"]);

      const proposed = await request(app.getHttpServer())
        .post("/v1/wallet/refunds")
        .set("Authorization", `Bearer ${proposer.token}`)
        .send({
          paymentIntentId: order.body.data.paymentIntentId,
          amount: "600.00",
          reason: "Goodwill",
        })
        .expect(201);
      expect(proposed.body.data.status).toBe("proposed"); // NOT executed yet

      const midBalance = await request(app.getHttpServer())
        .get("/v1/wallet/balance")
        .set("Authorization", `Bearer ${buyer.token}`)
        .expect(200);
      expect(midBalance.body.data.amount).toBe("0.00"); // proposing alone credits nothing

      // The proposer cannot approve their own request.
      const selfApprove = await request(app.getHttpServer())
        .patch(`/v1/wallet/refunds/${proposed.body.data.id}/approve`)
        .set("Authorization", `Bearer ${proposer.token}`)
        .expect(403);
      expect(selfApprove.body.error.code).toBe("REFUND_SELF_APPROVAL_FORBIDDEN");

      // A genuinely different actor approves — NOW it executes.
      const approved = await request(app.getHttpServer())
        .patch(`/v1/wallet/refunds/${proposed.body.data.id}/approve`)
        .set("Authorization", `Bearer ${approver.token}`)
        .expect(200);
      expect(approved.body.data.status).toBe("executed");

      const finalBalance = await request(app.getHttpServer())
        .get("/v1/wallet/balance")
        .set("Authorization", `Bearer ${buyer.token}`)
        .expect(200);
      expect(finalBalance.body.data.amount).toBe("600.00");
    },
  );

  it("a rejected refund never credits the wallet", async () => {
    const buyer = await signUpAndPromote("refund-reject-buyer", []);
    const order = await placeOrder(buyer.token, "card", 6); // above threshold
    expect(order.status).toBe(201);

    const proposer = await signUpAndPromote("reject-proposer", ["admin"]);
    const rejector = await signUpAndPromote("reject-rejector", ["admin"]);

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

    const balance = await request(app.getHttpServer())
      .get("/v1/wallet/balance")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(balance.body.data.amount).toBe("0.00");
  });

  it("rejects refund proposal/approval from a non-admin — the policy engine, not an inline check", async () => {
    const buyer = await signUpAndPromote("perm-check-buyer", []);
    const order = await placeOrder(buyer.token, "card");
    expect(order.status).toBe(201);

    const response = await request(app.getHttpServer())
      .post("/v1/wallet/refunds")
      .set("Authorization", `Bearer ${buyer.token}`) // a plain customer, not admin
      .send({
        paymentIntentId: order.body.data.paymentIntentId,
        amount: "10.00",
        reason: "Trying my luck",
      })
      .expect(403);
    expect(response.body.error.code).toBe("PERMISSION_DENIED");
  });

  it("a funded wallet can then successfully pay for a new order by wallet", async () => {
    const buyer = await signUpAndPromote("funded-buyer", []);

    // Fund the wallet via a real refund on a prior order (the only wallet-crediting
    // path this pass implements — Vol 5, C2).
    const fundingOrder = await placeOrder(buyer.token, "card");
    expect(fundingOrder.status).toBe(201);
    await request(app.getHttpServer())
      .post("/v1/wallet/refunds")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        paymentIntentId: fundingOrder.body.data.paymentIntentId,
        amount: "100.00",
        reason: "Funding for test",
      })
      .expect(201);

    const balance = await request(app.getHttpServer())
      .get("/v1/wallet/balance")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(balance.body.data.amount).toBe("100.00");

    // Now pay for a new order BY WALLET, using exactly the funded balance.
    const walletOrder = await placeOrder(buyer.token, "wallet");
    expect(walletOrder.status).toBe(201);
    expect(walletOrder.body.data.status).toBe("confirmed");

    const afterBalance = await request(app.getHttpServer())
      .get("/v1/wallet/balance")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(200);
    expect(afterBalance.body.data.amount).toBe("0.00"); // fully spent
  });
});
