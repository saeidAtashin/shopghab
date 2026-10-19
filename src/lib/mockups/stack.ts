import type { Layer, LayerMaskData, PixelData, Warp } from "ag-psd";
import sharp from "sharp";

import { applyLinearBurn } from "./composite";
import { placementCorners } from "./placement";
import type { OverlayBlend, PrintableMesh } from "./types";

export type StackOverlay = {
  name: string;
  blend: OverlayBlend;
  png: Buffer;
};

export type PrintStack = {
  name: string;
  width: number;
  height: number;
  transform: number[];
  mesh: PrintableMesh | null;
  base: Buffer;
  mask: Buffer;
  overlays: StackOverlay[];
};

type Size = { width: number; height: number };

type PaintTarget = {
  passedSlot: boolean;
  base: Buffer;
  mask: Buffer | null;
  overlays: StackOverlay[];
};

/** A styled warp we cannot place. A complete custom envelope grid is kept. */
export function envelopeMesh(warp: Warp | undefined): PrintableMesh | null {
  const columns = warp?.deformNumCols ?? 0;
  const rows = warp?.deformNumRows ?? 0;
  const points = warp?.customEnvelopeWarp?.meshPoints ?? [];
  if (columns < 2 || rows < 2 || points.length !== columns * rows) return null;
  return {
    columns,
    rows,
    points: points.map((point) => ({ x: point.x, y: point.y })),
  };
}

export function warpIsMesh(warp: Warp | undefined): boolean {
  if (!warp) return false;
  if (envelopeMesh(warp)) return false;
  if (warp.customEnvelopeWarp?.meshPoints?.length) return true;
  if (warp.style && warp.style !== "none") return true;
  if ((warp.value ?? 0) !== 0) return true;
  if ((warp.perspective ?? 0) !== 0) return true;
  if ((warp.perspectiveOther ?? 0) !== 0) return true;
  return false;
}

export function overlayBlend(mode: string | undefined): OverlayBlend {
  const value = (mode ?? "normal").toLowerCase();
  if (value === "linear burn" || value === "linear-burn") return "linear-burn";
  if (value === "screen" || value === "multiply") return value;
  return "normal";
}

function layerOpacity(layer: Layer): number {
  const value = layer.opacity;
  if (value === undefined) return 1;
  if (value > 1) return Math.min(1, value / 255);
  return Math.max(0, Math.min(1, value));
}

function pixelChannels(image: PixelData): 1 | 3 | 4 {
  const channels = image.data.length / (image.width * image.height);
  if (channels !== 1 && channels !== 3 && channels !== 4) {
    throw new Error(`Unexpected pixel layout ${image.width}x${image.height} / ${image.data.length}`);
  }
  return channels;
}

function maskValue(image: PixelData, pixel: number): number {
  const channels = pixelChannels(image);
  if (channels === 1) return image.data[pixel] ?? 0;
  if (channels === 3) return image.data[pixel * 3] ?? 0;
  const alpha = image.data[pixel * 4 + 3] ?? 255;
  const red = image.data[pixel * 4] ?? 0;
  return alpha < 250 ? alpha : red;
}

function findNamedSlot(layers: Layer[] | undefined, name: string): Layer | null {
  for (const layer of layers ?? []) {
    if ((layer.name ?? "") === name && layer.placedLayer) return layer;
    const nested = findNamedSlot(layer.children, name);
    if (nested) return nested;
  }
  return null;
}

function containsSlot(layer: Layer, slot: Layer): boolean {
  if (layer === slot) return true;
  return (layer.children ?? []).some((child) => containsSlot(child, slot));
}

function area(layer: Layer): number {
  return Math.max(0, (layer.right ?? 0) - (layer.left ?? 0)) * Math.max(0, (layer.bottom ?? 0) - (layer.top ?? 0));
}

function rankPrintable(layer: Layer): number {
  const name = (layer.name ?? "").toLowerCase();
  let score = area(layer);
  if (layer.mask?.imageData && !layer.mask.disabled) score += 1_000_000_000;
  if (name.includes("print") || name.includes("design")) score += 500_000_000;
  if (name.includes("emboss")) score -= 250_000_000;
  if (!layer.hidden) score += 100_000_000;
  return score;
}

function collectPlaced(layers: Layer[] | undefined, found: Layer[]): void {
  for (const layer of layers ?? []) {
    const placed = layer.placedLayer;
    const corners = placed ? placementCorners(placed) : [];
    if (placed && placed.transform.length === 8 && corners.length === 8 && !warpIsMesh(placed.warp)) found.push(layer);
    collectPlaced(layer.children, found);
  }
}

function findSlot(layers: Layer[], smartObjectName: string): Layer | null {
  const named = smartObjectName.trim() ? findNamedSlot(layers, smartObjectName.trim()) : null;
  if (named) return named;
  if (smartObjectName.trim()) return null;
  const candidates: Layer[] = [];
  collectPlaced(layers, candidates);
  candidates.sort((left, right) => rankPrintable(right) - rankPrintable(left));
  return candidates[0] ?? null;
}

function samePlaced(layer: Layer, slot: Layer): boolean {
  const id = slot.placedLayer?.id;
  return Boolean(id && layer !== slot && layer.placedLayer?.id === id);
}

async function emptyCanvas(size: Size): Promise<Buffer> {
  return sharp({
    create: { width: size.width, height: size.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
}

async function pixelsToPng(image: PixelData): Promise<Buffer> {
  const channels = pixelChannels(image);
  let pipeline = sharp(Buffer.from(image.data), {
    raw: { width: image.width, height: image.height, channels },
  });
  if (channels !== 4) pipeline = pipeline.ensureAlpha();
  return pipeline.png().toBuffer();
}

async function placeOnCanvas(image: Buffer, size: Size, left: number, top: number): Promise<Buffer> {
  const meta = await sharp(image).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  let srcLeft = 0;
  let srcTop = 0;
  let srcWidth = width;
  let srcHeight = height;
  let destLeft = Math.round(left);
  let destTop = Math.round(top);
  if (destLeft < 0) {
    srcLeft = -destLeft;
    srcWidth -= srcLeft;
    destLeft = 0;
  }
  if (destTop < 0) {
    srcTop = -destTop;
    srcHeight -= srcTop;
    destTop = 0;
  }
  if (destLeft + srcWidth > size.width) srcWidth = size.width - destLeft;
  if (destTop + srcHeight > size.height) srcHeight = size.height - destTop;
  const canvas = sharp({
    create: { width: size.width, height: size.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  });
  if (srcWidth < 1 || srcHeight < 1) return canvas.png().toBuffer();
  const extracted = await sharp(image)
    .extract({ left: srcLeft, top: srcTop, width: srcWidth, height: srcHeight })
    .png()
    .toBuffer();
  return canvas.composite([{ input: extracted, left: destLeft, top: destTop }]).png().toBuffer();
}

const maskCache = new WeakMap<LayerMaskData, Buffer>();

async function maskToCanvas(mask: LayerMaskData, size: Size, layer?: Layer): Promise<Buffer> {
  const cached = maskCache.get(mask);
  if (cached) return cached;
  const fallback = mask.defaultColor ?? 0;
  const data = Buffer.alloc(size.width * size.height * 4, 255);
  for (let pixel = 0; pixel < size.width * size.height; pixel += 1) data[pixel * 4 + 3] = fallback;
  if (mask.imageData) {
    const image = mask.imageData;
    const originX = (mask.positionRelativeToLayer ? (layer?.left ?? 0) : 0) + (mask.left ?? 0);
    const originY = (mask.positionRelativeToLayer ? (layer?.top ?? 0) : 0) + (mask.top ?? 0);
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const destX = originX + x;
        const destY = originY + y;
        if (destX < 0 || destY < 0 || destX >= size.width || destY >= size.height) continue;
        data[(destY * size.width + destX) * 4 + 3] = maskValue(image, y * image.width + x);
      }
    }
  }
  const png = await sharp(data, { raw: { width: size.width, height: size.height, channels: 4 } }).png().toBuffer();
  maskCache.set(mask, png);
  return png;
}

async function applyOpacity(plate: Buffer, opacity: number): Promise<Buffer> {
  if (opacity >= 0.999) return plate;
  const { data, info } = await sharp(plate).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    data[pixel * 4 + 3] = Math.round((data[pixel * 4 + 3] ?? 0) * opacity);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function clipPlate(plate: Buffer, clip: Buffer): Promise<Buffer> {
  return sharp(plate).composite([{ input: clip, blend: "dest-in" }]).png().toBuffer();
}

async function alphaMask(plate: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(plate).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = Buffer.alloc(info.width * info.height * 4, 255);
  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) mask[pixel * 4 + 3] = data[pixel * 4 + 3] ?? 0;
  return sharp(mask, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function blendPlate(base: Buffer, plate: Buffer, blend: OverlayBlend): Promise<Buffer> {
  if (blend === "linear-burn") return applyLinearBurn(base, plate);
  return sharp(base)
    .composite([{ input: plate, blend: blend === "normal" ? "over" : blend }])
    .png()
    .toBuffer();
}

async function withLayerMask(plate: Buffer, layer: Layer, ancestors: Buffer[], size: Size): Promise<Buffer> {
  let next = plate;
  if (layer.mask?.imageData && !layer.mask.disabled) {
    next = await clipPlate(next, await maskToCanvas(layer.mask, size, layer));
  }
  for (const mask of ancestors) next = await clipPlate(next, mask);
  return applyOpacity(next, layerOpacity(layer));
}

async function rasterize(layer: Layer, ancestors: Buffer[], size: Size): Promise<Buffer | null> {
  if (!layer.imageData) return null;
  const placed = await placeOnCanvas(
    await pixelsToPng(layer.imageData),
    size,
    layer.left ?? 0,
    layer.top ?? 0,
  );
  return withLayerMask(placed, layer, ancestors, size);
}

async function ancestorMasks(layer: Layer, ancestors: Buffer[], size: Size): Promise<Buffer[]> {
  if (!layer.mask?.imageData || layer.mask.disabled) return ancestors;
  return [...ancestors, await maskToCanvas(layer.mask, size, layer)];
}

async function flattenLayers(layers: Layer[], ancestors: Buffer[], size: Size): Promise<Buffer> {
  let canvas = await emptyCanvas(size);
  let clip: Buffer | null = null;
  for (const layer of layers) {
    if (layer.hidden || layerOpacity(layer) <= 0) continue;
    if (layer.children?.length) {
      const nested = await flattenLayers(layer.children, await ancestorMasks(layer, ancestors, size), size);
      const plate = await applyOpacity(nested, layerOpacity(layer));
      if (layer.clipping) {
        if (!clip) continue;
        const clipped = await clipPlate(plate, clip);
        canvas = await blendPlate(canvas, clipped, overlayBlend(layer.blendMode));
      } else {
        clip = await alphaMask(plate);
        canvas = await blendPlate(canvas, plate, overlayBlend(layer.blendMode));
      }
      continue;
    }
    const plate = await rasterize(layer, ancestors, size);
    if (!plate) continue;
    if (layer.clipping) {
      if (!clip) continue;
      canvas = await blendPlate(canvas, await clipPlate(plate, clip), overlayBlend(layer.blendMode));
    } else {
      clip = await alphaMask(plate);
      canvas = await blendPlate(canvas, plate, overlayBlend(layer.blendMode));
    }
  }
  return canvas;
}

async function slotMask(slot: Layer, ancestors: Buffer[], size: Size): Promise<Buffer> {
  if (slot.mask?.imageData && !slot.mask.disabled) {
    return withLayerMask(await maskToCanvas(slot.mask, size, slot), { ...slot, mask: undefined }, ancestors, size);
  }
  if (slot.imageData) {
    const plate = await rasterize(slot, ancestors, size);
    if (plate) return alphaMask(plate);
  }
  const opaque = await sharp({
    create: { width: size.width, height: size.height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .png()
    .toBuffer();
  return withLayerMask(opaque, { ...slot, mask: undefined }, ancestors, size);
}

async function paintContainer(layers: Layer[], ancestors: Buffer[], target: PaintTarget, slot: Layer, size: Size): Promise<void> {
  let clip: Buffer | null = null;
  for (const layer of layers) {
    if (layer === slot) {
      target.passedSlot = true;
      target.mask = await slotMask(slot, ancestors, size);
      continue;
    }
    if (samePlaced(layer, slot) || layer.hidden || layerOpacity(layer) <= 0) continue;
    if (layer.children?.length) {
      const nestedMasks = await ancestorMasks(layer, ancestors, size);
      const pass = (layer.blendMode ?? "pass through") === "pass through" || containsSlot(layer, slot);
      if (pass) {
        await paintContainer(layer.children, nestedMasks, target, slot, size);
        continue;
      }
      const plate = await applyOpacity(await flattenLayers(layer.children, nestedMasks, size), layerOpacity(layer));
      if (layer.clipping) {
        if (!clip) continue;
        await emit(target, layer, await clipPlate(plate, clip));
      } else {
        clip = await alphaMask(plate);
        await emit(target, layer, plate);
      }
      continue;
    }
    const plate = await rasterize(layer, ancestors, size);
    if (!plate) continue;
    if (layer.clipping) {
      if (!clip) continue;
      await emit(target, layer, await clipPlate(plate, clip));
    } else {
      clip = await alphaMask(plate);
      await emit(target, layer, plate);
    }
  }
}

async function emit(target: PaintTarget, layer: Layer, plate: Buffer): Promise<void> {
  const blend = overlayBlend(layer.blendMode);
  if (!target.passedSlot) {
    target.base = await blendPlate(target.base, plate, blend);
    return;
  }
  target.overlays.push({ name: layer.name ?? "overlay", blend, png: plate });
}

/**
 * Splits a PSD around the named Print smart object.
 * Layers below become the base, the Print mask stays in document pixels,
 * and each visible layer above is saved in stack order.
 * Returns null when that smart object is missing or uses a warp we cannot place.
 */
export async function splitPrintStack(options: {
  layers: Layer[];
  width: number;
  height: number;
  smartObjectName: string;
}): Promise<PrintStack | null> {
  const slot = findSlot(options.layers, options.smartObjectName);
  const placed = slot?.placedLayer;
  const corners = placed ? placementCorners(placed) : [];
  if (!slot || !placed || placed.transform.length !== 8 || corners.length !== 8 || warpIsMesh(placed.warp)) return null;
  const width = placed.width ?? (slot.right ?? 0) - (slot.left ?? 0);
  const height = placed.height ?? (slot.bottom ?? 0) - (slot.top ?? 0);
  if (width < 1 || height < 1) return null;

  const size = { width: options.width, height: options.height };
  const target: PaintTarget = {
    passedSlot: false,
    base: await emptyCanvas(size),
    mask: null,
    overlays: [],
  };
  await paintContainer(options.layers, [], target, slot, size);
  if (!target.passedSlot || !target.mask) return null;
  return {
    name: slot.name ?? "",
    width: Math.round(width),
    height: Math.round(height),
    transform: corners,
    base: target.base,
    mask: target.mask,
    mesh: envelopeMesh(placed.warp),
    overlays: target.overlays,
  };
}
