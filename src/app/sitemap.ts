import type { MetadataRoute } from "next";

import { indexableCatalogPaths } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { PUBLIC_SITEMAP_ENTRIES } from "@/lib/seo/routes";
import { absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries = [...PUBLIC_SITEMAP_ENTRIES, ...indexableCatalogPaths(readCatalog())];

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
