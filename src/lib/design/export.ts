import type Konva from "konva";

import type { StageExportCrop } from "./selection-view";

export type ExportImageFormat = "png" | "jpg";

export const STAGE_EXPORT_CROP_ATTR = "exportCrop";
const SELECTION_TRANSFORMER_NAME = "selection-transformer";

/** Pixel ratio used when the editor exports a finished case image. */
export const EXPORT_STAGE_PIXEL_RATIO = 3;

export const EXPORT_MIME: Record<ExportImageFormat, string> = {
  png: "image/png",
  jpg: "image/jpeg",
};

function captureStage(stage: Konva.Stage, pixelRatio: number): HTMLCanvasElement {
  const crop = stage.getAttr(STAGE_EXPORT_CROP_ATTR) as StageExportCrop | undefined;
  const boost =
    crop && crop.pixelRatioBoost > 0 ? Math.min(crop.pixelRatioBoost, 12) : 1;
  const transformer = stage.findOne(`.${SELECTION_TRANSFORMER_NAME}`);
  const wasVisible = transformer?.visible();
  if (transformer) {
    transformer.visible(false);
  }
  stage.batchDraw();
  try {
    return stage.toCanvas({
      pixelRatio: pixelRatio * boost,
      ...(crop && crop.width > 1 && crop.height > 1
        ? { x: crop.x, y: crop.y, width: crop.width, height: crop.height }
        : {}),
    });
  } finally {
    if (transformer) {
      transformer.visible(wasVisible ?? true);
      transformer.getLayer()?.batchDraw();
    }
  }
}

export async function exportStageToDataUrl(
  stage: Konva.Stage,
  options: {
    format?: ExportImageFormat;
    pixelRatio?: number;
    quality?: number;
  } = {},
): Promise<string> {
  const format = options.format ?? "png";
  const pixelRatio = options.pixelRatio ?? 2;
  const quality = options.quality ?? 0.92;
  const source = captureStage(stage, pixelRatio);

  if (format === "png") {
    return source.toDataURL("image/png");
  }

  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return source.toDataURL("image/jpeg", quality);
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function exportStageToPng(
  stage: Konva.Stage,
  pixelRatio = 2,
): Promise<string> {
  return exportStageToDataUrl(stage, { format: "png", pixelRatio });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function dataUrlToFile(
  dataUrl: string,
  filename: string,
  mimeType: string,
): File {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}

export async function exportStageToFile(
  stage: Konva.Stage,
  filename: string,
  format: ExportImageFormat,
): Promise<File> {
  const dataUrl = await exportStageToDataUrl(stage, {
    format,
    pixelRatio: EXPORT_STAGE_PIXEL_RATIO,
  });
  return dataUrlToFile(dataUrl, filename, EXPORT_MIME[format]);
}

export async function shareOrDownloadImage(
  file: File,
  dataUrl: string,
): Promise<"shared" | "downloaded"> {
  const payload = { files: [file], title: file.name, text: "طراحی قاب" };
  if (typeof navigator.share === "function" && navigator.canShare?.(payload)) {
    await navigator.share(payload);
    return "shared";
  }
  downloadDataUrl(dataUrl, file.name);
  return "downloaded";
}

export async function exportAndDownload(stage: Konva.Stage, filename: string) {
  const dataUrl = await exportStageToPng(stage, 3);
  downloadDataUrl(dataUrl, filename);
}
