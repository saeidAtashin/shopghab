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
  async redirects() {
    return [
      { source: "/services", destination: "/cases", permanent: true },
      { source: "/services/:path*", destination: "/cases", permanent: true },
      { source: "/consoles", destination: "/cases", permanent: true },
      { source: "/consoles/:path*", destination: "/cases", permanent: true },
      { source: "/issues", destination: "/faq", permanent: true },
      { source: "/issues/:path*", destination: "/faq", permanent: true },
      { source: "/repair", destination: "/custom", permanent: true },
      { source: "/shop", destination: "/cases", permanent: true },
      { source: "/shop/:path*", destination: "/cases", permanent: true },
    ];
  },
};

export default nextConfig;
