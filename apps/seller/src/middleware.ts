import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sessionSchema } from "@nova/auth";

import { COOKIE_KEYS, SELLER_ROLE } from "@/config/app";

// /forbidden must stay public too — otherwise a logged-in non-seller redirected
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

/** apps/seller's own guard, copied from apps/admin/src/middleware.ts's proven
 *  pattern (same JWT-role gate, same PUBLIC_ROUTES shape) — every route here
 *  requires a session with the seller role, full stop.
 *
 *  Lives at src/middleware.ts, NOT apps/seller/middleware.ts — same real,
 *  verified-live finding documented in apps/admin's and apps/web's
 *  middleware.ts: Next.js's dev-mode middleware discovery computes its search
 *  directory as path.join(appDir, '..'), and appDir is src/app here, so a
 *  middleware.ts at the project root is silently never discovered. */
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

  if (!session.roles.includes(SELLER_ROLE)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
