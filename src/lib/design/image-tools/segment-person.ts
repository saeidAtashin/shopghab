import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

import type { ImageToolProgress } from "./types";
import { canvasToBlob, loadImageElement } from "./utils";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
const SELFIE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

let segmenterPromise: Promise<ImageSegmenter> | null = null;

async function getPersonSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    segmenterPromise = ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: SELFIE_MODEL,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  }
  return segmenterPromise;
}

export async function segmentPersonFromImage(
  src: string,
  onProgress?: ImageToolProgress,
): Promise<Blob> {
  onProgress?.("در حال بارگذاری مدل تشخیص شخص...");
  const img = await loadImageElement(src);
  const segmenter = await getPersonSegmenter();

  onProgress?.("در حال برش شخص...");
  const result = segmenter.segment(img);
  const mask = result.confidenceMasks?.[0];
  if (!mask) {
    throw new Error("ماسک شخص ساخته نشد. تصویر پرتره امتحان کنید.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas در دسترس نیست.");
  }

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const maskData = mask.getAsFloat32Array();

  for (let i = 0; i < maskData.length; i += 1) {
    const alpha = Math.round(clamp(maskData[i], 0, 1) * 255);
    imageData.data[i * 4 + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
