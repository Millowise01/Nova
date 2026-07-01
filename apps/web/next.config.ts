import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@nova/ui", "@nova/design-system", "@nova/utils", "@nova/constants"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;