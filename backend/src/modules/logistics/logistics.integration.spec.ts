import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Logistics (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  async function signUp(prefix: string) {
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
    return { userId: signup.body.data.user.id, token: signup.body.data.accessToken, email };
  }

  async function login(email: string) {
    const relogin = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email, password: "correct-horse-battery-staple" });
    return relogin.body.data.accessToken as string;
  }

  /** Places a real order (card payment, always succeeds via the stub PSP) and returns
   *  its first sub-order's ID — a real subOrderId to assign a delivery job against.
   *  Category creation is admin-only (matches CatalogController's RequirePermission),
   *  so it goes through adminToken, not the seller's own token. */
  async function placeOrderAndGetSubOrderId(sellerToken: string, district: string) {
    const suffix = randomUUID().slice(0, 8);
    const category = await request(app.getHttpServer())
      .post("/v1/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Logistics Test", slug: `logistics-cat-${suffix}` });

    const product = await request(app.getHttpServer())
      .post("/v1/products")
      .set("Authorization", `Bearer ${sellerToken}`)
      .send({
        categoryId: category.body.data.id,
        title: "Logistics Test Product",
        slug: `logistics-product-${suffix}`,
        variants: [
          {
            sku: `LOG-${suffix}`,
            name: "Default",
            priceAmount: "40.00",
            priceCurrency: "SLE",
            stockQuantity: 10,
          },
        ],
      });
    const variantId = product.body.data.variants[0].id;
    const buyer = await signUp("logistics-buyer");

    const cart = await request(app.getHttpServer()).post("/v1/cart").expect(201);
    const cartId = cart.body.data.cartId;
    await request(app.getHttpServer())
      .post(`/v1/cart/${cartId}/lines`)
      .send({ variantId, quantity: 1 })
      .expect(201);

    const session = await request(app.getHttpServer())
      .post(`/v1/carts/${cartId}/checkout/session`)
      .send({
        addressLine: "1 Siaka Stevens St",
        city: "Freetown",
        district,
        phone: "+23276000000",
        deliveryMethod: "standard",
        paymentMethod: "card",
      })
      .expect(201);

    const order = await request(app.getHttpServer())
      .post("/v1/orders")
      .set("Authorization", `Bearer ${buyer.token}`)
      .set("Idempotency-Key", randomUUID())
      .send({ checkoutSessionId: session.body.data.id })
      .expect(201);

    return {
      subOrderId: order.body.data.subOrders[0].id as string,
      checkoutSession: session.body.data,
    };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const admin = await signUp("logistics-admin");
    await promoteRole(prisma, admin.userId, ["customer", "admin"]);
    adminToken = await login(admin.email);
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects a non-admin creating a delivery zone", async () => {
    const buyer = await signUp("logistics-nonadmin");
    const response = await request(app.getHttpServer())
      .post("/v1/logistics/delivery-zones")
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({
        district: "Bo",
        standardFeeAmount: "20.00",
        expressFeeAmount: "40.00",
        currency: "SLE",
      })
      .expect(403);
    expect(response.body.error.code).toBe("PERMISSION_DENIED");
  });

  it("admin creates a delivery zone, and it's readable publicly", async () => {
    const suffix = randomUUID().slice(0, 6);
    const district = `Kenema-${suffix}`;
    const created = await request(app.getHttpServer())
      .post("/v1/logistics/delivery-zones")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ district, standardFeeAmount: "25.00", expressFeeAmount: "50.00", currency: "SLE" })
      .expect(201);
    expect(created.body.data.district).toBe(district);

    const list = await request(app.getHttpServer()).get("/v1/logistics/delivery-zones").expect(200);
    expect(list.body.data.some((z: { district: string }) => z.district === district)).toBe(true);
  });

  it(
    "a real DeliveryZone changes checkout's shipping fee — the stub-to-real seam actually " +
      "works, not just wired",
    async () => {
      const seller = await signUp("logistics-seller-zone");
      await promoteRole(prisma, seller.userId, ["customer", "seller"]);
      const sellerToken = await login(seller.email);

      const suffix = randomUUID().slice(0, 6);
      const district = `Makeni-${suffix}`;
      await request(app.getHttpServer())
        .post("/v1/logistics/delivery-zones")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ district, standardFeeAmount: "22.50", expressFeeAmount: "60.00", currency: "SLE" })
        .expect(201);

      const { checkoutSession } = await placeOrderAndGetSubOrderId(sellerToken, district);
      // 40.00 product + 22.50 real zone rate (not the 15.00 flat fallback the stub used).
      expect(checkoutSession.shippingFeeAmount).toBe("22.50");
      expect(checkoutSession.totalAmount).toBe("62.50");
    },
  );

  it("an unseeded district still falls back to the flat default (no breakage)", async () => {
    const seller = await signUp("logistics-seller-fallback");
    await promoteRole(prisma, seller.userId, ["customer", "seller"]);
    const sellerToken = await login(seller.email);

    const { checkoutSession } = await placeOrderAndGetSubOrderId(
      sellerToken,
      `Unseeded-${randomUUID().slice(0, 6)}`,
    );
    expect(checkoutSession.shippingFeeAmount).toBe("15.00"); // flat "standard" fallback
  });

  it("full delivery job lifecycle: assign -> pickup -> in-transit -> deliver", async () => {
    const seller = await signUp("logistics-seller-job");
    await promoteRole(prisma, seller.userId, ["customer", "seller"]);
    const sellerToken = await login(seller.email);
    const rider = await signUp("logistics-rider");

    const { subOrderId } = await placeOrderAndGetSubOrderId(sellerToken, "Western Area");

    const assigned = await request(app.getHttpServer())
      .post("/v1/logistics/delivery-jobs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ subOrderId, riderId: rider.userId })
      .expect(201);
    expect(assigned.body.data.status).toBe("assigned");
    const jobId = assigned.body.data.id;

    // A different, unrelated rider can't read or transition this job.
    const otherRider = await signUp("logistics-other-rider");
    const denied = await request(app.getHttpServer())
      .get(`/v1/logistics/delivery-jobs/${jobId}`)
      .set("Authorization", `Bearer ${otherRider.token}`)
      .expect(403);
    expect(denied.body.error.code).toBe("DELIVERY_JOB_ACCESS_DENIED");

    // The assigned rider can read and transition it.
    const read = await request(app.getHttpServer())
      .get(`/v1/logistics/delivery-jobs/${jobId}`)
      .set("Authorization", `Bearer ${rider.token}`)
      .expect(200);
    expect(read.body.data.status).toBe("assigned");

    await request(app.getHttpServer())
      .patch(`/v1/logistics/delivery-jobs/${jobId}/pickup`)
      .set("Authorization", `Bearer ${rider.token}`)
      .expect(200);

    // Illegal transition — can't jump straight to delivered from picked_up.
    const illegal = await request(app.getHttpServer())
      .patch(`/v1/logistics/delivery-jobs/${jobId}/deliver`)
      .set("Authorization", `Bearer ${rider.token}`)
      .send({ recipientName: "Someone" })
      .expect(400);
    expect(illegal.body.error.code).toBe("ILLEGAL_DELIVERY_JOB_TRANSITION");

    await request(app.getHttpServer())
      .patch(`/v1/logistics/delivery-jobs/${jobId}/in-transit`)
      .set("Authorization", `Bearer ${rider.token}`)
      .expect(200);

    const delivered = await request(app.getHttpServer())
      .patch(`/v1/logistics/delivery-jobs/${jobId}/deliver`)
      .set("Authorization", `Bearer ${rider.token}`)
      .send({ recipientName: "Jane Doe", note: "Left with security" })
      .expect(200);
    expect(delivered.body.data.recipientName).toBe("Jane Doe");

    const finalJob = await request(app.getHttpServer())
      .get(`/v1/logistics/delivery-jobs/${jobId}`)
      .set("Authorization", `Bearer ${rider.token}`)
      .expect(200);
    expect(finalJob.body.data.status).toBe("delivered");

    const auditEntries = await prisma.auditLog.findMany({
      where: { targetType: "DeliveryJob", targetId: jobId },
      orderBy: { occurredAt: "asc" },
    });
    expect(auditEntries.map((e) => e.action)).toEqual([
      "delivery_job.assign",
      "delivery_job.picked_up",
      "delivery_job.in_transit",
      "delivery_job.delivered",
    ]);
  });

  it("a failed delivery is a terminal state with a recorded reason", async () => {
    const seller = await signUp("logistics-seller-fail");
    await promoteRole(prisma, seller.userId, ["customer", "seller"]);
    const sellerToken = await login(seller.email);
    const rider = await signUp("logistics-rider-fail");

    const { subOrderId } = await placeOrderAndGetSubOrderId(sellerToken, "Western Area");
    const assigned = await request(app.getHttpServer())
      .post("/v1/logistics/delivery-jobs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ subOrderId, riderId: rider.userId })
      .expect(201);

    const failed = await request(app.getHttpServer())
      .patch(`/v1/logistics/delivery-jobs/${assigned.body.data.id}/fail`)
      .set("Authorization", `Bearer ${rider.token}`)
      .send({ reason: "Recipient unreachable" })
      .expect(200);
    expect(failed.body.data.status).toBe("failed");

    const failLog = await prisma.auditLog.findFirst({
      where: {
        targetType: "DeliveryJob",
        targetId: assigned.body.data.id,
        action: "delivery_job.failed",
      },
    });
    expect(failLog?.reason).toBe("Recipient unreachable");

    // Terminal — can't transition further.
    const dead = await request(app.getHttpServer())
      .patch(`/v1/logistics/delivery-jobs/${assigned.body.data.id}/pickup`)
      .set("Authorization", `Bearer ${rider.token}`)
      .expect(400);
    expect(dead.body.error.code).toBe("ILLEGAL_DELIVERY_JOB_TRANSITION");
  });

  it("rejects assigning a second delivery job to the same sub-order", async () => {
    const seller = await signUp("logistics-seller-dup");
    await promoteRole(prisma, seller.userId, ["customer", "seller"]);
    const sellerToken = await login(seller.email);
    const rider = await signUp("logistics-rider-dup");

    const { subOrderId } = await placeOrderAndGetSubOrderId(sellerToken, "Western Area");
    await request(app.getHttpServer())
      .post("/v1/logistics/delivery-jobs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ subOrderId, riderId: rider.userId })
      .expect(201);

    const duplicate = await request(app.getHttpServer())
      .post("/v1/logistics/delivery-jobs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ subOrderId, riderId: rider.userId })
      .expect(409);
    expect(duplicate.body.error.code).toBe("DELIVERY_JOB_ALREADY_EXISTS");
  });
});
