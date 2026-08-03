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

    // Role-based guard: seller/admin routes redirect customers to forbidden
    const isSellerRoute = pathnameWithoutLocale.startsWith("/seller");
    const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");
    const roles: string[] = session.roles ?? [];

    if (isSellerRoute && !roles.includes("seller") && !roles.includes("admin")) {
      return NextResponse.redirect(new URL(`/${locale}${ROUTES.forbidden}`, request.url));
    }

    if (isAdminRoute && !roles.includes("admin")) {
      return NextResponse.redirect(new URL(`/${locale}${ROUTES.forbidden}`, request.url));
    }
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
