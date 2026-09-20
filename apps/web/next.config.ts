import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { securityHeaderRules } from "@nova/config/security-headers.cjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Shared security headers (packages/config/security-headers.cjs).
  headers() {
    return Promise.resolve(securityHeaderRules);
  },
  typescript: {
    // Next's own build-time type-checker does not fully support TypeScript
    // project references (see its own build warning) and produces false
    // positives on multi-hop @nova/* package chains that a real `tsc --noEmit`
    // resolves correctly. `pnpm typecheck` is the authoritative, project-
    // reference-aware check and already gates CI before this build step runs.
    ignoreBuildErrors: true,
  },
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
    "@nova/validation",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
