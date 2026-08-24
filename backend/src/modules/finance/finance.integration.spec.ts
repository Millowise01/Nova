import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

describe("Finance (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminAToken: string;
  let adminBToken: string;
  let sellerId: string;

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const adminA = await signUpAndPromote("finance-admin-a", ["admin"]);
    const adminB = await signUpAndPromote("finance-admin-b", ["admin"]);
    adminAToken = adminA.token;
    adminBToken = adminB.token;

    const seller = await signUpAndPromote("finance-seller", ["seller"]);
    sellerId = seller.userId;
  });

  afterAll(async () => {
    await app.close();
  });

  it("rejects a non-admin proposing a payout", async () => {
    const buyer = await signUpAndPromote("finance-buyer", []);
    const response = await request(app.getHttpServer())
      .post("/v1/finance/payouts")
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({ sellerId, amount: "100.00", currency: "SLE", reason: "Weekly payout" })
      .expect(403);
    expect(response.body.error.code).toBe("PERMISSION_DENIED");
  });

  it("a payout at or below the threshold executes immediately with a single actor", async () => {
    const proposed = await request(app.getHttpServer())
      .post("/v1/finance/payouts")
      .set("Authorization", `Bearer ${adminAToken}`)
      .send({ sellerId, amount: "200.00", currency: "SLE", reason: "Below threshold" })
      .expect(201);

    expect(proposed.body.data.status).toBe("executed");
    expect(proposed.body.data.proposedBy).toBe(proposed.body.data.approvedBy);
  });

  it(
    "a payout ABOVE the threshold requires a second, different admin — self-approval " +
      "is forbidden",
    async () => {
      const proposed = await request(app.getHttpServer())
        .post("/v1/finance/payouts")
        .set("Authorization", `Bearer ${adminAToken}`)
        .send({ sellerId, amount: "750.00", currency: "SLE", reason: "Above threshold" })
        .expect(201);
      expect(proposed.body.data.status).toBe("proposed"); // NOT executed yet

      const selfApprove = await request(app.getHttpServer())
        .patch(`/v1/finance/payouts/${proposed.body.data.id}/approve`)
        .set("Authorization", `Bearer ${adminAToken}`)
        .expect(403);
      expect(selfApprove.body.error.code).toBe("SELLER_PAYOUT_SELF_APPROVAL_FORBIDDEN");

      const approved = await request(app.getHttpServer())
        .patch(`/v1/finance/payouts/${proposed.body.data.id}/approve`)
        .set("Authorization", `Bearer ${adminBToken}`)
        .expect(200);
      expect(approved.body.data.status).toBe("executed");
      expect(approved.body.data.proposedBy).not.toBe(approved.body.data.approvedBy);
    },
  );

  it("a rejected payout never executes, and can't be approved afterward", async () => {
    const proposed = await request(app.getHttpServer())
      .post("/v1/finance/payouts")
      .set("Authorization", `Bearer ${adminAToken}`)
      .send({ sellerId, amount: "900.00", currency: "SLE", reason: "Will be rejected" })
      .expect(201);

    const rejected = await request(app.getHttpServer())
      .patch(`/v1/finance/payouts/${proposed.body.data.id}/reject`)
      .set("Authorization", `Bearer ${adminBToken}`)
      .send({ reason: "Insufficient documentation" })
      .expect(200);
    expect(rejected.body.data.status).toBe("rejected");

    const lateApprove = await request(app.getHttpServer())
      .patch(`/v1/finance/payouts/${proposed.body.data.id}/approve`)
      .set("Authorization", `Bearer ${adminBToken}`)
      .expect(400);
    expect(lateApprove.body.error.code).toBe("SELLER_PAYOUT_NOT_PENDING_APPROVAL");
  });

  it("execution posts a balanced double-entry pair — seller_payable and platform_cash move by the same amount", async () => {
    const before = await Promise.all([
      prisma.ledgerEntry.aggregate({
        where: { ledgerAccount: { code: "seller_payable" } },
        _sum: { debitAmount: true },
      }),
      prisma.ledgerEntry.aggregate({
        where: { ledgerAccount: { code: "platform_cash" } },
        _sum: { creditAmount: true },
      }),
    ]);
    const debitBefore = Number(before[0]._sum.debitAmount ?? 0);
    const creditBefore = Number(before[1]._sum.creditAmount ?? 0);

    const executed = await request(app.getHttpServer())
      .post("/v1/finance/payouts")
      .set("Authorization", `Bearer ${adminAToken}`)
      .send({ sellerId, amount: "50.00", currency: "SLE", reason: "Ledger balance check" })
      .expect(201);
    expect(executed.body.data.status).toBe("executed");

    const after = await Promise.all([
      prisma.ledgerEntry.aggregate({
        where: { ledgerAccount: { code: "seller_payable" } },
        _sum: { debitAmount: true },
      }),
      prisma.ledgerEntry.aggregate({
        where: { ledgerAccount: { code: "platform_cash" } },
        _sum: { creditAmount: true },
      }),
    ]);
    const debitAfter = Number(after[0]._sum.debitAmount ?? 0);
    const creditAfter = Number(after[1]._sum.creditAmount ?? 0);

    expect(debitAfter - debitBefore).toBe(50);
    expect(creditAfter - creditBefore).toBe(50);

    const entries = await prisma.ledgerEntry.findMany({
      where: { referenceType: "SellerPayout", referenceId: executed.body.data.id },
    });
    expect(entries).toHaveLength(2);
    const totalDebit = entries.reduce((sum, e) => sum + Number(e.debitAmount), 0);
    const totalCredit = entries.reduce((sum, e) => sum + Number(e.creditAmount), 0);
    expect(totalDebit).toBe(totalCredit); // balanced pair
  });

  it("writes an audit trail for propose/approve/execute", async () => {
    const proposed = await request(app.getHttpServer())
      .post("/v1/finance/payouts")
      .set("Authorization", `Bearer ${adminAToken}`)
      .send({ sellerId, amount: "600.00", currency: "SLE", reason: "Audit trail check" })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/v1/finance/payouts/${proposed.body.data.id}/approve`)
      .set("Authorization", `Bearer ${adminBToken}`)
      .expect(200);

    const entries = await prisma.auditLog.findMany({
      where: { targetType: "SellerPayout", targetId: proposed.body.data.id },
      orderBy: { occurredAt: "asc" },
    });
    expect(entries.map((e) => e.action)).toEqual([
      "seller_payout.propose",
      "seller_payout.approve",
      "seller_payout.execute",
    ]);
  });

  it("GET /finance/payouts — admin review queue, filtered by status, admin-only", async () => {
    const buyer = await signUpAndPromote("finance-queue-buyer", []);

    const proposed = await request(app.getHttpServer())
      .post("/v1/finance/payouts")
      .set("Authorization", `Bearer ${adminAToken}`)
      .send({ sellerId, amount: "700.00", currency: "SLE", reason: "Queue listing check" })
      .expect(201);
    expect(proposed.body.data.status).toBe("proposed");

    const denied = await request(app.getHttpServer())
      .get("/v1/finance/payouts?status=proposed")
      .set("Authorization", `Bearer ${buyer.token}`)
      .expect(403);
    expect(denied.body.error.code).toBe("PERMISSION_DENIED");

    const queue = await request(app.getHttpServer())
      .get("/v1/finance/payouts?status=proposed")
      .set("Authorization", `Bearer ${adminAToken}`)
      .expect(200);
    expect(queue.body.data.some((p: { id: string }) => p.id === proposed.body.data.id)).toBe(true);
    for (const payout of queue.body.data as { status: string }[]) {
      expect(payout.status).toBe("proposed");
    }
  });
});
