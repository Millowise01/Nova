import { Controller, Get, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../app.module";
import { createTestApp } from "../../test-utils/create-test-app";

import { applySecurityHeaders } from "./security-headers";

/** A response that is not JSON-API-safe must never be rendered, framed or sniffed. */
function expectApiSecurityHeaders(headers: Record<string, string | undefined>) {
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["strict-transport-security"]).toMatch(/max-age=\d+/);
  expect(headers["cross-origin-resource-policy"]).toBeDefined();
  expect(headers["x-powered-by"]).toBeUndefined();

  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
}

describe("Security headers (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  it("sets the API security headers on a successful public response", async () => {
    const response = await request(app.getHttpServer()).get("/v1/categories").expect(200);
    expectApiSecurityHeaders(response.headers);
  });

  it("sets them on an authentication failure (401) too", async () => {
    const response = await request(app.getHttpServer()).get("/v1/me").expect(401);
    expectApiSecurityHeaders(response.headers);
  });

  it("sets them on an unknown route (404) too", async () => {
    const response = await request(app.getHttpServer()).get("/v1/does-not-exist").expect(404);
    expectApiSecurityHeaders(response.headers);
  });

  it("does not disable CORS: an allowed origin still gets its CORS headers alongside them", async () => {
    const origin = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000")
      .split(",")[0]
      .trim();
    const response = await request(app.getHttpServer())
      .get("/v1/categories")
      .set("Origin", origin)
      .expect(200);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expectApiSecurityHeaders(response.headers);
  });
});

@Controller()
class ProbeController {
  @Get("docs")
  docs() {
    return "ui";
  }

  @Get("docs/index.html")
  docsAsset() {
    return "asset";
  }

  @Get("docs-json")
  docsJson() {
    return { openapi: "3.0.0" };
  }

  @Get("v1/thing")
  thing() {
    return { ok: true };
  }
}

describe("Security headers — the Swagger UI path gets the only relaxed policy", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [ProbeController] }).compile();
    app = moduleRef.createNestApplication();
    applySecurityHeaders(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("lets /docs and below it load same-origin scripts and inline styles — never inline scripts — and still forbids framing", async () => {
    for (const path of ["/docs", "/docs/index.html"]) {
      const response = await request(app.getHttpServer()).get(path).expect(200);
      const csp = response.headers["content-security-policy"];
      expect(csp).toContain("script-src 'self';");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    }
  });

  it("keeps the strict policy on API paths and on /docs-json (not a Swagger UI path)", async () => {
    for (const path of ["/v1/thing", "/docs-json"]) {
      const response = await request(app.getHttpServer()).get(path).expect(200);
      expectApiSecurityHeaders(response.headers);
      expect(response.headers["content-security-policy"]).not.toContain("unsafe-inline");
    }
  });
});
