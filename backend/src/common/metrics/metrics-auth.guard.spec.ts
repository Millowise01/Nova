import type { ExecutionContext } from "@nestjs/common";

import type { AppConfigService } from "../../config/config.service";
import type { Env } from "../../config/env.schema";
import { NotFoundError, UnauthorizedError } from "../errors/api-error";

import { MetricsAuthGuard } from "./metrics-auth.guard";

const TOKEN = "a".repeat(40);

function makeGuard(env: Partial<Pick<Env, "METRICS_TOKEN" | "NODE_ENV">>) {
  const config = { get: (key: keyof Env) => env[key as "METRICS_TOKEN" | "NODE_ENV"] };
  return new MetricsAuthGuard(config as unknown as AppConfigService);
}

function contextWith(authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
  } as unknown as ExecutionContext;
}

function statusOf(fn: () => unknown): number | undefined {
  try {
    fn();
  } catch (err) {
    return (err as { getStatus?: () => number }).getStatus?.();
  }
  return undefined;
}

describe("MetricsAuthGuard", () => {
  describe("METRICS_TOKEN not configured", () => {
    it("is disabled (404) in production, so /metrics looks like it does not exist", () => {
      const guard = makeGuard({ NODE_ENV: "production" });
      expect(() => guard.canActivate(contextWith())).toThrow(NotFoundError);
      expect(statusOf(() => guard.canActivate(contextWith()))).toBe(404);
    });

    it("stays open in development and test so local scraping keeps working", () => {
      expect(makeGuard({ NODE_ENV: "development" }).canActivate(contextWith())).toBe(true);
      expect(makeGuard({ NODE_ENV: "test" }).canActivate(contextWith())).toBe(true);
    });

    it("does not treat a supplied Authorization header as a way around the production 404", () => {
      const guard = makeGuard({ NODE_ENV: "production" });
      expect(() => guard.canActivate(contextWith(`Bearer ${TOKEN}`))).toThrow(NotFoundError);
    });
  });

  describe("METRICS_TOKEN configured", () => {
    it.each(["development", "test", "production"] as const)(
      "accepts the correct bearer token in %s",
      (NODE_ENV) => {
        const guard = makeGuard({ NODE_ENV, METRICS_TOKEN: TOKEN });
        expect(guard.canActivate(contextWith(`Bearer ${TOKEN}`))).toBe(true);
      },
    );

    it("accepts the scheme case-insensitively", () => {
      const guard = makeGuard({ NODE_ENV: "production", METRICS_TOKEN: TOKEN });
      expect(guard.canActivate(contextWith(`bearer ${TOKEN}`))).toBe(true);
    });

    it("rejects a missing Authorization header with 401", () => {
      const guard = makeGuard({ NODE_ENV: "development", METRICS_TOKEN: TOKEN });
      expect(() => guard.canActivate(contextWith())).toThrow(UnauthorizedError);
      expect(statusOf(() => guard.canActivate(contextWith()))).toBe(401);
    });

    it.each([
      ["a wrong token", `Bearer ${"b".repeat(40)}`],
      ["a token of a different length", "Bearer short"],
      ["a truncated token", `Bearer ${TOKEN.slice(0, -1)}`],
      ["a non-bearer scheme", `Basic ${TOKEN}`],
      ["the scheme with no token", "Bearer"],
      ["the bare token with no scheme", TOKEN],
    ])("rejects %s with 401", (_label, header) => {
      const guard = makeGuard({ NODE_ENV: "production", METRICS_TOKEN: TOKEN });
      expect(() => guard.canActivate(contextWith(header))).toThrow(UnauthorizedError);
      expect(statusOf(() => guard.canActivate(contextWith(header)))).toBe(401);
    });
  });
});
