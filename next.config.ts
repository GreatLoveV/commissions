import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is left off on purpose. Almost every page here reads
  // the session or tenant data, so pages render per request and nothing is
  // cached unless we ask for it.
  images: {
    // image urls are built in src/lib/image-loader.ts
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  experimental: {
    serverActions: {
      // portfolio uploads go through a server action. The default limit is
      // 1 MB, images can be up to 4 MB.
      bodySizeLimit: "5mb",
    },
  },
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
