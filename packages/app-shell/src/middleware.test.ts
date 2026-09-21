// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import type { Session } from "@nova/auth";

import { createRoleGuard } from "./middleware";

const session = (roles: string[]): Session => ({
  userId: "user-1",
  roles,
  expiresAt: "2030-01-01T00:00:00.000Z",
});

function request(path: string, cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return new NextRequest(`http://localhost:3001${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

const encoded = (value: unknown) => encodeURIComponent(JSON.stringify(value));

const guard = createRoleGuard({ sessionCookieKey: "nova_seller_session", requiredRole: "seller" });

function redirectTarget(response: Response) {
  expect(response.status).toBe(307);
  return response.headers.get("location");
}

function passesThrough(response: Response) {
  return response.headers.get("x-middleware-next") === "1";
}

describe("createRoleGuard", () => {
  it("lets a session with the required role through", () => {
    const response = guard(
      request("/orders", { nova_seller_session: encoded(session(["seller"])) }),
    );
    expect(passesThrough(response)).toBe(true);
  });

  it("accepts the role among several", () => {
    const response = guard(
      request("/orders", { nova_seller_session: encoded(session(["customer", "seller"])) }),
    );
    expect(passesThrough(response)).toBe(true);
  });

  it("sends a signed-out visitor to the login page, remembering where they were going", () => {
    expect(redirectTarget(guard(request("/orders")))).toBe(
      "http://localhost:3001/login?redirect=%2Forders",
    );
  });

  it("treats an unreadable session cookie as signed out", () => {
    for (const value of ["garbage", encoded({ userId: "" }), encoded("seller")]) {
      expect(redirectTarget(guard(request("/orders", { nova_seller_session: value })))).toContain(
        "/login?redirect=",
      );
    }
  });

  it("sends a signed-in user without the role to /forbidden", () => {
    const response = guard(
      request("/orders", { nova_seller_session: encoded(session(["customer"])) }),
    );
    expect(redirectTarget(response)).toBe("http://localhost:3001/forbidden");
  });

  it("does not accept a session stored under another app's cookie name", () => {
    const response = guard(
      request("/orders", { nova_admin_session: encoded(session(["seller"])) }),
    );
    expect(redirectTarget(response)).toContain("/login?redirect=");
  });

  it.each(["/login", "/forbidden", "/login/reset", "/forbidden/"])(
    "leaves %s public, or the redirect would loop",
    (path) => {
      expect(passesThrough(guard(request(path)))).toBe(true);
    },
  );

  it.each(["/login-history", "/loginx", "/forbidden-area", "/forbiddenness"])(
    "does not make %s public just because its name starts with a public route",
    (path) => {
      expect(redirectTarget(guard(request(path)))).toContain("/login?redirect=");
    },
  );

  it("takes its paths from configuration", () => {
    const custom = createRoleGuard({
      sessionCookieKey: "k",
      requiredRole: "admin",
      loginPath: "/sign-in",
      forbiddenPath: "/no-access",
      publicRoutes: ["/sign-in", "/no-access", "/health"],
    });
    expect(passesThrough(custom(request("/health")))).toBe(true);
    expect(redirectTarget(custom(request("/orders")))).toBe(
      "http://localhost:3001/sign-in?redirect=%2Forders",
    );
    expect(redirectTarget(custom(request("/orders", { k: encoded(session(["seller"])) })))).toBe(
      "http://localhost:3001/no-access",
    );
  });
});
