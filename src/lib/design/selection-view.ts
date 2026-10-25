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

const MAX_PIXEL_RATIO_BOOST = 12;

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

export function unionRects(a: ViewRect, b: ViewRect): ViewRect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

function expandRect(rect: ViewRect, pad: number): ViewRect {
  return {
    x: rect.x - pad,
    y: rect.y - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
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

export function layerSelectionRect(layer: DesignLayer, canvasWidth: number): ViewRect {
  if (layer.type === "image") {
    return transformedAabb({
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      scaleX: layer.scaleX,
      scaleY: layer.scaleY,
      rotation: layer.rotation,
    });
  }

  const boxWidth = layer.width ?? getDefaultTextBoxWidth(canvasWidth);
  return transformedAabb({
    x: layer.x,
    y: layer.y,
    width: boxWidth,
    height: estimateTextBlockHeight(layer, boxWidth),
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    rotation: layer.rotation,
    offsetX: getTextOffsetX(layer.align, boxWidth),
  });
}

export function fitSelectionView(input: {
  canvasWidth: number;
  canvasHeight: number;
  maxWidth: number;
  maxHeight: number;
  layerBox: ViewRect | null;
  handleScreenPx: number;
}): SelectionView {
  const canvasWidth = Math.max(1, input.canvasWidth);
  const canvasHeight = Math.max(1, input.canvasHeight);
  const maxWidth = Math.max(1, input.maxWidth);
  const maxHeight = Math.max(1, input.maxHeight);
  const phone: ViewRect = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
  const baseScale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight);
  const content = input.layerBox ? unionRects(phone, input.layerBox) : phone;

  let scale = Math.min(maxWidth / Math.max(content.width, 1), maxHeight / Math.max(content.height, 1));
  let padded = content;
  if (input.layerBox && input.handleScreenPx > 0) {
    const pad = input.handleScreenPx / Math.max(scale, 1e-4);
    padded = expandRect(content, pad);
    scale = Math.min(
      maxWidth / Math.max(padded.width, 1),
      maxHeight / Math.max(padded.height, 1),
    );
  }
  scale = Math.min(scale, baseScale);

  const stageWidth = Math.max(1, Math.round(padded.width * scale));
  const stageHeight = Math.max(1, Math.round(padded.height * scale));
  const uniform = Math.min(stageWidth / padded.width, stageHeight / padded.height);
  const boost = Math.min(MAX_PIXEL_RATIO_BOOST, Math.max(1, baseScale / uniform));

  return {
    scale: uniform,
    stageWidth,
    stageHeight,
    offsetX: -padded.x || 0,
    offsetY: -padded.y || 0,
    phoneCrop: {
      x: (-padded.x || 0) * uniform,
      y: (-padded.y || 0) * uniform,
      width: canvasWidth * uniform,
      height: canvasHeight * uniform,
      pixelRatioBoost: boost,
    },
  };
}
