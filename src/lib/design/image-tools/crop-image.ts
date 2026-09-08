import type { CropRect } from "./types";
import { canvasToBlob, loadImageElement } from "./utils";

export async function cropImage(src: string, rect: CropRect): Promise<Blob> {
  const img = await loadImageElement(src);
  const x = Math.round(rect.x);
  const y = Math.round(rect.y);
  const width = Math.round(Math.max(1, rect.width));
  const height = Math.round(Math.max(1, rect.height));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas در دسترس نیست.");
  }

  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  return canvasToBlob(canvas);
}
