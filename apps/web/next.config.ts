import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  transpilePackages: ["@nova/ui", "@nova/design-system", "@nova/utils", "@nova/constants"],
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;