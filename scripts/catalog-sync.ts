import { copyFileSync, existsSync, unlinkSync } from "node:fs";

import { catalogCacheFilePath, catalogFilePath } from "../src/lib/catalog/store";
import { applyManifestImport, printSyncReport, readDesignedManifest, readDesignedMeta } from "../src/lib/catalog/sync";

function rememberCatalogBackup(): string | null {
  const catalogPath = catalogFilePath();
  if (!existsSync(catalogPath)) return null;

  const backupPath = `${catalogPath}.before-sync`;
  copyFileSync(catalogPath, backupPath);
  copyFileSync(catalogPath, catalogCacheFilePath());
  return backupPath;
}

function restoreCatalogBackup(backupPath: string): void {
  copyFileSync(backupPath, catalogFilePath());
  copyFileSync(backupPath, catalogCacheFilePath());
}

async function main(): Promise<void> {
  const entries = readDesignedManifest();
  const meta = readDesignedMeta();
  if (entries.length === 0) {
    console.log("No manifest entries found. Catalog was left unchanged.");
    return;
  }

  const backupPath = rememberCatalogBackup();
  try {
    const report = await applyManifestImport(entries, meta);
    printSyncReport(report);
  } catch (error) {
    if (backupPath && existsSync(backupPath)) {
      restoreCatalogBackup(backupPath);
    }
    console.error(error instanceof Error ? error.message : error);
    console.error("Catalog sync failed. The previous catalog was left in place.");
    process.exitCode = 1;
  } finally {
    if (backupPath && existsSync(backupPath)) {
      unlinkSync(backupPath);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  console.error("Catalog sync failed. The previous catalog was left in place.");
  process.exit(1);
});
