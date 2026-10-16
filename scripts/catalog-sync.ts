import { applyManifestImport, printSyncReport, readDesignedManifest, readDesignedMeta } from "../src/lib/catalog/sync";

async function main(): Promise<void> {
  const entries = readDesignedManifest();
  const meta = readDesignedMeta();
  if (entries.length === 0) {
    console.log("No manifest entries found. Catalog was left unchanged.");
    return;
  }

  const report = await applyManifestImport(entries, meta);
  printSyncReport(report);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
