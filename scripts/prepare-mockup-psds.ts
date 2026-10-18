import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { initializeCanvas, readPsd, type Layer, type PixelData, type Warp } from "ag-psd";
import sharp from "sharp";

import { mockupTemplates } from "../mockup-templates/templates.config";
import { opaqueBoundsFillRectangle, placementCorners, quadIsAxisAligned } from "../src/lib/mockups/placement";
import { mockupRoot } from "../src/lib/mockups/paths";
import type { MockupTemplateConfig, Point } from "../src/lib/mockups/types";
import { warpImage, type RawImage } from "../src/lib/mockups/warp";

const MAX_EDGE = 1600;

initializeCanvas(
  (width, height) => {
    throw new Error(`Canvas ${width}x${height} is not available`);
  },
  (width, height) =>
    ({
      width,
      height,
      data: new Uint8ClampedArray(width * height * 4),
    }) as ImageData,
);

type Placed = {
  layer: Layer;
  name: string;
  width: number;
  height: number;
  transform: number[];
};

function warpIsMesh(warp: Warp | undefined): boolean {
  if (!warp) return false;
  if (warp.customEnvelopeWarp?.meshPoints?.length) return true;
  if (warp.style && warp.style !== "none") return true;
  if ((warp.value ?? 0) !== 0) return true;
  if ((warp.perspective ?? 0) !== 0) return true;
  if ((warp.perspectiveOther ?? 0) !== 0) return true;
  return false;
}

function walk(layers: Layer[] | undefined, found: Layer[]): void {
  for (const layer of layers ?? []) {
    found.push(layer);
    walk(layer.children, found);
  }
}

function area(layer: Layer): number {
  const width = (layer.right ?? 0) - (layer.left ?? 0);
  const height = (layer.bottom ?? 0) - (layer.top ?? 0);
  return Math.max(0, width) * Math.max(0, height);
}

function rankPrintable(item: Placed): number {
  const name = item.name.toLowerCase();
  let score = area(item.layer);
  if (item.layer.mask?.imageData && !item.layer.mask.disabled) score += 1_000_000_000;
  if (name.includes("print") || name.includes("design")) score += 500_000_000;
  if (name.includes("emboss")) score -= 250_000_000;
  if (!item.layer.hidden) score += 100_000_000;
  return score;
}

function choosePrintable(layers: Layer[], requirePixels: boolean): Placed | null {
  const candidates: Placed[] = [];
  for (const layer of layers) {
    const placed = layer.placedLayer;
    const corners = placed ? placementCorners(placed) : [];
    if (!placed || placed.transform.length !== 8 || corners.length !== 8 || warpIsMesh(placed.warp)) continue;
    const width = placed.width ?? (layer.right ?? 0) - (layer.left ?? 0);
    const height = placed.height ?? (layer.bottom ?? 0) - (layer.top ?? 0);
    if (width < 1 || height < 1) continue;
    if (requirePixels && !layer.imageData && !layer.mask?.imageData) continue;
    candidates.push({
      layer,
      name: layer.name ?? "",
      width: Math.round(width),
      height: Math.round(height),
      transform: corners,
    });
  }
  candidates.sort((a, b) => rankPrintable(b) - rankPrintable(a));
  return candidates[0] ?? null;
}

function pixelBuffer(image: PixelData): { data: Buffer; channels: 1 | 3 | 4 } {
  const pixels = image.width * image.height;
  const channels = image.data.length / pixels;
  if (channels !== 1 && channels !== 3 && channels !== 4) {
    throw new Error(`Unexpected pixel layout ${image.width}x${image.height} / ${image.data.length}`);
  }
  return { data: Buffer.from(image.data), channels };
}

async function maskToAlphaPng(image: PixelData): Promise<Buffer> {
  const raw = pixelBuffer(image);
  const pixels = image.width * image.height;
  const rgba = Buffer.alloc(pixels * 4);
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    let value = 0;
    if (raw.channels === 1) {
      value = raw.data[pixel] ?? 0;
    } else if (raw.channels === 3) {
      value = raw.data[pixel * 3] ?? 0;
    } else {
      const alpha = raw.data[pixel * 4 + 3] ?? 255;
      const red = raw.data[pixel * 4] ?? 0;
      value = alpha < 250 ? alpha : red;
    }
    const index = pixel * 4;
    rgba[index] = 255;
    rgba[index + 1] = 255;
    rgba[index + 2] = 255;
    rgba[index + 3] = value;
  }
  return sharp(rgba, { raw: { width: image.width, height: image.height, channels: 4 } }).png().toBuffer();
}

async function toPng(image: PixelData): Promise<Buffer> {
  const raw = pixelBuffer(image);
  let pipeline = sharp(raw.data, {
    raw: { width: image.width, height: image.height, channels: raw.channels },
  });
  if (raw.channels !== 4) pipeline = pipeline.ensureAlpha();
  return pipeline.png().toBuffer();
}

async function placeOnCanvas(
  image: Buffer,
  canvasWidth: number,
  canvasHeight: number,
  left: number,
  top: number,
): Promise<Buffer> {
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
  if (destLeft + srcWidth > canvasWidth) srcWidth = canvasWidth - destLeft;
  if (destTop + srcHeight > canvasHeight) srcHeight = canvasHeight - destTop;
  if (srcWidth < 1 || srcHeight < 1) throw new Error("Smart Object pixels sit outside the canvas");
  const extracted = await sharp(image)
    .extract({ left: srcLeft, top: srcTop, width: srcWidth, height: srcHeight })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: extracted, left: destLeft, top: destTop }])
    .png()
    .toBuffer();
}

function outputSize(width: number, height: number): { width: number; height: number } {
  const scale = MAX_EDGE / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function quadFromTransform(
  transform: number[],
  sourceWidth: number,
  sourceHeight: number,
  outputWidth: number,
  outputHeight: number,
): [Point, Point, Point, Point] {
  const sx = outputWidth / sourceWidth;
  const sy = outputHeight / sourceHeight;
  const point = (index: number): Point => ({
    x: Math.round((transform[index] ?? 0) * sx * 100) / 100,
    y: Math.round((transform[index + 1] ?? 0) * sy * 100) / 100,
  });
  return [point(0), point(2), point(4), point(6)];
}

function renderConfig(templates: MockupTemplateConfig[]): string {
  const body = templates
    .map((template) => {
      const quad = template.printable.quad;
      const quadText = quad
        ? `\n      quad: [\n${quad.map((point) => `        { x: ${point.x}, y: ${point.y} },`).join("\n")}\n      ],`
        : "";
      return `  {
    id: ${JSON.stringify(template.id)},
    name: ${JSON.stringify(template.name)},
    psdPath: ${JSON.stringify(template.psdPath)},
    enabled: ${template.enabled},
    renderer: "prepared",
    version: ${JSON.stringify(template.version)},
    default: ${template.default},
    output: { width: ${template.output.width}, height: ${template.output.height}, quality: ${template.output.quality}, thumbEdge: ${template.output.thumbEdge} },
    printable: {
      width: ${template.printable.width},
      height: ${template.printable.height},${quadText}
      smartObjectName: ${JSON.stringify(template.printable.smartObjectName ?? "")},
    },
    maskPath: ${template.maskPath ? JSON.stringify(template.maskPath) : "null"},
    basePath: ${template.basePath ? JSON.stringify(template.basePath) : "null"},
    shadePath: null,
    highlightPath: null,
    displacementPath: null,
    displacementScale: 0,
    fit: ${JSON.stringify(template.fit)},
    listing: ${template.listing},
    fill: { strategy: "blur", sigma: 24 },
    cornerRadius: 0,
  }`;
    })
    .join(",\n");
  return `import type { MockupTemplateConfig } from "@/lib/mockups/types";

/**
 * Placement comes from each PSD Smart Object. Rotated and perspective cases use
 * the non-affine corners, so the design turns with the case. A mesh warp is not
 * a four-corner placement and stays disabled.
 */
export const mockupTemplates: MockupTemplateConfig[] = [
${body},
];
`;
}

async function pngAlphaFillsRectangle(filePath: string): Promise<boolean> {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return opaqueBoundsFillRectangle(data, info.width, info.height, info.channels);
}

async function warpLocalMask(
  localPng: Buffer,
  quad: [Point, Point, Point, Point],
  canvasWidth: number,
  canvasHeight: number,
): Promise<Buffer> {
  const { data, info } = await sharp(localPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const source: RawImage = { data, width: info.width, height: info.height };
  const warped = warpImage(source, quad, canvasWidth, canvasHeight);
  return sharp(warped.data, { raw: { width: warped.width, height: warped.height, channels: 4 } }).png().toBuffer();
}

function readOptions(withPixels: boolean) {
  return {
    skipLayerImageData: !withPixels,
    skipCompositeImageData: !withPixels,
    skipThumbnail: true,
    skipLinkedFilesData: true,
    useImageData: withPixels,
    logMissingFeatures: false,
  } as const;
}

function readLayers(psdPath: string, withPixels: boolean): { psd: ReturnType<typeof readPsd>; layers: Layer[] } {
  const psd = readPsd(readFileSync(psdPath), readOptions(withPixels));
  const layers: Layer[] = [];
  walk(psd.children, layers);
  return { psd, layers };
}

async function isFlatColorBase(filePath: string): Promise<boolean> {
  const { data } = await sharp(filePath).resize(48, 48, { fit: "fill" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const samples: number[][] = [];
  for (let index = 0; index < data.length; index += 4) {
    if ((data[index + 3] ?? 0) < 200) continue;
    samples.push([data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0]);
  }
  if (samples.length < 20) return false;
  const mean = [0, 1, 2].map((channel) => samples.reduce((sum, pixel) => sum + (pixel[channel] ?? 0), 0) / samples.length);
  const deviation = [0, 1, 2].map((channel) => {
    const variance = samples.reduce((sum, pixel) => sum + ((pixel[channel] ?? 0) - (mean[channel] ?? 0)) ** 2, 0) / samples.length;
    return Math.sqrt(variance);
  });
  return deviation.every((value) => value < 10);
}

function placementOf(printable: Placed, psdWidth: number, psdHeight: number): MockupTemplateConfig["printable"] {
  const size = outputSize(psdWidth, psdHeight);
  return {
    width: printable.width,
    height: printable.height,
    quad: quadFromTransform(printable.transform, psdWidth, psdHeight, size.width, size.height),
    smartObjectName: printable.name,
  };
}

/** Updates the quad from PSD corners. Returns null when the hole is still a straight rectangle on a rotated case. */
async function refreshPreparedQuad(
  root: string,
  template: MockupTemplateConfig,
  maskFile: string,
): Promise<MockupTemplateConfig | null> {
  const { psd, layers } = readLayers(join(root, template.psdPath), false);
  const printable = choosePrintable(layers, false);
  if (!printable) {
    console.warn(`${template.id}: no placement found. Kept the existing files.`);
    return template;
  }
  const size = outputSize(psd.width, psd.height);
  const printableRegion = placementOf(printable, psd.width, psd.height);
  const quad = printableRegion.quad;
  if (quad && !quadIsAxisAligned(quad) && (await pngAlphaFillsRectangle(maskFile))) {
    console.log(`${template.id}: upright mask on a rotated case. Rebuilding the hole.`);
    return null;
  }
  console.log(`${template.id}: quad refreshed${quad && !quadIsAxisAligned(quad) ? " (rotated)" : ""}.`);
  return {
    ...template,
    output: { ...template.output, width: size.width, height: size.height },
    printable: printableRegion,
  };
}

async function prepareFromPixels(root: string, template: MockupTemplateConfig): Promise<MockupTemplateConfig> {
  const { psd, layers } = readLayers(join(root, template.psdPath), true);
  const printable = choosePrintable(layers, true);
  if (!printable || !psd.imageData) {
    console.warn(`${template.psdPath}: no plain Smart Object placement. Left disabled.`);
    return template;
  }

  const size = outputSize(psd.width, psd.height);
  const userMask = printable.layer.mask;
  const maskSource = userMask?.imageData && !userMask.disabled ? userMask.imageData : printable.layer.imageData;
  const maskLeft = userMask?.imageData && !userMask.disabled ? (userMask.left ?? 0) : (printable.layer.left ?? 0);
  const maskTop = userMask?.imageData && !userMask.disabled ? (userMask.top ?? 0) : (printable.layer.top ?? 0);
  if (!maskSource || !psd.imageData) {
    console.warn(`${template.psdPath}: Smart Object has no pixels. Left disabled.`);
    return template;
  }
  const maskPng = userMask?.imageData && !userMask.disabled ? await maskToAlphaPng(maskSource) : await toPng(maskSource);
  const placedStraight = await placeOnCanvas(maskPng, psd.width, psd.height, maskLeft, maskTop);
  const outputQuad = quadFromTransform(printable.transform, psd.width, psd.height, size.width, size.height);
  const rotateHole = !quadIsAxisAligned(outputQuad) && (await pngAlphaFillsRectangleBuffer(placedStraight));
  const dir = join(root, "prepared", template.id);
  mkdirSync(dir, { recursive: true });
  if (rotateHole) {
    const fittedBase = await sharp(await toPng(psd.imageData))
      .resize(size.width, size.height, { fit: "fill" })
      .png()
      .toBuffer();
    const placed = await warpLocalMask(maskPng, outputQuad, size.width, size.height);
    const base = await sharp(fittedBase).composite([{ input: placed, blend: "dest-out" }]).png().toBuffer();
    await sharp(base).png().toFile(join(dir, "base.png"));
    await sharp(placed).png().toFile(join(dir, "mask.png"));
  } else {
    const base = await sharp(await toPng(psd.imageData))
      .composite([{ input: placedStraight, blend: "dest-out" }])
      .png()
      .toBuffer();
    await sharp(base).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(dir, "base.png"));
    await sharp(placedStraight).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(dir, "mask.png"));
  }

  const basePath = `prepared/${template.id}/base.png`;
  const flatCard = await isFlatColorBase(join(dir, "base.png"));
  const next: MockupTemplateConfig = {
    ...template,
    enabled: true,
    version: template.version,
    listing: template.listing && !flatCard,
    output: { ...template.output, width: size.width, height: size.height },
    printable: placementOf(printable, psd.width, psd.height),
    basePath,
    maskPath: `prepared/${template.id}/mask.png`,
  };
  const rotated = next.printable.quad ? !quadIsAxisAligned(next.printable.quad) : false;
  console.log(
    `${template.id}: ${printable.name} ${printable.width}x${printable.height} -> ${size.width}x${size.height}${rotated ? " (rotated)" : ""}${flatCard ? " (flat card, not a listing photo)" : ""}`,
  );
  return next;
}

async function pngAlphaFillsRectangleBuffer(png: Buffer): Promise<boolean> {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return opaqueBoundsFillRectangle(data, info.width, info.height, info.channels);
}

async function prepareOne(root: string, template: MockupTemplateConfig): Promise<MockupTemplateConfig> {
  const baseFile = template.basePath ? join(root, template.basePath) : "";
  const maskFile = template.maskPath ? join(root, template.maskPath) : "";
  if (template.enabled && baseFile && maskFile && existsSync(baseFile) && existsSync(maskFile)) {
    const refreshed = await refreshPreparedQuad(root, template, maskFile);
    if (refreshed) return refreshed;
  }
  return prepareFromPixels(root, template);
}

async function main(): Promise<void> {
  const root = mockupRoot();
  const configPath = join(root, "templates.config.ts");
  const next: MockupTemplateConfig[] = [];
  for (const template of mockupTemplates) {
    try {
      next.push(await prepareOne(root, template));
    } catch (error) {
      const message = error instanceof Error ? error.message : "prepare failed";
      console.warn(`${template.psdPath}: ${message}. Left disabled.`);
      next.push(template);
    }
    writeFileSync(configPath, renderConfig([...next, ...mockupTemplates.slice(next.length)]), "utf8");
  }
  const enabled = next.filter((template) => template.enabled).length;
  console.log(`Prepared ${enabled} of ${next.length} templates.`);
  if (enabled === 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Mockup prepare failed.");
  process.exit(1);
});
