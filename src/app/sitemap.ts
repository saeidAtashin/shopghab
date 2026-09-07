import type { MetadataRoute } from "next";

import { PUBLIC_SITEMAP_ENTRIES } from "../lib/seo/routes";
import { absoluteUrl } from "../lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_SITEMAP_ENTRIES.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
