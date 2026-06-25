import { NextResponse, type NextRequest } from "next/server";

const protectedMatchers = {
  user: ["/account", "/checkout", "/orders"],
  seller: ["/seller"],
  admin: ["/admin"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("nova_role")?.value ?? "guest";
  const token = request.cookies.get("nova_token")?.value;

  if (protectedMatchers.user.some((prefix) => pathname.startsWith(prefix)) && !token) {
    return NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  if (pathname.startsWith("/seller") && role !== "seller" && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login?scope=seller", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login?scope=admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/orders/:path*", "/seller/:path*", "/admin/:path*"],
};
