import { NextResponse } from "next/server";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { CatalogError, saveDesignPlacement } from "@/lib/catalog/logic";
import { designPlacementWriteSchema, type DesignRecord } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";
import { loadProjectTemplates } from "@/lib/mockups/config";
import { normalizePlacement } from "@/lib/mockups/focal";
import { mockupOutputSlug, templatesForDesign } from "@/lib/mockups/generate";
import { renderDesignTemplates } from "@/lib/mockups/render";
import type { MockupTemplateConfig } from "@/lib/mockups/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

type RouteContext = { params: Promise<{ id: string }> };

export type DesignPlacementTemplate = {
  templateId: string;
  name: string;
  printableWidth: number;
  printableHeight: number;
  focalX: number;
  focalY: number;
  zoom: number;
  rendered: string;
  thumb: string;
  generatedAt: string;
  error: string;
};

export type DesignPlacementView = {
  artwork: { src: string; thumb: string; width: number; height: number };
  templates: DesignPlacementTemplate[];
};

function placementView(design: DesignRecord, templates: MockupTemplateConfig[]): DesignPlacementView {
  const current = design.mockups.find((item) => item.status === "ready" && item.templateId);
  const chosen = templatesForDesign(design.id, templates, current?.templateId);
  return {
    artwork: {
      src: design.imagePath,
      thumb: design.thumbnailPath || design.imagePath,
      width: design.width,
      height: design.height,
    },
    templates: chosen.map((template) => {
      const mockup = design.mockups.find((item) => item.templateId === template.id);
      const ready = mockup?.status === "ready" && mockup.path ? mockup : undefined;
      const placement = design.placements?.[template.id];
      return {
        templateId: template.id,
        name: template.name,
        printableWidth: template.printable.width,
        printableHeight: template.printable.height,
        focalX: placement?.focalX ?? 0.5,
        focalY: placement?.focalY ?? 0.5,
        zoom: placement?.zoom ?? 1,
        rendered: ready?.path ?? "",
        thumb: ready?.thumbPath || ready?.path || "",
        generatedAt: ready?.generatedAt ?? "",
        error: mockup?.error ?? "",
      };
    }),
  };
}

export async function GET(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const design = readCatalog().designs.find((item) => item.id === id);
  if (!design) {
    return NextResponse.json({ error: "طرح پیدا نشد" }, { status: 404 });
  }
  try {
    const view = placementView(design, loadProjectTemplates(process.cwd()));
    return NextResponse.json(view);
  } catch (error) {
    return catalogErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  try {
    const body: unknown = await request.json();
    const input = designPlacementWriteSchema.parse(body);
    const placement = normalizePlacement(input.focalX, input.focalY, input.zoom ?? 1);
    const catalog = readCatalog();
    const design = catalog.designs.find((item) => item.id === id);
    if (!design) throw new CatalogError("طرح پیدا نشد", 404);
    if (!design.imagePath || design.assetMissing) {
      throw new CatalogError("فایل طرح اصلی پیدا نشد", 400);
    }

    const templates = loadProjectTemplates(process.cwd());
    const current = design.mockups.find((item) => item.status === "ready" && item.templateId);
    const chosen = templatesForDesign(design.id, templates, current?.templateId);
    const template = chosen.find((item) => item.id === input.templateId);
    if (!template) throw new CatalogError("این قالب برای طرح انتخاب نشده است", 400);

    const rendered = await renderDesignTemplates({
      cwd: process.cwd(),
      slug: mockupOutputSlug(design.id, design.slug),
      artworkPublicPath: design.imagePath,
      templates: [template],
      previous: design.mockups,
      placements: { ...design.placements, [template.id]: placement },
    });
    const mockup = rendered[0];
    if (!mockup) throw new CatalogError("موکاپ ساخته نشد", 500);

    const saved = await mutateCatalog((currentCatalog) => {
      const updated = saveDesignPlacement(
        currentCatalog,
        id,
        template.id,
        placement,
        mockup,
        chosen.map((item) => item.id),
      );
      return { catalog: updated.catalog, result: updated.design };
    });
    const view = placementView(saved, templates);
    const item = view.templates.find((entry) => entry.templateId === template.id);
    return NextResponse.json({ template: item, artwork: view.artwork });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
