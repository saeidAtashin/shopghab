import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  emptySyncReport,
  manifestEntryToImport,
  syncCatalog,
  type DesignedMetaLike,
  type ManifestLikeEntry,
  type SyncReport,
} from "./logic";
import { catalogFileExists, mutateCatalog, readCatalog } from "./store";
import { seedCatalogTaxonomy } from "./taxonomy";

export async function applyManifestImport(
  entries: ManifestLikeEntry[],
  meta: DesignedMetaLike = {},
  options: { defaultStatus?: "draft" | "published" } = {},
): Promise<SyncReport> {
  if (entries.length === 0) return emptySyncReport();

  const defaultStatus =
    options.defaultStatus ?? (catalogFileExists() ? "draft" : "published");
  const imports = entries.map((entry) => manifestEntryToImport(entry, meta));

  return mutateCatalog((catalog) => {
    const synced = syncCatalog(catalog, imports, { defaultStatus });
    const seeded = seedCatalogTaxonomy(synced.catalog);
    return { catalog: seeded.catalog, result: synced.report };
  });
}

export function readDesignedMeta(root = process.cwd()): DesignedMetaLike {
  const metaPath = join(root, "public", "designed", "designed.meta.json");
  if (!existsSync(metaPath)) return {};
  try {
    return JSON.parse(readFileSync(metaPath, "utf8")) as DesignedMetaLike;
  } catch {
    return {};
  }
}

export function readDesignedManifest(root = process.cwd()): ManifestLikeEntry[] {
  const manifestPath = join(root, "public", "designed", "designed.manifest.json");
  if (!existsSync(manifestPath)) return [];
  const parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    entries?: ManifestLikeEntry[];
  };
  return parsed.entries ?? [];
}

export function printSyncReport(report: SyncReport): void {
  console.log("Catalog sync:");
  console.log(`  created: ${report.created.length}`);
  console.log(`  assets updated: ${report.assetsUpdated.length}`);
  console.log(`  editorial preserved: ${report.editorialPreserved.length}`);
  console.log(`  missing assets: ${report.missingAssets.length}`);
  console.log(`  duplicate source files: ${report.duplicateSourceKeys.length}`);
  if (report.duplicateSourceKeys.length > 0) {
    for (const key of report.duplicateSourceKeys) {
      console.log(`    duplicate: ${key}`);
    }
  }
  if (report.missingAssets.length > 0) {
    const catalog = readCatalog();
    for (const id of report.missingAssets) {
      const design = catalog.designs.find((item) => item.id === id);
      console.log(`    missing: ${design?.sourceKey || id}`);
    }
  }
}
