import { EXPORT_STAGE_PIXEL_RATIO } from "@/lib/design/export";
import { DEFAULT_REFERENCE_CANVAS } from "@/lib/design/types";

/** Longest edge the editor can show in an export of the reference canvas. */
export const EDITOR_BITMAP_MAX_EDGE =
  Math.max(DEFAULT_REFERENCE_CANVAS.width, DEFAULT_REFERENCE_CANVAS.height) *
  EXPORT_STAGE_PIXEL_RATIO;

export function downscaleBitmap(
  image: HTMLImageElement,
  maxEdge: number,
): CanvasImageSource {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const edge = Math.max(width, height);
  if (!width || !height || edge <= maxEdge) return image;

  const scale = maxEdge / edge;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) return image;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}
