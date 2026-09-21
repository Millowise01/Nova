import { describe, expect, it } from "vitest";

import { sanitizeRedirect } from "./redirect";

// `redirect` arrives in a URL query parameter an attacker can craft the login link with, and the
// app then navigates to it after sign-in. Only a same-origin path may survive.

const SAME_ORIGIN_PATHS = [
  "/",
  "/orders",
  "/orders?tab=open",
  "/orders/abc123#details",
  "/disputes/abc123",
  "/search?q=a%2Fb",
];

const OTHER_ORIGIN_OR_MALFORMED: [string, string | null | undefined][] = [
  ["null", null],
  ["undefined", undefined],
  ["empty", ""],
  ["relative without slash", "orders"],
  ["protocol-relative", "//evil.com"],
  ["protocol-relative with path", "//evil.com/orders"],
  ["absolute https URL", "https://evil.com"],
  ["absolute http URL", "http://evil.com/orders"],
  ["javascript scheme", "javascript:alert(1)"],
  ["data scheme", "data:text/html,<script>alert(1)</script>"],
  // The URL parser treats a backslash as a slash, and drops tabs and newlines, so each of these
  // reads as "//evil.com" to a browser although none starts with "//".
  ["backslash", "/\\evil.com"],
  ["slash then backslash", "/\\/evil.com"],
  ["tab between slashes", "/\t/evil.com"],
  ["newline between slashes", "/\n/evil.com"],
  ["carriage return between slashes", "/\r/evil.com"],
  ["other control character", "/\u0001/evil.com"],
  ["leading whitespace", " /orders"],
  ["embedded space", "/ /evil.com"],
];

describe("sanitizeRedirect", () => {
  it.each(SAME_ORIGIN_PATHS)("keeps the same-origin path %s unchanged", (path) => {
    expect(sanitizeRedirect(path)).toBe(path);
  });

  it.each(OTHER_ORIGIN_OR_MALFORMED)("falls back for %s", (_name, value) => {
    expect(sanitizeRedirect(value)).toBe("/");
  });

  it("falls back to the destination the caller names", () => {
    expect(sanitizeRedirect("https://evil.com", "/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirect(null, "/dashboard")).toBe("/dashboard");
  });

  it("never returns something a browser would resolve to another origin", () => {
    for (const [, value] of OTHER_ORIGIN_OR_MALFORMED) {
      const result = sanitizeRedirect(value);
      expect(new URL(result, "https://app.example").origin).toBe("https://app.example");
    }
  });
});
