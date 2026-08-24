import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Trust & Safety (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminAToken: string;
  let adminBToken: string;

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
      return { token: relogin.body.data.accessToken, userId: signup.body.data.user.id, email };
    }
    return { token: signup.body.data.accessToken, userId: signup.body.data.user.id, email };
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const adminA = await signUpAndPromote("ts-admin-a", ["admin"]);
    const adminB = await signUpAndPromote("ts-admin-b", ["admin"]);
    adminAToken = adminA.token;
    adminBToken = adminB.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("KYC — dual-authorized seller approval, no threshold exception", () => {
    it("a submission is only decided once TWO different admins act — propose then confirm", async () => {
      const seller = await signUpAndPromote("ts-kyc-seller", ["seller"]);

      const submitted = await request(app.getHttpServer())
        .post("/v1/trust-safety/kyc")
        .set("Authorization", `Bearer ${seller.token}`)
        .send({ subjectId: seller.userId, subjectType: "seller", documentReference: "REG-12345" })
        .expect(201);
      expect(submitted.body.data.status).toBe("pending");

      // A non-admin can't propose a decision.
      const denied = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/kyc/${submitted.body.data.id}/propose-decision`)
        .set("Authorization", `Bearer ${seller.token}`)
        .send({ decision: "approve" })
        .expect(403);
      expect(denied.body.error.code).toBe("PERMISSION_DENIED");

      const proposed = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/kyc/${submitted.body.data.id}/propose-decision`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .send({ decision: "approve" })
        .expect(200);
      expect(proposed.body.data.status).toBe("pending"); // NOT applied yet

      // Same admin can't confirm their own proposal.
      const selfConfirm = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/kyc/${submitted.body.data.id}/confirm-decision`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .expect(403);
      expect(selfConfirm.body.error.code).toBe("KYC_SELF_CONFIRMATION_FORBIDDEN");

      const confirmed = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/kyc/${submitted.body.data.id}/confirm-decision`)
        .set("Authorization", `Bearer ${adminBToken}`)
        .expect(200);
      expect(confirmed.body.data.status).toBe("approved");

      const auditEntries = await prisma.auditLog.findMany({
        where: { targetType: "KYCSubmission", targetId: submitted.body.data.id },
        orderBy: { occurredAt: "asc" },
      });
      expect(auditEntries.map((e) => e.action)).toEqual([
        "kyc.submit",
        "kyc.propose_decision",
        "kyc.confirm_decision",
      ]);
    });

    it("a rejected proposal marks the submission rejected", async () => {
      const seller = await signUpAndPromote("ts-kyc-seller-reject", ["seller"]);
      const submitted = await request(app.getHttpServer())
        .post("/v1/trust-safety/kyc")
        .set("Authorization", `Bearer ${seller.token}`)
        .send({ subjectId: seller.userId, subjectType: "seller", documentReference: "REG-99999" })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/v1/trust-safety/kyc/${submitted.body.data.id}/propose-decision`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .send({ decision: "reject", reason: "Document unreadable" })
        .expect(200);

      const confirmed = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/kyc/${submitted.body.data.id}/confirm-decision`)
        .set("Authorization", `Bearer ${adminBToken}`)
        .expect(200);
      expect(confirmed.body.data.status).toBe("rejected");
    });

    it("GET /trust-safety/kyc — admin review queue, filtered by status, admin-only", async () => {
      const seller = await signUpAndPromote("ts-kyc-queue-seller", ["seller"]);
      const submitted = await request(app.getHttpServer())
        .post("/v1/trust-safety/kyc")
        .set("Authorization", `Bearer ${seller.token}`)
        .send({ subjectId: seller.userId, subjectType: "seller", documentReference: "REG-QUEUE" })
        .expect(201);

      const denied = await request(app.getHttpServer())
        .get("/v1/trust-safety/kyc?status=pending")
        .set("Authorization", `Bearer ${seller.token}`)
        .expect(403);
      expect(denied.body.error.code).toBe("PERMISSION_DENIED");

      const queue = await request(app.getHttpServer())
        .get("/v1/trust-safety/kyc?status=pending")
        .set("Authorization", `Bearer ${adminAToken}`)
        .expect(200);
      expect(queue.body.data.some((s: { id: string }) => s.id === submitted.body.data.id)).toBe(
        true,
      );
      for (const submission of queue.body.data as { status: string }[]) {
        expect(submission.status).toBe("pending");
      }
    });
  });

  describe("Seller suspension — the other named half of Vol 3, B4, enforced by Catalog", () => {
    it(
      "a suspended seller (confirmed by a SECOND admin) can no longer list new products; " +
        "reinstating restores it",
      async () => {
        const seller = await signUpAndPromote("ts-suspend-seller", ["seller"]);

        const suspendReq = await request(app.getHttpServer())
          .post(`/v1/trust-safety/sellers/${seller.userId}/suspend`)
          .set("Authorization", `Bearer ${adminAToken}`)
          .send({ reason: "Repeated customer complaints" })
          .expect(201);

        // Self-confirmation forbidden, same as KYC/refunds/payouts.
        const selfConfirm = await request(app.getHttpServer())
          .patch(`/v1/trust-safety/suspension-requests/${suspendReq.body.data.id}/confirm`)
          .set("Authorization", `Bearer ${adminAToken}`)
          .expect(403);
        expect(selfConfirm.body.error.code).toBe("SELLER_SUSPENSION_SELF_APPROVAL_FORBIDDEN");

        await request(app.getHttpServer())
          .patch(`/v1/trust-safety/suspension-requests/${suspendReq.body.data.id}/confirm`)
          .set("Authorization", `Bearer ${adminBToken}`)
          .expect(200);

        const user = await prisma.user.findUniqueOrThrow({ where: { id: seller.userId } });
        expect(user.sellerSuspended).toBe(true);

        // Catalog enforces it — a suspended seller's createProduct is blocked.
        const suffix = randomUUID().slice(0, 8);
        const category = await request(app.getHttpServer())
          .post("/v1/categories")
          .set("Authorization", `Bearer ${adminAToken}`)
          .send({ name: "TS Test", slug: `ts-cat-${suffix}` });

        const blocked = await request(app.getHttpServer())
          .post("/v1/products")
          .set("Authorization", `Bearer ${seller.token}`)
          .send({
            categoryId: category.body.data.id,
            title: "Should Be Blocked",
            slug: `ts-blocked-${suffix}`,
            variants: [
              {
                sku: `TS-${suffix}`,
                name: "Default",
                priceAmount: "10.00",
                priceCurrency: "SLE",
                stockQuantity: 5,
              },
            ],
          })
          .expect(403);
        expect(blocked.body.error.code).toBe("SELLER_SUSPENDED");

        // Reinstating restores the ability to list products.
        const reinstateReq = await request(app.getHttpServer())
          .post(`/v1/trust-safety/sellers/${seller.userId}/reinstate`)
          .set("Authorization", `Bearer ${adminAToken}`)
          .send({ reason: "Complaints resolved" })
          .expect(201);
        await request(app.getHttpServer())
          .patch(`/v1/trust-safety/suspension-requests/${reinstateReq.body.data.id}/confirm`)
          .set("Authorization", `Bearer ${adminBToken}`)
          .expect(200);

        const allowed = await request(app.getHttpServer())
          .post("/v1/products")
          .set("Authorization", `Bearer ${seller.token}`)
          .send({
            categoryId: category.body.data.id,
            title: "Should Be Allowed",
            slug: `ts-allowed-${suffix}`,
            variants: [
              {
                sku: `TS2-${suffix}`,
                name: "Default",
                priceAmount: "10.00",
                priceCurrency: "SLE",
                stockQuantity: 5,
              },
            ],
          })
          .expect(201);
        expect(allowed.body.data.status).toBe("published");
      },
    );

    it("a rejected suspension request never suspends the seller", async () => {
      const seller = await signUpAndPromote("ts-suspend-rejected", ["seller"]);
      const suspendReq = await request(app.getHttpServer())
        .post(`/v1/trust-safety/sellers/${seller.userId}/suspend`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .send({ reason: "Under investigation" })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/v1/trust-safety/suspension-requests/${suspendReq.body.data.id}/reject`)
        .set("Authorization", `Bearer ${adminBToken}`)
        .send({ reason: "Investigation cleared the seller" })
        .expect(200);

      const user = await prisma.user.findUniqueOrThrow({ where: { id: seller.userId } });
      expect(user.sellerSuspended).toBe(false);
    });

    it("GET /trust-safety/suspension-requests — admin review queue, filtered by status, admin-only", async () => {
      const seller = await signUpAndPromote("ts-suspend-queue", ["seller"]);
      const suspendReq = await request(app.getHttpServer())
        .post(`/v1/trust-safety/sellers/${seller.userId}/suspend`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .send({ reason: "Queue listing check" })
        .expect(201);

      const denied = await request(app.getHttpServer())
        .get("/v1/trust-safety/suspension-requests?status=proposed")
        .set("Authorization", `Bearer ${seller.token}`)
        .expect(403);
      expect(denied.body.error.code).toBe("PERMISSION_DENIED");

      const queue = await request(app.getHttpServer())
        .get("/v1/trust-safety/suspension-requests?status=proposed")
        .set("Authorization", `Bearer ${adminAToken}`)
        .expect(200);
      expect(queue.body.data.some((r: { id: string }) => r.id === suspendReq.body.data.id)).toBe(
        true,
      );
      for (const req of queue.body.data as { status: string }[]) {
        expect(req.status).toBe("proposed");
      }
    });
  });

  describe("Disputes — not dual-authorized", () => {
    it("only the opener or an admin can read a dispute; only an admin can resolve it", async () => {
      const buyer = await signUpAndPromote("ts-dispute-buyer", []);
      const other = await signUpAndPromote("ts-dispute-other", []);

      const opened = await request(app.getHttpServer())
        .post("/v1/trust-safety/disputes")
        .set("Authorization", `Bearer ${buyer.token}`)
        .send({ orderId: randomUUID(), reason: "Item never arrived" })
        .expect(201);
      expect(opened.body.data.status).toBe("open");

      const denied = await request(app.getHttpServer())
        .get(`/v1/trust-safety/disputes/${opened.body.data.id}`)
        .set("Authorization", `Bearer ${other.token}`)
        .expect(403);
      expect(denied.body.error.code).toBe("DISPUTE_ACCESS_DENIED");

      const read = await request(app.getHttpServer())
        .get(`/v1/trust-safety/disputes/${opened.body.data.id}`)
        .set("Authorization", `Bearer ${buyer.token}`)
        .expect(200);
      expect(read.body.data.events).toHaveLength(1);
      expect(read.body.data.events[0].eventType).toBe("opened");

      await request(app.getHttpServer())
        .post(`/v1/trust-safety/disputes/${opened.body.data.id}/comments`)
        .set("Authorization", `Bearer ${buyer.token}`)
        .send({ note: "Following up — still no delivery" })
        .expect(201);

      // The opener can't resolve their own dispute — only admin (CASL "manage").
      const openerResolve = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/disputes/${opened.body.data.id}/resolve`)
        .set("Authorization", `Bearer ${buyer.token}`)
        .send({ resolution: "Refunded" })
        .expect(403);
      expect(openerResolve.body.error.code).toBe("DISPUTE_ACCESS_DENIED");

      const resolved = await request(app.getHttpServer())
        .patch(`/v1/trust-safety/disputes/${opened.body.data.id}/resolve`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .send({ resolution: "Refunded via wallet credit" })
        .expect(200);
      expect(resolved.body.data.status).toBe("resolved");

      const final = await request(app.getHttpServer())
        .get(`/v1/trust-safety/disputes/${opened.body.data.id}`)
        .set("Authorization", `Bearer ${buyer.token}`)
        .expect(200);
      expect(final.body.data.events.map((e: { eventType: string }) => e.eventType)).toEqual([
        "opened",
        "comment",
        "resolved",
      ]);
    });

    it("rejects a dispute with neither orderId nor reviewId, and one with both", async () => {
      const buyer = await signUpAndPromote("ts-dispute-invalid", []);

      const neither = await request(app.getHttpServer())
        .post("/v1/trust-safety/disputes")
        .set("Authorization", `Bearer ${buyer.token}`)
        .send({ reason: "No target" })
        .expect(400);
      expect(neither.body.error.code).toBe("DISPUTE_TARGET_REQUIRED");

      const both = await request(app.getHttpServer())
        .post("/v1/trust-safety/disputes")
        .set("Authorization", `Bearer ${buyer.token}`)
        .send({ orderId: randomUUID(), reviewId: randomUUID(), reason: "Ambiguous" })
        .expect(400);
      expect(both.body.error.code).toBe("DISPUTE_TARGET_AMBIGUOUS");
    });

    it(
      "GET /trust-safety/disputes — admin-only 'all disputes' queue, gated by 'manage' " +
        "(not the conditioned 'read' every user has on their own disputes)",
      async () => {
        const buyer = await signUpAndPromote("ts-dispute-queue-buyer", []);
        const opened = await request(app.getHttpServer())
          .post("/v1/trust-safety/disputes")
          .set("Authorization", `Bearer ${buyer.token}`)
          .send({ orderId: randomUUID(), reason: "Queue listing check" })
          .expect(201);

        // The opener has real "read" on their OWN dispute (GET /disputes/:id already
        // covers that) but must NOT pass the coarse route guard for the list-all queue.
        const denied = await request(app.getHttpServer())
          .get("/v1/trust-safety/disputes?status=open")
          .set("Authorization", `Bearer ${buyer.token}`)
          .expect(403);
        expect(denied.body.error.code).toBe("PERMISSION_DENIED");

        const queue = await request(app.getHttpServer())
          .get("/v1/trust-safety/disputes?status=open")
          .set("Authorization", `Bearer ${adminAToken}`)
          .expect(200);
        expect(queue.body.data.some((d: { id: string }) => d.id === opened.body.data.id)).toBe(
          true,
        );
        for (const dispute of queue.body.data as { status: string }[]) {
          expect(dispute.status).toBe("open");
        }
      },
    );
  });
});
