import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseSessionCookieValue } from "./session-cookie";

// Re-exported so an app whose middleware does more than a role check (web adds locale routing) can
// still parse the session cookie without importing the root entry, which carries React code.
export { parseSessionCookieValue };

export type RoleGuardOptions = {
  /** The cookie the app stores its session in. Each app has its own. */
  sessionCookieKey: string;
  /** The role a session must carry to use the app at all. */
  requiredRole: string;
  loginPath?: string;
  forbiddenPath?: string;
  /** Paths that need no session. Must include the login and forbidden pages, or redirects loop. */
  publicRoutes?: string[];
};

const isUnder = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(route.endsWith("/") ? route : `${route}/`);

/**
 * Builds a Next.js middleware function that keeps everything except the public routes behind a
 * session holding `requiredRole`. This is a navigation guard, not an authorization boundary: the
 * session cookie is written by the browser, so the backend re-checks every request itself.
 *
 * An app's own `middleware.ts` calls this and exports its own `config.matcher`, which Next.js needs
 * to be a static literal in that file.
 */
export function createRoleGuard({
  sessionCookieKey,
  requiredRole,
  loginPath = "/login",
  forbiddenPath = "/forbidden",
  publicRoutes = [loginPath, forbiddenPath],
}: RoleGuardOptions) {
  return function roleGuard(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Prefix matching on the raw string would also expose "/login-history"; match whole segments.
    if (publicRoutes.some((route) => isUnder(pathname, route))) {
      return NextResponse.next();
    }

    const session = parseSessionCookieValue(request.cookies.get(sessionCookieKey)?.value);

    if (!session) {
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!session.roles.includes(requiredRole)) {
      return NextResponse.redirect(new URL(forbiddenPath, request.url));
    }

    return NextResponse.next();
  };
}
