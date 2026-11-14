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
  async redirects() {
    return [
      // some browsers ask for /favicon.ico without reading the page.
      // Without this it would land on the /[handle] page.
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // browsers must not guess a file type other than the one we send
          { key: "X-Content-Type-Options", value: "nosniff" },
          // the app can not be shown inside a frame on another site
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // private request links: keep them out of search engines and out
        // of the Referer header sent to other sites
        source: "/r/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
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
