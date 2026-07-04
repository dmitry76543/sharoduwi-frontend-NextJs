import type { NextConfig } from "next";

import {
  getLegacyNextRedirects,
  getLegacyNextRewrites,
} from "./lib/cities/legacy-routes";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/api/advantshop-image" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "s4.advantme.ru" },
      { protocol: "https", hostname: "**.on-advantshop.net" },
      { protocol: "https", hostname: "**.advantshop.net" },
    ],
  },
  async redirects() {
    return getLegacyNextRedirects();
  },
  async rewrites() {
    return {
      beforeFiles: getLegacyNextRewrites(),
    };
  },
};

export default nextConfig;
