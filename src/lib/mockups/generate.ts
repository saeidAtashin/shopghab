import { enabledTemplates, loadProjectTemplates } from "./config";
import { mergeMockupRecords, renderDesignTemplates } from "./render";
import type { MockupRecord } from "./types";

export type GenerateMockupReport = {
  designs: number;
  ready: number;
  reused: number;
  errors: number;
  skippedTemplates: number;
};

function sameRecords(left: MockupRecord[], right: MockupRecord[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function generateMockupsForDesigns(options: {
  slugs?: string[];
  all?: boolean;
  cwd?: string;
}): Promise<GenerateMockupReport> {
  const cwd = options.cwd ?? process.cwd();
  const templates = loadProjectTemplates(cwd);
  const enabled = enabledTemplates(templates);
  const disabled = templates.length - enabled.length;
  if (enabled.length === 0) {
    console.log("No enabled mockup templates. Skipping mockup generation.");
    return { designs: 0, ready: 0, reused: 0, errors: 0, skippedTemplates: disabled };
  }

  const { readCatalog, mutateCatalog } = await import("../catalog/store");
  const catalog = readCatalog();
  const wanted = new Set((options.slugs ?? []).map((slug) => slug.toLowerCase()));
  const designs = catalog.designs.filter((design) => {
    if (!design.imagePath || design.assetMissing) return false;
    if (options.all) return true;
    return wanted.has(design.slug.toLowerCase());
  });

  const report: GenerateMockupReport = {
    designs: 0,
    ready: 0,
    reused: 0,
    errors: 0,
    skippedTemplates: disabled,
  };

  for (const design of designs) {
    const previous = design.mockups;
    const updates = await renderDesignTemplates({
      cwd,
      slug: design.slug,
      artworkPublicPath: design.imagePath,
      templates: enabled,
      previous,
    });
    report.designs += 1;
    for (const update of updates) {
      const prior = previous.find((item) => item.templateId === update.templateId);
      if (update.status === "ready" && update.error === "" && prior?.contentHash === update.contentHash && prior.status === "ready") {
        report.reused += 1;
      } else if (update.status === "ready" && update.error === "") {
        report.ready += 1;
      } else if (update.status === "error" && update.error) {
        report.errors += 1;
        console.warn(`Mockup ${design.slug} / ${update.templateId}: ${update.error}`);
      }
    }

    const merged = mergeMockupRecords(previous, updates);
    if (sameRecords(previous, merged)) continue;
    await mutateCatalog((current) => {
      const live = current.designs.find((item) => item.id === design.id);
      if (!live) return { catalog: current, result: false };
      const next = mergeMockupRecords(live.mockups, updates);
      if (sameRecords(live.mockups, next)) return { catalog: current, result: false };
      live.mockups = next;
      return { catalog: current, result: true };
    });
  }

  return report;
}
