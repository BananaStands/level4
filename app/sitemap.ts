import type { MetadataRoute } from "next";
import { siteConfig } from "./site-config";

// Next.js serves this at /sitemap.xml automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];
}
