// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import * as middleware from "./middleware";

import * as root from "./index";

/**
 * The root entry is imported by client components. The middleware entry imports `next/server`,
 * which belongs to the Edge runtime, so it must not be reachable from the root: anything exported
 * from there ends up in every client bundle that imports `@nova/app-shell`.
 */
describe("@nova/app-shell entry points", () => {
  it("the root entry does not export the middleware", () => {
    expect(root).not.toHaveProperty("createRoleGuard");
  });

  it("the middleware entry exports it", () => {
    expect(middleware).toHaveProperty("createRoleGuard");
  });

  it("the root entry exports the providers and the browser helpers", () => {
    for (const name of [
      "ThemeProvider",
      "ToastProvider",
      "useQueryClientInstance",
      "sanitizeRedirect",
      "decodeJwtPayload",
      "writeSessionCookie",
    ]) {
      expect(root).toHaveProperty(name);
    }
  });

  it("declares both entry points, and no side effects, in package.json", () => {
    const manifest = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8")) as {
      exports: Record<string, string>;
      sideEffects: boolean;
    };
    expect(manifest.exports["."]).toBe("./src/index.ts");
    expect(manifest.exports["./middleware"]).toBe("./src/middleware.ts");
    expect(manifest.sideEffects).toBe(false);
  });
});
