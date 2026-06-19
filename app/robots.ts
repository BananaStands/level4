import type { MetadataRoute } from "next";
import { siteConfig } from "./site-config";

// Next.js serves this at /robots.txt automatically.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
