import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_ROUTES = ["/account", "/cart", "/checkout", "/orders", "/comparison", "/recently-viewed"];
const SELLER_ROUTES = ["/seller/dashboard", "/seller/products", "/seller/inventory", "/seller/orders", "/seller/coupons", "/seller/analytics", "/seller/messages", "/seller/disputes"];
const ADMIN_ROUTES = ["/admin"];

function getCookie(req: NextRequest, name: string): string | undefined {
  return req.cookies.get(name)?.value;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = getCookie(req, "nova_token");
  const role = getCookie(req, "nova_role") ?? "guest";

  const isCustomerRoute = CUSTOMER_ROUTES.some((r) => pathname.startsWith(r));
  const isSellerRoute = SELLER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  const loginUrl = new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url);

  if ((isCustomerRoute || isSellerRoute || isAdminRoute) && !token) {
    return NextResponse.redirect(loginUrl);
  }

  if (isSellerRoute && role !== "seller" && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/cart",
    "/checkout/:path*",
    "/orders/:path*",
    "/comparison",
    "/recently-viewed",
    "/seller/dashboard",
    "/seller/products",
    "/seller/inventory",
    "/seller/orders",
    "/seller/coupons",
    "/seller/analytics",
    "/seller/messages",
    "/seller/disputes",
    "/admin/:path*",
  ],
};
