import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

import type { ImageToolProgress } from "./types";
import { canvasToBlob, clamp, loadImageElement } from "./utils";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

let faceDetectorPromise: Promise<FaceDetector> | null = null;

async function getFaceDetector(): Promise<FaceDetector> {
  if (!faceDetectorPromise) {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    faceDetectorPromise = FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACE_MODEL,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
    });
  }
  return faceDetectorPromise;
}

type FaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function pickLargestFace(
  detections: { boundingBox?: { originX: number; originY: number; width: number; height: number } }[],
): FaceBox | null {
  let best: FaceBox | null = null;
  let bestArea = 0;

  for (const detection of detections) {
    const box = detection.boundingBox;
    if (!box) continue;
    const area = box.width * box.height;
    if (area > bestArea) {
      bestArea = area;
      best = {
        x: box.originX,
        y: box.originY,
        width: box.width,
        height: box.height,
      };
    }
  }

  return best;
}

export async function segmentFaceFromImage(
  src: string,
  onProgress?: ImageToolProgress,
): Promise<Blob> {
  onProgress?.("در حال بارگذاری مدل تشخیص چهره...");
  const img = await loadImageElement(src);
  const detector = await getFaceDetector();

  onProgress?.("در حال یافتن چهره...");
  const result = detector.detect(img);
  const face = pickLargestFace(result.detections);
  if (!face) {
    throw new Error("چهره‌ای در تصویر یافت نشد.");
  }

  const padX = face.width * 0.25;
  const padY = face.height * 0.35;
  const x = clamp(face.x - padX, 0, img.naturalWidth - 1);
  const y = clamp(face.y - padY, 0, img.naturalHeight - 1);
  const width = clamp(face.width + padX * 2, 1, img.naturalWidth - x);
  const height = clamp(face.height + padY * 2, 1, img.naturalHeight - y);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas در دسترس نیست.");
  }

  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
  ctx.restore();

  return canvasToBlob(canvas);
}
