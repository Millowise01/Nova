import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPaths = ["/account", "/checkout", "/wallet", "/orders", "/settings", "/notifications"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("nova_session")?.value;

  if (protectedPaths.some((segment) => pathname.startsWith(segment)) && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/wallet/:path*", "/orders/:path*", "/settings/:path*", "/notifications/:path*"]
};
