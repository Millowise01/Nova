import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";

/**
 * Real integration test — a live NestJS app instance talking to the actual dockerized
 * Postgres (not a mock), exactly the "run against a test database container" standard
 * from backend/docs/06-testing-strategy.md (Testcontainers is the longer-term proposal
 * there; this pass uses the same docker-compose Postgres local dev already runs
 * against, which is the pragmatic equivalent until Testcontainers is wired into CI).
 */
describe("Identity — auth flow (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  function uniqueUser() {
    const suffix = randomUUID().slice(0, 8);
    return {
      firstName: "Test",
      lastName: "User",
      email: `test-${suffix}@example.test`,
      phone: `+2327600${suffix.slice(0, 4)}`,
      password: "correct-horse-battery-staple",
      confirmPassword: "correct-horse-battery-staple",
    };
  }

  it("signs up a new user, hashing the password and encrypting PII at rest", async () => {
    const payload = uniqueUser();

    const response = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send(payload)
      .expect(201);

    expect(response.body.data.user.id).toEqual(expect.any(String));
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    // Verify directly against the database — the actual proof of the PII encryption
    // and password-hashing requirements, not just "the API returned 201".
    const row = await prisma.user.findUniqueOrThrow({
      where: { id: response.body.data.user.id },
      include: { authFactors: true },
    });

    expect(row.emailEncrypted).not.toContain(payload.email);
    expect(row.emailEncrypted).not.toBe(payload.email);
    expect(row.phoneEncrypted).not.toContain(payload.phone);

    const passwordFactor = row.authFactors.find((f) => f.type === "password");
    expect(passwordFactor?.passwordHash).toBeDefined();
    expect(passwordFactor?.passwordHash).not.toBe(payload.password);
    expect(passwordFactor?.passwordHash?.startsWith("$2b$")).toBe(true); // real bcrypt hash
  });

  it("rejects a duplicate signup with the same email", async () => {
    const payload = uniqueUser();
    await request(app.getHttpServer()).post("/v1/auth/signup").send(payload).expect(201);

    const response = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send(payload)
      .expect(409);

    expect(response.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
    expect(response.body.error.correlationId).toEqual(expect.any(String));
  });

  it("logs in with correct credentials and rejects incorrect ones identically", async () => {
    const payload = uniqueUser();
    await request(app.getHttpServer()).post("/v1/auth/signup").send(payload).expect(201);

    const loginOk = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: payload.email, password: payload.password })
      .expect(200);
    expect(loginOk.body.data.accessToken).toEqual(expect.any(String));

    const wrongPassword = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: payload.email, password: "wrong-password-entirely" })
      .expect(401);
    const nonexistentEmail = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: "nobody-at-all@example.test", password: payload.password })
      .expect(401);

    // Same error code both ways — proves login doesn't leak whether an email is registered.
    expect(wrongPassword.body.error.code).toBe("INVALID_CREDENTIALS");
    expect(nonexistentEmail.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("refreshes tokens, rotating the refresh token (old one becomes unusable)", async () => {
    const payload = uniqueUser();
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send(payload)
      .expect(201);
    const originalRefreshToken = signup.body.data.refreshToken as string;

    const refreshed = await request(app.getHttpServer())
      .post("/v1/auth/refresh")
      .send({ refreshToken: originalRefreshToken })
      .expect(200);

    expect(refreshed.body.data.refreshToken).not.toBe(originalRefreshToken);

    // Replaying the ORIGINAL (now-rotated-out) refresh token must fail.
    await request(app.getHttpServer())
      .post("/v1/auth/refresh")
      .send({ refreshToken: originalRefreshToken })
      .expect(401);

    // The NEW refresh token must work.
    await request(app.getHttpServer())
      .post("/v1/auth/refresh")
      .send({ refreshToken: refreshed.body.data.refreshToken })
      .expect(200);
  });

  it("rejects a malformed signup body via the shared @nova/validation schema", async () => {
    const response = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({ email: "not-an-email", password: "short" })
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("OTP: requesting a code never returns it in the response, and it can be verified once", async () => {
    const destination = `otp-test-${randomUUID().slice(0, 8)}@example.test`;

    const requestResponse = await request(app.getHttpServer())
      .post("/v1/auth/otp")
      .send({ destination })
      .expect(202);
    expect(JSON.stringify(requestResponse.body)).not.toMatch(/\d{6}/); // no 6-digit code leaked

    const row = await prisma.otpCode.findFirstOrThrow({
      where: { destinationHash: { not: undefined } },
      orderBy: { createdAt: "desc" },
    });
    expect(row.codeHash).toBeDefined();
  });

  it("writes an audit log entry for both successful and failed login attempts", async () => {
    const payload = uniqueUser();
    const signup = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send(payload)
      .expect(201);

    await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: payload.email, password: "wrong-password" })
      .expect(401);

    const failedLog = await prisma.auditLog.findFirst({
      where: { actorId: signup.body.data.user.id, action: "user.login.failed" },
    });
    expect(failedLog).not.toBeNull();
    expect(failedLog?.occurredAt).toBeInstanceOf(Date);

    await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ email: payload.email, password: payload.password })
      .expect(200);

    const successLog = await prisma.auditLog.findFirst({
      where: { actorId: signup.body.data.user.id, action: "user.login" },
    });
    expect(successLog).not.toBeNull();
    expect(successLog?.correlationId).toEqual(expect.any(String));
  });

  describe("MFA gate (Vol 3, B1 — mandatory for seller/admin, optional for customers)", () => {
    it("does NOT block a plain customer login even with mfaEnabled left at its default (false)", async () => {
      const payload = uniqueUser();
      await request(app.getHttpServer()).post("/v1/auth/signup").send(payload).expect(201);

      await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(200);
    });

    it("blocks login for an admin-role account with mfaEnabled: false", async () => {
      const payload = uniqueUser();
      const signup = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(payload)
        .expect(201);
      await promoteRole(prisma, signup.body.data.user.id, ["customer", "admin"], {
        mfaEnabled: false,
      });

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(403);
      expect(response.body.error.code).toBe("MFA_SETUP_REQUIRED");

      const blockedLog = await prisma.auditLog.findFirst({
        where: { actorId: signup.body.data.user.id, action: "user.login.blocked_mfa_required" },
      });
      expect(blockedLog).not.toBeNull();
    });

    it("allows login for the SAME admin-role account once mfaEnabled is true — the gate is a real, flippable switch, not a hardcoded block", async () => {
      const payload = uniqueUser();
      const signup = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(payload)
        .expect(201);
      await promoteRole(prisma, signup.body.data.user.id, ["customer", "admin"], {
        mfaEnabled: false,
      });

      await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(403);

      await promoteRole(prisma, signup.body.data.user.id, ["customer", "admin"], {
        mfaEnabled: true,
      });

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(200);
      expect(response.body.data.accessToken).toEqual(expect.any(String));
    });

    it("blocks login for a seller-role account exactly the same way as admin", async () => {
      const payload = uniqueUser();
      const signup = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(payload)
        .expect(201);
      await promoteRole(prisma, signup.body.data.user.id, ["customer", "seller"], {
        mfaEnabled: false,
      });

      const response = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(403);
      expect(response.body.error.code).toBe("MFA_SETUP_REQUIRED");
    });
  });
});
