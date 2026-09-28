import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // The damage check page is a static file in public/; serve it at a clean URL.
    return [{ source: "/damage-check", destination: "/damage-check.html" }];
  },
};

export default nextConfig;
