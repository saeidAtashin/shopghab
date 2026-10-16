import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

import { inspectPsdFile } from "../src/lib/mockups/inspect";
import { mockupRoot } from "../src/lib/mockups/paths";

async function main(): Promise<void> {
  const root = mockupRoot();
  const psdDir = join(root, "psd");
  const inspectionDir = join(root, "inspection");
  mkdirSync(psdDir, { recursive: true });
  mkdirSync(inspectionDir, { recursive: true });

  const files = readdirSync(psdDir).filter((file) => file.toLowerCase().endsWith(".psd"));
  if (files.length === 0) {
    console.log("No PSD files in mockup-templates/psd. Nothing was inspected.");
    return;
  }

  for (const file of files) {
    try {
      const report = inspectPsdFile(join(psdDir, file));
      const payload = {
        file,
        inspectedAt: new Date().toISOString(),
        width: report.width,
        height: report.height,
        layerCount: report.layerCount,
        smartObjectCount: report.smartObjectCount,
        printableCandidates: report.printableCandidates,
        layers: report.layers,
        note:
          report.smartObjectCount === 0
            ? "No Smart Object was found. Keep the template disabled until a prepared printable region is configured."
            : "Smart Object names are listed only. Replacement is not verified until a real render is checked.",
      };
      writeFileSync(join(inspectionDir, `${basename(file, ".psd")}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      console.log(
        `${file}: ${report.width}×${report.height}, layers ${report.layerCount}, smart objects ${report.smartObjectCount}`,
      );
      if (report.printableCandidates.length > 0) {
        console.log(`  Smart Object layers: ${report.printableCandidates.join(", ")}`);
      }
    } catch {
      console.warn(`${file}: PSD structure could not be read. The template stays disabled.`);
    }
  }
}

main().catch(() => {
  console.error("Mockup inspection failed.");
  process.exit(1);
});
