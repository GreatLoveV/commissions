import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is left off on purpose. Almost every page here reads
  // the session or tenant data, so pages render per request and nothing is
  // cached unless we ask for it.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
