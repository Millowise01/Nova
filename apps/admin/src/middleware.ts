import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sessionSchema } from "@nova/auth";

import { ADMIN_ROLE, COOKIE_KEYS } from "@/config/app";

// /forbidden must stay public too — otherwise a logged-in non-admin redirected
// there would be redirected right back to /forbidden, an infinite loop.
const PUBLIC_ROUTES = ["/login", "/forbidden"];

function parseSession(raw: string | undefined) {
  if (!raw) return null;
  try {
    return sessionSchema.parse(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return null;
  }
}

/** apps/admin's own guard — this app was never covered by apps/web's middleware
 *  (that guard's /admin path check was confirmed dead code and removed; there was
 *  never a real route tree under apps/web for it to protect). Every route here
 *  requires a session with the admin role, full stop — there's no sub-role
 *  distinction to gate on (backend/docs/05-security-baseline.md's disclosed gap).
 *
 *  Lives at src/middleware.ts, NOT apps/admin/middleware.ts — a real, verified-live
 *  finding: Next.js's dev-mode middleware discovery computes its search directory as
 *  path.join(appDir, '..') (next/dist/server/lib/router-utils/setup-dev-bundler.js),
 *  and appDir is src/app here, so a middleware.ts at the project root is silently
 *  never discovered (middleware-manifest.json stays `{}` forever, no error, no
 *  warning). Confirmed live via a diagnostic console.log watched in real dev-server
 *  stdout, and by elimination against an isolated non-monorepo Next.js app (which
 *  DOES discover a root-level middleware.ts, because its app/ has no src/ ancestor).
 *  apps/web has the identical bug — see that middleware.ts's own note. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const rawSession = request.cookies.get(COOKIE_KEYS.session)?.value;
  const session = parseSession(rawSession);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!session.roles.includes(ADMIN_ROLE)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
