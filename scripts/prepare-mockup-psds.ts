import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { initializeCanvas, readPsd, type Layer, type PixelData, type Warp } from "ag-psd";
import sharp from "sharp";

import { mockupTemplates } from "../mockup-templates/templates.config";
import { mockupRoot } from "../src/lib/mockups/paths";
import type { MockupTemplateConfig, Point } from "../src/lib/mockups/types";

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

function choosePrintable(layers: Layer[]): Placed | null {
  const candidates: Placed[] = [];
  for (const layer of layers) {
    const placed = layer.placedLayer;
    if (!placed || placed.transform.length !== 8 || warpIsMesh(placed.warp)) continue;
    const width = placed.width ?? (layer.right ?? 0) - (layer.left ?? 0);
    const height = placed.height ?? (layer.bottom ?? 0) - (layer.top ?? 0);
    if (width < 1 || height < 1) continue;
    if (!layer.imageData && !layer.mask?.imageData) continue;
    candidates.push({
      layer,
      name: layer.name ?? "",
      width: Math.round(width),
      height: Math.round(height),
      transform: placed.transform,
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
    fit: "contain",
    fill: { strategy: "blur", sigma: 24 },
    cornerRadius: 0,
  }`;
    })
    .join(",\n");
  return `import type { MockupTemplateConfig } from "@/lib/mockups/types";

/**
 * Placement comes from each PSD Smart Object. A Photoshop warp descriptor with
 * style "none" is not a mesh, so its four corners are used as-is.
 * Files without a plain 8-point transform stay disabled.
 */
export const mockupTemplates: MockupTemplateConfig[] = [
${body},
];
`;
}

async function prepareOne(
  root: string,
  template: MockupTemplateConfig,
): Promise<MockupTemplateConfig> {
  const psdPath = join(root, template.psdPath);
  const psd = readPsd(readFileSync(psdPath), {
    skipLayerImageData: false,
    skipCompositeImageData: false,
    skipThumbnail: true,
    skipLinkedFilesData: true,
    useImageData: true,
    logMissingFeatures: false,
  });
  const layers: Layer[] = [];
  walk(psd.children, layers);
  const printable = choosePrintable(layers);
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
  const placed = await placeOnCanvas(maskPng, psd.width, psd.height, maskLeft, maskTop);
  const base = await sharp(await toPng(psd.imageData))
    .composite([{ input: placed, blend: "dest-out" }])
    .png()
    .toBuffer();
  const dir = join(root, "prepared", template.id);
  mkdirSync(dir, { recursive: true });
  await sharp(base).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(dir, "base.png"));
  await sharp(placed).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(dir, "mask.png"));

  const next: MockupTemplateConfig = {
    ...template,
    enabled: true,
    version: "2",
    output: { ...template.output, width: size.width, height: size.height },
    printable: {
      width: printable.width,
      height: printable.height,
      quad: quadFromTransform(printable.transform, psd.width, psd.height, size.width, size.height),
      smartObjectName: printable.name,
    },
    basePath: `prepared/${template.id}/base.png`,
    maskPath: `prepared/${template.id}/mask.png`,
  };
  console.log(
    `${template.id}: ${printable.name} ${printable.width}x${printable.height} -> ${size.width}x${size.height}`,
  );
  return next;
}

async function main(): Promise<void> {
  const root = mockupRoot();
  const next: MockupTemplateConfig[] = [];
  for (const template of mockupTemplates) {
    try {
      next.push(await prepareOne(root, template));
    } catch (error) {
      const message = error instanceof Error ? error.message : "prepare failed";
      console.warn(`${template.psdPath}: ${message}. Left disabled.`);
      next.push(template);
    }
  }
  const configPath = join(root, "templates.config.ts");
  writeFileSync(configPath, renderConfig(next), "utf8");
  const enabled = next.filter((template) => template.enabled).length;
  console.log(`Prepared ${enabled} of ${next.length} templates.`);
  if (enabled === 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Mockup prepare failed.");
  process.exit(1);
});
