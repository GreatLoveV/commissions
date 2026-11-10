import type { MetadataRoute } from "next";

// Artist pages are public and should be found. Everything behind a login
// or a private link should not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/r/", "/api/", "/onboarding"],
    },
  };
}
