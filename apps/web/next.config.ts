import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes requires all Link hrefs to be statically typed — incompatible with
  // dynamic locale-prefixed routing. Re-enable once next-intl typed routes are supported.
  // typedRoutes: true,
  transpilePackages: [
    "@nova/ui",
    "@nova/design-system",
    "@nova/utils",
    "@nova/constants",
    "@nova/auth",
    "@nova/analytics",
    "@nova/config",
    "@nova/types",
  ],
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

export default withNextIntl(nextConfig);