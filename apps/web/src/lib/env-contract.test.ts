import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Regression test for a real bug: .env.example previously set
// NEXT_PUBLIC_API_BASE_URL to http://localhost:4000/api, but the backend's
// actual global route prefix is "v1" (backend/src/main.ts —
// `app.setGlobalPrefix("v1")`), not "api". @nova/config's environmentSchema
// only checks `.url()` — both "/api" and "/v1" pass that check equally, so it
// couldn't have caught this. This test reads the checked-in .env.example
// directly so a future prefix drift fails CI instead of silently breaking
// every request again.
const BACKEND_GLOBAL_PREFIX = "v1"; // must match backend/src/main.ts's app.setGlobalPrefix(...)

function readEnvExample(): Record<string, string> {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env.example");
  const content = fs.readFileSync(filePath, "utf-8");
  const entries: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key) entries[key] = rest.join("=");
  }

  return entries;
}

describe(".env.example NEXT_PUBLIC_API_BASE_URL", () => {
  it(`ends with the backend's real global prefix ("/${BACKEND_GLOBAL_PREFIX}")`, () => {
    const env = readEnvExample();
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_API_BASE_URL?.endsWith(`/${BACKEND_GLOBAL_PREFIX}`)).toBe(true);
  });

  it("is a syntactically valid URL (matches @nova/config's environmentSchema check)", () => {
    const env = readEnvExample();
    expect(() => new URL(env.NEXT_PUBLIC_API_BASE_URL ?? "")).not.toThrow();
  });
});
