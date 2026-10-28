import { enabledTemplates, loadProjectTemplates } from "./config";
import { assertSafeId } from "./paths";
import { renderDesignTemplates } from "./render";
import type { MockupRecord, MockupTemplateConfig } from "./types";

type MutateCatalog = typeof import("../catalog/store").mutateCatalog;

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

const PHOTOS_PER_DESIGN = 3;

export function phoneTemplates(templates: MockupTemplateConfig[]): MockupTemplateConfig[] {
  return enabledTemplates(templates).filter((template) => template.listing);
}

/** Stable across runs. The same design id always keeps the same three phone photos. */
export function templatesForDesign(
  designId: string,
  templates: MockupTemplateConfig[],
  currentTemplateId?: string,
): MockupTemplateConfig[] {
  const phones = phoneTemplates(templates);
  const first = phones[0];
  if (!first) throw new Error("No enabled mockup templates.");
  let hash = 0;
  for (const char of designId) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
  const start = hash % phones.length;
  const ordered = [...phones.slice(start), ...phones.slice(0, start)];
  const current = phones.find((template) => template.id === currentTemplateId);
  const picked: MockupTemplateConfig[] = [];
  if (current) picked.push(current);
  for (const template of ordered) {
    if (picked.length >= PHOTOS_PER_DESIGN) break;
    if (picked.some((item) => item.id === template.id)) continue;
    picked.push(template);
  }
  return picked;
}

export function templateForDesign(designId: string, templates: MockupTemplateConfig[]): MockupTemplateConfig {
  const chosen = templatesForDesign(designId, templates)[0];
  if (!chosen) throw new Error("No enabled mockup templates.");
  return chosen;
}

export function mockupOutputSlug(id: string, slug: string): string {
  try {
    return assertSafeId(slug);
  } catch {
    return assertSafeId(id);
  }
}

async function saveDesignMockups(
  mutateCatalog: MutateCatalog,
  designId: string,
  updates: MockupRecord[],
): Promise<void> {
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      await mutateCatalog((current) => {
        const live = current.designs.find((item) => item.id === designId);
        if (!live) return { catalog: current, result: false };
        if (sameRecords(live.mockups, updates)) return { catalog: current, result: false };
        live.mockups = updates;
        return { catalog: current, result: true };
      });
      return;
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if ((code === "EPERM" || code === "EBUSY") && attempt < 8) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
        continue;
      }
      throw error;
    }
  }
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
    const current = previous.find((item) => item.status === "ready" && item.templateId);
    const chosen = templatesForDesign(design.id, templates, current?.templateId);
    const updates = await renderDesignTemplates({
      cwd,
      slug: mockupOutputSlug(design.id, design.slug),
      artworkPublicPath: design.imagePath,
      templates: chosen,
      previous,
      placements: design.placements,
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

    if (report.designs % 25 === 0 || report.designs === designs.length) {
      console.log(`Mockup progress: ${report.designs}/${designs.length}`);
    }

    if (sameRecords(previous, updates)) continue;
    await saveDesignMockups(mutateCatalog, design.id, updates);
  }

  return report;
}
