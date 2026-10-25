import { getDefaultTextBoxWidth, getTextOffsetX } from "./editor-fonts";
import type { DesignLayer, TextLayer } from "./types";

export type ViewRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StageExportCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
  pixelRatioBoost: number;
};

export type SelectionView = {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  offsetX: number;
  offsetY: number;
  phoneCrop: StageExportCrop;
};

export function transformedAabb(input: {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  offsetX?: number;
  offsetY?: number;
}): ViewRect {
  const offsetX = input.offsetX ?? 0;
  const offsetY = input.offsetY ?? 0;
  const rad = (input.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners: Array<[number, number]> = [
    [0, 0],
    [input.width, 0],
    [input.width, input.height],
    [0, input.height],
  ];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [px, py] of corners) {
    const lx = (px - offsetX) * input.scaleX;
    const ly = (py - offsetY) * input.scaleY;
    const rx = input.x + lx * cos - ly * sin;
    const ry = input.y + lx * sin + ly * cos;
    minX = Math.min(minX, rx);
    minY = Math.min(minY, ry);
    maxX = Math.max(maxX, rx);
    maxY = Math.max(maxY, ry);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

export function clampRectInside(rect: ViewRect, bounds: ViewRect): ViewRect {
  const left = Math.max(rect.x, bounds.x);
  const top = Math.max(rect.y, bounds.y);
  const right = Math.min(rect.x + rect.width, bounds.x + bounds.width);
  const bottom = Math.min(rect.y + rect.height, bounds.y + bounds.height);
  if (right - left >= 1 && bottom - top >= 1) {
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  const size = Math.min(24, bounds.width, bounds.height);
  const x = Math.min(
    Math.max(bounds.x, rect.x + rect.width / 2 - size / 2),
    bounds.x + bounds.width - size,
  );
  const y = Math.min(
    Math.max(bounds.y, rect.y + rect.height / 2 - size / 2),
    bounds.y + bounds.height - size,
  );
  return { x, y, width: size, height: size };
}

function estimateTextBlockHeight(layer: TextLayer, boxWidth: number): number {
  const padding = layer.padding ?? 8;
  const fontSize = Math.max(1, layer.fontSize);
  const inner = Math.max(1, boxWidth - padding * 2);
  const charsPerLine = Math.max(1, Math.floor(inner / (fontSize * 0.55)));
  const lines = layer.text.split("\n").reduce((count, line) => {
    return count + Math.max(1, Math.ceil(Math.max(1, line.length) / charsPerLine));
  }, 0);
  return Math.max(fontSize, lines) * fontSize * 1.3 + padding * 2;
}

export function selectionLocalFrame(
  layer: DesignLayer,
  canvasWidth: number,
): { width: number; height: number; offsetX: number; offsetY: number } {
  if (layer.type === "image") {
    return { width: layer.width, height: layer.height, offsetX: 0, offsetY: 0 };
  }

  const boxWidth = layer.width ?? getDefaultTextBoxWidth(canvasWidth);
  return {
    width: boxWidth,
    height: estimateTextBlockHeight(layer, boxWidth),
    offsetX: getTextOffsetX(layer.align, boxWidth),
    offsetY: 0,
  };
}

export function layerSelectionRect(layer: DesignLayer, canvasWidth: number): ViewRect {
  const frame = selectionLocalFrame(layer, canvasWidth);
  return transformedAabb({
    x: layer.x,
    y: layer.y,
    width: frame.width,
    height: frame.height,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    rotation: layer.rotation,
    offsetX: frame.offsetX,
    offsetY: frame.offsetY,
  });
}

export type ResizeHandle =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "middle-left"
  | "middle-right";

const HANDLE_LAYOUT: Record<
  ResizeHandle,
  { dragX: number; dragY: number; oppX: number; oppY: number; axis: "both" | "x" }
> = {
  "top-left": { dragX: 0, dragY: 0, oppX: 1, oppY: 1, axis: "both" },
  "top-right": { dragX: 1, dragY: 0, oppX: 0, oppY: 1, axis: "both" },
  "bottom-left": { dragX: 0, dragY: 1, oppX: 1, oppY: 0, axis: "both" },
  "bottom-right": { dragX: 1, dragY: 1, oppX: 0, oppY: 0, axis: "both" },
  "middle-left": { dragX: 0, dragY: 0.5, oppX: 1, oppY: 0.5, axis: "x" },
  "middle-right": { dragX: 1, dragY: 0.5, oppX: 0, oppY: 0.5, axis: "x" },
};

function worldPoint(input: {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  localX: number;
  localY: number;
}): { x: number; y: number } {
  const rad = (input.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const lx = (input.localX - input.offsetX) * input.scaleX;
  const ly = (input.localY - input.offsetY) * input.scaleY;
  return {
    x: input.x + lx * cos - ly * sin,
    y: input.y + lx * sin + ly * cos,
  };
}

export function resizeFromHandle(input: {
  handle: ResizeHandle;
  pointerX: number;
  pointerY: number;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}): { x: number; y: number; scaleX: number; scaleY: number } {
  const layout = HANDLE_LAYOUT[input.handle];
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const opposite = worldPoint({
    ...input,
    localX: layout.oppX * width,
    localY: layout.oppY * height,
  });
  const rad = (input.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = input.pointerX - opposite.x;
  const dy = input.pointerY - opposite.y;
  const localDx = dx * cos + dy * sin;
  const localDy = -dx * sin + dy * cos;
  const spanX = (layout.dragX - layout.oppX) * width;
  const spanY = (layout.dragY - layout.oppY) * height;
  let scaleX = input.scaleX;
  let scaleY = input.scaleY;
  if (Math.abs(spanX) > 1e-6) scaleX = localDx / spanX;
  if (layout.axis === "both" && Math.abs(spanY) > 1e-6) scaleY = localDy / spanY;

  const minScaleX = 10 / width;
  const minScaleY = 10 / height;
  if (Math.abs(scaleX) < minScaleX) scaleX = Math.sign(scaleX || 1) * minScaleX;
  if (Math.abs(scaleY) < minScaleY) scaleY = Math.sign(scaleY || 1) * minScaleY;

  const lx = (layout.oppX * width - input.offsetX) * scaleX;
  const ly = (layout.oppY * height - input.offsetY) * scaleY;
  return {
    x: opposite.x - (lx * cos - ly * sin),
    y: opposite.y - (lx * sin + ly * cos),
    scaleX,
    scaleY,
  };
}

export function fitSelectionView(input: {
  canvasWidth: number;
  canvasHeight: number;
  maxWidth: number;
  maxHeight: number;
}): SelectionView {
  const canvasWidth = Math.max(1, input.canvasWidth);
  const canvasHeight = Math.max(1, input.canvasHeight);
  const maxWidth = Math.max(1, input.maxWidth);
  const maxHeight = Math.max(1, input.maxHeight);
  const baseScale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight);

  return {
    scale: baseScale,
    stageWidth: Math.max(1, Math.ceil(canvasWidth * baseScale - 1e-6)),
    stageHeight: Math.max(1, Math.ceil(canvasHeight * baseScale - 1e-6)),
    offsetX: 0,
    offsetY: 0,
    phoneCrop: {
      x: 0,
      y: 0,
      width: canvasWidth * baseScale,
      height: canvasHeight * baseScale,
      pixelRatioBoost: 1,
    },
  };
}
