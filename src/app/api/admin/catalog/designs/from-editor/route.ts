import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { NextResponse } from "next/server";
import sharp from "sharp";

import { catalogErrorResponse, isAdminSession, requireAdmin } from "@/lib/catalog/http";
import { CatalogError, forkDesignFromArtwork, updateDesignStatus } from "@/lib/catalog/logic";
import type { DesignRecord } from "@/lib/catalog/schema";
import { mutateCatalog, readCatalog } from "@/lib/catalog/store";
import { randomDesignId } from "@/lib/catalog/ids";
import { loadProjectTemplates } from "@/lib/mockups/config";
import { templatesForDesign } from "@/lib/mockups/generate";
import { publicRoot, resolveInside } from "@/lib/mockups/paths";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function removeFiles(paths: string[]): void {
  for (const path of paths) {
    try {
      rmSync(path, { force: true });
    } catch {
      // The file may already be gone.
    }
  }
}

export async function POST(request: Request) {
  const session = requireAdmin(request);
  if (!isAdminSession(session)) return session;

  const written: string[] = [];
  let design: DesignRecord | null = null;
  try {
    const form = await request.formData();
    const sourceId = String(form.get("sourceId") ?? "").trim();
    const image = form.get("image");
    if (!sourceId) throw new CatalogError("طرح مبدأ مشخص نیست", 400);
    if (!(image instanceof File)) throw new CatalogError("تصویر ویرایش‌شده پیدا نشد", 400);
    if (image.size < 1 || image.size > MAX_IMAGE_BYTES) {
      throw new CatalogError("حجم تصویر باید کمتر از ۲۰ مگابایت باشد", 400);
    }

    const source = readCatalog().designs.find((item) => item.id === sourceId);
    if (!source) throw new CatalogError("طرح پیدا نشد", 404);

    const bytes = Buffer.from(await image.arrayBuffer());
    const webp = await sharp(bytes, { failOn: "error" }).rotate().webp({ quality: 82 }).toBuffer();
    const meta = await sharp(webp).metadata();
    if (!meta.width || !meta.height) throw new CatalogError("فایل تصویر قابل خواندن نیست", 400);

    const fileId = randomDesignId();
    const imagePublic = `/designed/edits/${fileId}.webp`;
    const thumbPublic = `/designed/edits/${fileId}.thumb.webp`;
    const root = publicRoot();
    const imageAbs = resolveInside(root, imagePublic.slice(1));
    const thumbAbs = resolveInside(root, thumbPublic.slice(1));
    const thumb = await sharp(webp).resize(400, 400, { fit: "inside" }).webp({ quality: 75 }).toBuffer();
    mkdirSync(dirname(imageAbs), { recursive: true });
    writeFileSync(imageAbs, webp);
    writeFileSync(thumbAbs, thumb);
    written.push(imageAbs, thumbAbs);

    const createdDesign = await mutateCatalog((catalog) => {
      const created = forkDesignFromArtwork(catalog, sourceId, {
        imagePath: imagePublic,
        thumbnailPath: thumbPublic,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
      });
      // Stay a draft until each mockup has been rendered in its own request.
      const drafted = updateDesignStatus(created.catalog, created.design.id, "draft");
      drafted.design.publishedAt = null;
      return { catalog: drafted.catalog, result: drafted.design };
    });
    design = createdDesign;

    let templates: { templateId: string; name: string }[] = [];
    try {
      const loaded = loadProjectTemplates(process.cwd());
      templates = templatesForDesign(createdDesign.id, loaded).map((template) => ({
        templateId: template.id,
        name: template.name,
      }));
    } catch (error) {
      console.error(error);
    }

    return NextResponse.json({
      designId: createdDesign.id,
      slug: createdDesign.slug,
      adminPath: `/admin/designs/${createdDesign.id}`,
      templates,
    });
  } catch (error) {
    if (!design) removeFiles(written);
    return catalogErrorResponse(error);
  }
}
