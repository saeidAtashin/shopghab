import type { MetadataRoute } from "next";

import { indexableCatalogPaths } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
import { PUBLIC_SITEMAP_ENTRIES } from "@/lib/seo/routes";
import { absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

function latestCatalogDate(catalog: ReturnType<typeof readCatalog>): Date {
  let latest = 0;
  for (const design of catalog.designs) {
    const ts = Date.parse(design.updatedAt);
    if (Number.isFinite(ts) && ts > latest) latest = ts;
  }
  for (const category of catalog.categories) {
    const ts = Date.parse(category.updatedAt);
    if (Number.isFinite(ts) && ts > latest) latest = ts;
  }
  for (const collection of catalog.collections) {
    const ts = Date.parse(collection.updatedAt);
    if (Number.isFinite(ts) && ts > latest) latest = ts;
  }
  return latest > 0 ? new Date(latest) : new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = readCatalog();
  const fallbackDate = latestCatalogDate(catalog);
  const staticEntries = PUBLIC_SITEMAP_ENTRIES.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: fallbackDate,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const catalogEntries = indexableCatalogPaths(catalog).map((entry) => {
    const parsed = entry.lastModified ? Date.parse(entry.lastModified) : NaN;
    return {
      url: absoluteUrl(entry.path),
      lastModified: Number.isFinite(parsed) ? new Date(parsed) : fallbackDate,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    };
  });

  return [...staticEntries, ...catalogEntries];
}
