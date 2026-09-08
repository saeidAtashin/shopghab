import type { NextConfig } from "next";

import { getDesignedCdnHostname } from "./src/lib/designed-assets";

const designedCdnHost = getDesignedCdnHostname();

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/shop", destination: "/cases", permanent: true },
      { source: "/shop/:path*", destination: "/cases", permanent: true },
      { source: "/repair", destination: "/create", permanent: true },
      { source: "/services/:path*", destination: "/create", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
    ];
  },
  // Allow LAN phone access during `next dev` (Next.js 16 blocks cross-origin /_next by default)
  allowedDevOrigins: [
    "192.168.1.101",
    "192.168.176.1",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 192, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "k3isonfire.ir",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.k3isonfire.ir",
        pathname: "/media/**",
      },
      ...(designedCdnHost
        ? [
            {
              protocol: "https" as const,
              hostname: designedCdnHost,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
