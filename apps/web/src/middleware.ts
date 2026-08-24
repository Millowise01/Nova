import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { sessionSchema } from "@nova/auth";

import { LOCALES, DEFAULT_LOCALE, COOKIE_KEYS, RTL_LOCALES } from "@/config/app";
import { PROTECTED_ROUTES, ROUTES } from "@/config/routes";

const intlMiddleware = createIntlMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split("/")[1];
  return (LOCALES as readonly string[]).includes(segment) ? segment : DEFAULT_LOCALE;
}

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fr|ar)/, "") || "/";
}

function parseSession(raw: string | undefined) {
  if (!raw) return null;
  try {
    return sessionSchema.parse(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return null;
  }
}

/** Lives at src/middleware.ts, NOT apps/web/middleware.ts — a real, verified-live
 *  finding (found while building apps/admin, backend/docs/10's admin-portal work):
 *  Next.js's dev-mode middleware discovery computes its search directory as
 *  path.join(appDir, '..') (next/dist/server/lib/router-utils/setup-dev-bundler.js),
 *  and appDir is src/app here, so a middleware.ts at the project root was silently
 *  never discovered — middleware-manifest.json stayed `{}` with no error and no
 *  warning. This means BOTH the auth-redirect guard below AND next-intl's locale
 *  routing/detection had never actually been executing. Confirmed via a diagnostic
 *  console.log watched in real dev-server stdout, and by elimination against an
 *  isolated non-monorepo Next.js app (which DOES discover a root-level middleware.ts,
 *  because its app/ has no src/ ancestor). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameWithoutLocale = stripLocale(pathname);
  const locale = getLocaleFromPathname(pathname);

  const isProtected = (PROTECTED_ROUTES as readonly string[]).some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  if (isProtected) {
    const rawSession = request.cookies.get(COOKIE_KEYS.session)?.value;
    const session = parseSession(rawSession);

    if (!session) {
      const loginUrl = new URL(`/${locale}${ROUTES.login}`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // A role-based /seller and /admin guard used to live here. Removed — confirmed dead
    // code: apps/web/src/config/routes.ts has no seller/admin entries and there's no
    // such route tree under apps/web/src/app/[locale]/. Seller and admin experiences
    // are their own separate Next.js apps (apps/seller, apps/admin), each with its own
    // middleware, not sub-routes of apps/web.
  }

  // Inject RTL hint header for server components
  const response = intlMiddleware(request);
  if (RTL_LOCALES.includes(locale as (typeof RTL_LOCALES)[number])) {
    response.headers.set("x-nova-dir", "rtl");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|offline|.*\\..*).*)"],
};
