import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow LAN phone access during `next dev` (Next.js 16 blocks cross-origin /_next by default)
  allowedDevOrigins: [
    "192.168.1.101",
    "192.168.176.1",
    "localhost",
    "127.0.0.1",
  ],
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
