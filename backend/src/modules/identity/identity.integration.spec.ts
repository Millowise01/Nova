import { randomUUID } from "node:crypto";

import { Logger } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { RedisService } from "../../common/redis/redis.service";
import { PrismaService } from "../../prisma/prisma.service";
import { createTestApp } from "../../test-utils/create-test-app";
import { promoteRole } from "../../test-utils/promote-role";
import { uniqueTestPhone } from "../../test-utils/users";

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
      phone: uniqueTestPhone(),
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

  it("rejects a duplicate signup with the same phone number, with a clean 409 rather than a 500", async () => {
    const first = uniqueUser();
    await request(app.getHttpServer()).post("/v1/auth/signup").send(first).expect(201);

    const second = uniqueUser();
    second.phone = first.phone;

    const response = await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send(second)
      .expect(409);

    expect(response.body.error.code).toBe("PHONE_ALREADY_REGISTERED");
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

  it("OTP: requesting a code never returns it in the response, and it can be verified exactly once", async () => {
    const destination = `otp-test-${randomUUID().slice(0, 8)}@example.test`;
    const debugSpy = jest.spyOn(Logger.prototype, "debug");

    const requestResponse = await request(app.getHttpServer())
      .post("/v1/auth/otp")
      .send({ destination })
      .expect(202);
    expect(JSON.stringify(requestResponse.body)).not.toMatch(/\d{6}/); // no 6-digit code leaked

    // The stub logs the code (Volume 5 SMS integration doesn't exist yet) — recover it the
    // same way a real test double for an SMS provider would, to prove the Redis-backed
    // round trip actually works end to end, not just that a 202 was returned.
    const loggedLine = debugSpy.mock.calls
      .map((call) => String(call[0]))
      .find((line) => line.includes(destination));
    const code = loggedLine?.match(/code for .*: (\d{6})/)?.[1];
    expect(code).toBeDefined();
    debugSpy.mockRestore();

    await request(app.getHttpServer())
      .post("/v1/auth/otp/verify")
      .send({ destination, code })
      .expect(200);

    // Single-use: Redis DEL on success means the same code can never be replayed.
    const replay = await request(app.getHttpServer())
      .post("/v1/auth/otp/verify")
      .send({ destination, code })
      .expect(400);
    expect(replay.body.error.code).toBe("OTP_INVALID_OR_EXPIRED");
  });

  describe("Password reset (W-10)", () => {
    // This block makes 6+ real calls to /auth/password/forgot and /auth/password/reset,
    // both rate-limited 5/60s per IP (RateLimitGuard keys by req.ip for unauthenticated
    // endpoints — every request in this test file comes from 127.0.0.1). Without this,
    // the block would spuriously trip its own limit partway through, the same concern
    // rate-limit.integration.spec.ts's beforeEach already documents and solves the same
    // way. Scoped to just this describe block: nothing later in the file depends on Redis
    // state carrying over from here.
    beforeEach(async () => {
      await app.get(RedisService).client.flushdb();
    });

    /** Recovers the code the OTP stub only ever logs (no real SMS provider exists yet —
     *  see otp.service.ts), the same technique the OTP test above uses, so this proves
     *  the real Redis-backed round trip, not just that a 202/200 was returned. */
    function recoverLoggedCode(destination: string, debugSpy: jest.SpyInstance) {
      const loggedLine = debugSpy.mock.calls
        .map((call) => String(call[0]))
        .find((line) => line.includes(destination));
      const code = loggedLine?.match(/code for .*: (\d{6})/)?.[1];
      expect(code).toBeDefined();
      return code as string;
    }

    it("resets a real user's password via phone + OTP, and the old password stops working", async () => {
      const payload = uniqueUser();
      await request(app.getHttpServer()).post("/v1/auth/signup").send(payload).expect(201);

      const debugSpy = jest.spyOn(Logger.prototype, "debug");
      const forgot = await request(app.getHttpServer())
        .post("/v1/auth/password/forgot")
        .send({ phone: payload.phone })
        .expect(202);
      expect(JSON.stringify(forgot.body)).not.toMatch(/\d{6}/); // never echoes the code
      expect(forgot.body.data.status).toBe("sent");

      const code = recoverLoggedCode(payload.phone, debugSpy);
      debugSpy.mockRestore();

      const newPassword = "a-brand-new-password-123";
      const reset = await request(app.getHttpServer())
        .post("/v1/auth/password/reset")
        .send({ phone: payload.phone, code, password: newPassword, confirmPassword: newPassword })
        .expect(200);
      expect(reset.body.data.status).toBe("reset");

      // The OLD password must no longer work...
      await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: payload.password })
        .expect(401);

      // ...and the NEW one must.
      const loginOk = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ email: payload.email, password: newPassword })
        .expect(200);
      expect(loginOk.body.data.accessToken).toEqual(expect.any(String));

      // Single-use: the same code cannot be replayed for a second reset.
      const replay = await request(app.getHttpServer())
        .post("/v1/auth/password/reset")
        .send({
          phone: payload.phone,
          code,
          password: "yet-another-password",
          confirmPassword: "yet-another-password",
        })
        .expect(400);
      expect(replay.body.error.code).toBe("OTP_INVALID_OR_EXPIRED");
    });

    it("rejects a wrong or expired OTP code with the same error the OTP endpoint uses", async () => {
      const payload = uniqueUser();
      await request(app.getHttpServer()).post("/v1/auth/signup").send(payload).expect(201);
      await request(app.getHttpServer())
        .post("/v1/auth/password/forgot")
        .send({ phone: payload.phone })
        .expect(202);

      const response = await request(app.getHttpServer())
        .post("/v1/auth/password/reset")
        .send({
          phone: payload.phone,
          code: "000000",
          password: "irrelevant-password",
          confirmPassword: "irrelevant-password",
        })
        .expect(400);
      expect(response.body.error.code).toBe("OTP_INVALID_OR_EXPIRED");
    });

    it("verifies the OTP before revealing whether an account exists for the phone", async () => {
      const phone = uniqueTestPhone(); // never signed up

      // A wrong code for a phone with NO account fails with the identical OTP error,
      // not some different "no account" error — nothing is revealed before the code checks out.
      const wrongCode = await request(app.getHttpServer())
        .post("/v1/auth/password/reset")
        .send({
          phone,
          code: "000000",
          password: "irrelevant-password-1",
          confirmPassword: "irrelevant-password-1",
        })
        .expect(400);
      expect(wrongCode.body.error.code).toBe("OTP_INVALID_OR_EXPIRED");

      // Only once the (real) code checks out does the "no account" case surface, as 404.
      const debugSpy = jest.spyOn(Logger.prototype, "debug");
      await request(app.getHttpServer())
        .post("/v1/auth/password/forgot")
        .send({ phone })
        .expect(202);
      const code = recoverLoggedCode(phone, debugSpy);
      debugSpy.mockRestore();

      const response = await request(app.getHttpServer())
        .post("/v1/auth/password/reset")
        .send({
          phone,
          code,
          password: "irrelevant-password-2",
          confirmPassword: "irrelevant-password-2",
        })
        .expect(404);
      expect(response.body.error.code).toBe("USER_NOT_FOUND");
    });

    it("rejects a malformed reset body via the shared @nova/validation schema", async () => {
      const response = await request(app.getHttpServer())
        .post("/v1/auth/password/reset")
        .send({ phone: "not-a-phone", code: "1", password: "short", confirmPassword: "different" })
        .expect(400);
      expect(response.body.error.code).toBe("VALIDATION_FAILED");
    });
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

  describe("Profile — GET/PATCH /v1/me", () => {
    async function signUp() {
      const payload = uniqueUser();
      const signup = await request(app.getHttpServer())
        .post("/v1/auth/signup")
        .send(payload)
        .expect(201);
      return { payload, accessToken: signup.body.data.accessToken as string };
    }

    it("requires auth", async () => {
      await request(app.getHttpServer()).get("/v1/me").expect(401);
    });

    it("persists name from signup's firstName+lastName (real bug fixed — previously discarded), and GET /me returns decrypted email/phone read-only", async () => {
      const { payload, accessToken } = await signUp();

      const response = await request(app.getHttpServer())
        .get("/v1/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.name).toBe(`${payload.firstName} ${payload.lastName}`);
      expect(response.body.data.email).toBe(payload.email);
      expect(response.body.data.phone).toBe(payload.phone);
      expect(response.body.data.locale).toBe("en");
      expect(response.body.data.roles).toEqual(["customer"]);
    });

    it("updates name and locale via PATCH", async () => {
      const { accessToken } = await signUp();

      const response = await request(app.getHttpServer())
        .patch("/v1/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "New Name", locale: "fr" })
        .expect(200);

      expect(response.body.data.name).toBe("New Name");
      expect(response.body.data.locale).toBe("fr");

      const refetched = await request(app.getHttpServer())
        .get("/v1/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(refetched.body.data.name).toBe("New Name");
    });

    it("cannot change email or phone through PATCH /me — those fields are silently stripped by the schema, not applied", async () => {
      const { payload, accessToken } = await signUp();

      await request(app.getHttpServer())
        .patch("/v1/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Still Allowed", email: "hijacked@example.test", phone: "+23299999999" })
        .expect(200);

      const response = await request(app.getHttpServer())
        .get("/v1/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      // name DID change (it was in the request); email/phone did NOT (schema strips them).
      expect(response.body.data.name).toBe("Still Allowed");
      expect(response.body.data.email).toBe(payload.email);
      expect(response.body.data.phone).toBe(payload.phone);
    });

    it("rejects an empty PATCH body — at least one field must be provided", async () => {
      const { accessToken } = await signUp();

      const response = await request(app.getHttpServer())
        .patch("/v1/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({})
        .expect(400);
      expect(response.body.error.code).toBe("VALIDATION_FAILED");
    });
  });
});
