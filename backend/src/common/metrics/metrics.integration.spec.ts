import { randomBytes } from "node:crypto";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { createTestApp } from "../../test-utils/create-test-app";

/**
 * Proves GET /metrics is actually protected on the real, fully-wired route — not just
 * that MetricsAuthGuard behaves in isolation (metrics-auth.guard.spec.ts covers every
 * branch, including the production-disabled 404, which can't be reached here because the
 * test environment is NODE_ENV=test).
 */
describe("GET /metrics (integration)", () => {
  const token = randomBytes(24).toString("hex"); // 48 chars, satisfies the 32-char minimum
  let app: INestApplication;
  let previousToken: string | undefined;

  beforeAll(async () => {
    // AppConfigService parses process.env once at construction, so set the token first.
    previousToken = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = token;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
    if (previousToken === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = previousToken;
  });

  it("rejects a request with no credentials (401) and leaks no metrics", async () => {
    const res = await request(app.getHttpServer()).get("/metrics").expect(401);
    expect(res.text).not.toContain("process_cpu_user_seconds_total");
  });

  it("rejects a wrong token (401)", async () => {
    await request(app.getHttpServer())
      .get("/metrics")
      .set("Authorization", `Bearer ${randomBytes(24).toString("hex")}`)
      .expect(401);
  });

  it("rejects a non-bearer scheme carrying the right token (401)", async () => {
    await request(app.getHttpServer())
      .get("/metrics")
      .set("Authorization", `Basic ${token}`)
      .expect(401);
  });

  it("serves Prometheus text format with the correct bearer token", async () => {
    const res = await request(app.getHttpServer())
      .get("/metrics")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.text).toContain("process_cpu_user_seconds_total");
    expect(res.text).toContain("http_request_duration_seconds");
  });

  it("is served at the root /metrics only, not under the /v1 prefix", async () => {
    await request(app.getHttpServer())
      .get("/v1/metrics")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
});
