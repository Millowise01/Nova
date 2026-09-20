import { randomUUID } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { createTestApp } from "../../test-utils/create-test-app";
import { RedisService } from "../redis/redis.service";

/**
 * Dedicated, isolated proof that RateLimitGuard actually rejects requests over the
 * configured threshold — not just that the decorator/guard classes exist and compile.
 * Uses the OTP endpoint (limit 5/60s, backend/src/modules/identity/http/auth.controller.ts)
 * since it's the tightest limit in the system, so tripping it deliberately takes the
 * fewest requests and this test doesn't need special-casing around the same volume
 * concerns the other integration suites have (see create-test-app.ts's Redis-flush comment).
 */
describe("RateLimitGuard (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  // Per-test isolation (not just per-file) — this suite specifically exercises the
  // limiter's own boundary, so each test needs to start from zero requests used.
  beforeEach(async () => {
    await app.get(RedisService).client.flushdb();
  });

  it("allows requests up to the limit, then rejects the next one with 429", async () => {
    const destination = `ratelimit-test-${randomUUID().slice(0, 8)}@example.test`;

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post("/v1/auth/otp").send({ destination }).expect(202);
    }

    const sixth = await request(app.getHttpServer())
      .post("/v1/auth/otp")
      .send({ destination })
      .expect(429);
    expect(sixth.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("limits OTP verification attempts so a 6-digit code cannot be brute-forced", async () => {
    const destination = `ratelimit-verify-${randomUUID().slice(0, 8)}@example.test`;

    for (let i = 0; i < 5; i++) {
      const guess = await request(app.getHttpServer())
        .post("/v1/auth/otp/verify")
        .send({ destination, code: "000000" })
        .expect(400);
      expect(guess.body.error.code).toBe("OTP_INVALID_OR_EXPIRED");
    }

    const sixth = await request(app.getHttpServer())
      .post("/v1/auth/otp/verify")
      .send({ destination, code: "000000" })
      .expect(429);
    expect(sixth.body.error.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("scopes limits per-endpoint — hitting the OTP limit doesn't affect signup", async () => {
    const destination = `ratelimit-scope-test-${randomUUID().slice(0, 8)}@example.test`;
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).post("/v1/auth/otp").send({ destination }).expect(202);
    }
    await request(app.getHttpServer()).post("/v1/auth/otp").send({ destination }).expect(429);

    // A completely different endpoint, same IP, is unaffected.
    const suffix = randomUUID().slice(0, 8);
    await request(app.getHttpServer())
      .post("/v1/auth/signup")
      .send({
        firstName: "Rate",
        lastName: "Limit",
        email: `unaffected-${suffix}@example.test`,
        phone: `+2327400${suffix.slice(0, 4)}`,
        password: "correct-horse-battery-staple",
        confirmPassword: "correct-horse-battery-staple",
      })
      .expect(201);
  });
});
