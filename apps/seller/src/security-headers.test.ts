import { describe, expect, it } from "vitest";

import nextConfigExport from "../next.config";

// Next's config can be an object or (when wrapped by a plugin) a function returning one.
async function loadConfig() {
  const exported: unknown = nextConfigExport;
  return typeof exported === "function"
    ? await (exported as (phase: string, ctx: { defaultConfig: object }) => unknown)(
        "phase-production-build",
        { defaultConfig: {} },
      )
    : exported;
}

describe("next.config security headers", () => {
  it("sends the shared security headers on every route and hides X-Powered-By", async () => {
    const config = (await loadConfig()) as {
      poweredByHeader?: boolean;
      headers?: () => Promise<{ source: string; headers: { key: string; value: string }[] }[]>;
    };

    expect(config.poweredByHeader).toBe(false);
    const rules = (await config.headers?.()) ?? [];
    const allRoutes = rules.find((rule) => rule.source === "/:path*");
    expect(allRoutes).toBeDefined();

    const headers = Object.fromEntries((allRoutes?.headers ?? []).map((h) => [h.key, h.value]));
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toBe("frame-ancestors 'none'");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Strict-Transport-Security"]).toMatch(/max-age=\d+/);
  });
});
