import type { NextConfig } from "next";

import { cabecerasDeSeguridad } from "./lib/cabeceras";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasDeSeguridad({ produccion: process.env.NODE_ENV === "production" }),
      },
    ];
  },
};

export default nextConfig;
