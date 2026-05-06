import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Lightweight config — this machine has resource limits */
  reactStrictMode: true,
  // Allow API proxy to backend in dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
