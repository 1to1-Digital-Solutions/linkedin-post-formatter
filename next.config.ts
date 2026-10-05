import type { NextConfig } from "next";

import { securityHeaders } from "./lib/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({ production: process.env.NODE_ENV === "production" }),
      },
    ];
  },
};

export default nextConfig;
