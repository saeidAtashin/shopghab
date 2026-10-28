import { existsSync } from "node:fs";

import { enabledTemplates, loadProjectTemplates } from "./config";
import { safeMockupMessage, MockupError } from "./errors";
import { hashFile, mockupContentHash } from "./hash";
import { artworkAbsolutePath, publicRoot, resolveInside } from "./paths";
import type { MockupPlacement } from "./focal";
import type { MockupRecord, MockupTemplateConfig } from "./types";

export type MockupIssue = {
  slug: string;
  templateId: string;
  kind: "missing" | "outdated" | "error";
  error: string;
};

export type MockupTemplateSummary = {
  id: string;
  name: string;
  enabled: boolean;
  renderer: MockupTemplateConfig["renderer"];
  default: boolean;
};

export type MockupStatusReport = {
  templates: MockupTemplateSummary[];
  summary: {
    designs: number;
    ready: number;
    missing: number;
    outdated: number;
    errors: number;
  };
  issues: MockupIssue[];
};

type StatusDesign = {
  slug: string;
  imagePath: string;
  assetMissing: boolean;
  mockups: MockupRecord[];
  placements?: Record<string, MockupPlacement>;
};

function fileReady(cwd: string, publicPath: string): boolean {
  if (!publicPath.startsWith("/designed/") || publicPath.includes("..")) return false;
  try {
    return existsSync(resolveInside(publicRoot(cwd), publicPath.slice(1)));
  } catch {
    return false;
  }
}

export async function summarizeMockups(input: {
  cwd: string;
  templates: MockupTemplateConfig[];
  designs: StatusDesign[];
  issueLimit?: number;
}): Promise<MockupStatusReport> {
  const enabled = enabledTemplates(input.templates);
  const issues: MockupIssue[] = [];
  const summary = { designs: 0, ready: 0, missing: 0, outdated: 0, errors: 0 };
  const limit = input.issueLimit ?? 80;

  function push(issue: MockupIssue): void {
    if (issues.length < limit) issues.push(issue);
  }

  for (const design of input.designs) {
    if (!design.imagePath || design.assetMissing) continue;
    summary.designs += 1;
    let artworkHash = "";
    try {
      const artwork = artworkAbsolutePath(input.cwd, design.imagePath);
      if (!existsSync(artwork)) throw new MockupError("missingArtwork");
      artworkHash = await hashFile(artwork);
    } catch (error) {
      summary.missing += enabled.length;
      push({
        slug: design.slug,
        templateId: "",
        kind: "missing",
        error: safeMockupMessage(error instanceof MockupError ? error : new MockupError("missingArtwork")),
      });
      continue;
    }

    for (const template of enabled) {
      const record = design.mockups.find((item) => item.templateId === template.id);
      if (!record || record.status === "skipped") {
        summary.missing += 1;
        push({
          slug: design.slug,
          templateId: template.id,
          kind: "missing",
          error: "خروجی این قالب ساخته نشده است",
        });
        continue;
      }
      if (record.status === "error") {
        summary.errors += 1;
        push({
          slug: design.slug,
          templateId: template.id,
          kind: "error",
          error: record.error || safeMockupMessage(new MockupError("unsupported")),
        });
        continue;
      }
      const current = mockupContentHash(artworkHash, template, design.placements?.[template.id]);
      const filesExist = fileReady(input.cwd, record.path) && fileReady(input.cwd, record.thumbPath);
      if (!filesExist) {
        summary.missing += 1;
        push({
          slug: design.slug,
          templateId: template.id,
          kind: "missing",
          error: "فایل خروجی این قالب موجود نیست",
        });
        continue;
      }
      if (record.contentHash !== current || record.templateVersion !== template.version) {
        summary.outdated += 1;
        push({
          slug: design.slug,
          templateId: template.id,
          kind: "outdated",
          error: record.error || "خروجی با طرح یا نسخه قالب هم‌خوان نیست",
        });
        continue;
      }
      if (record.error.trim()) {
        summary.errors += 1;
        push({ slug: design.slug, templateId: template.id, kind: "error", error: record.error });
        continue;
      }
      summary.ready += 1;
    }
  }

  return {
    templates: input.templates.map((template) => ({
      id: template.id,
      name: template.name,
      enabled: template.enabled,
      renderer: template.renderer,
      default: template.default,
    })),
    summary,
    issues,
  };
}

export async function projectMockupStatus(cwd = process.cwd()): Promise<MockupStatusReport> {
  const { readCatalog } = await import("../catalog/store");
  const catalog = readCatalog();
  return summarizeMockups({
    cwd,
    templates: loadProjectTemplates(cwd),
    designs: catalog.designs.map((design) => ({
      slug: design.slug,
      imagePath: design.imagePath,
      assetMissing: design.assetMissing,
      mockups: design.mockups,
      placements: design.placements,
    })),
  });
}
