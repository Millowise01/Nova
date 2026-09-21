import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Session } from "@nova/auth";

import {
  clearSessionCookie,
  parseSessionCookieValue,
  readCookie,
  writeSessionCookie,
} from "./session-cookie";

const session: Session = {
  userId: "user-1",
  roles: ["seller"],
  expiresAt: "2030-01-01T00:00:00.000Z",
};

function wipeCookies() {
  for (const entry of document.cookie.split("; ")) {
    const name = entry.split("=")[0];
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  }
}

describe("parseSessionCookieValue", () => {
  const encoded = (value: unknown) => encodeURIComponent(JSON.stringify(value));

  it("parses a URL-encoded session", () => {
    expect(parseSessionCookieValue(encoded(session))).toEqual(session);
  });

  it("defaults roles to an empty list", () => {
    const withoutRoles = { userId: session.userId, expiresAt: session.expiresAt };
    expect(parseSessionCookieValue(encoded(withoutRoles))?.roles).toEqual([]);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["empty", ""],
    ["not JSON", encodeURIComponent("nope")],
    ["bad percent-encoding", "%E0%A4%A"],
    ["wrong shape", encoded({ userId: "", roles: [], expiresAt: "x" })],
    ["a string instead of an object", encoded("admin")],
  ])("returns null for %s", (_name, raw) => {
    expect(parseSessionCookieValue(raw)).toBeNull();
  });
});

describe("session cookie in the browser", () => {
  beforeEach(wipeCookies);
  afterEach(() => vi.restoreAllMocks());

  it("writes under the key it is given and reads it back", () => {
    writeSessionCookie("nova_seller_session", session);
    expect(parseSessionCookieValue(readCookie("nova_seller_session"))).toEqual(session);
  });

  it("keeps two apps' sessions apart", () => {
    writeSessionCookie("nova_seller_session", session);
    expect(readCookie("nova_admin_session")).toBeNull();
  });

  it("writes a day-long, same-site cookie available on every path", () => {
    const set = vi.spyOn(document, "cookie", "set");
    writeSessionCookie("nova_session", session);
    const written = String(set.mock.calls[0]?.[0]);
    expect(written).toContain("nova_session=");
    expect(written).toContain("path=/");
    expect(written).toContain("max-age=86400");
    expect(written).toContain("SameSite=Lax");
  });

  it("refuses to write something that is not a valid session", () => {
    expect(() =>
      writeSessionCookie("nova_session", { userId: "" } as unknown as Session),
    ).toThrow();
    expect(readCookie("nova_session")).toBeNull();
  });

  it("clears only the named cookie", () => {
    writeSessionCookie("nova_seller_session", session);
    writeSessionCookie("nova_admin_session", session);
    clearSessionCookie("nova_seller_session");
    expect(readCookie("nova_seller_session")).toBeNull();
    expect(readCookie("nova_admin_session")).not.toBeNull();
  });

  it("readCookie does not match a cookie whose name merely ends the same way", () => {
    document.cookie = "x_nova_session=other; path=/";
    expect(readCookie("nova_session")).toBeNull();
  });
});
