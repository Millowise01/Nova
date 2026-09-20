import type { NextConfig } from "next";

import { securityHeaderRules } from "@nova/config/security-headers.cjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Shared security headers (packages/config/security-headers.cjs).
  headers() {
    return Promise.resolve(securityHeaderRules);
  },
  transpilePackages: ["@nova/ui", "@nova/design-system", "@nova/utils", "@nova/tailwind-config"],
};

export default nextConfig;
