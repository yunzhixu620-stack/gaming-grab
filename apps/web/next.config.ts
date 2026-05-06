import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static export for GitHub Pages
  output: "export",

  // API proxy only works in dev mode (not in static export)
  // In production, frontend calls backend URL directly via NEXT_PUBLIC_API_URL
  ...(process.env.NODE_ENV !== "production"
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
            },
          ];
        },
      }
    : {}),

  // GitHub Pages base path (set via env or leave empty for root)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  // Images: allow external images (for static export compatibility)
  images: { unoptimized: true },
};

export default nextConfig;
