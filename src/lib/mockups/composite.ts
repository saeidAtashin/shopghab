import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";

import { MockupError } from "./errors";
import { resolveInside } from "./paths";
import type { FillStrategy, MockupTemplateConfig, Point } from "./types";
import { displaceImage, warpImage, type RawImage } from "./warp";

type Rgba = { r: number; g: number; b: number; alpha: number };

export function parseHexColor(input: string): Rgba {
  const value = input.trim().replace(/^#/, "");
  const expanded = value.length === 3 ? [...value].map((char) => char + char).join("") : value;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) throw new MockupError("unsupported");
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
    alpha: 1,
  };
}

function holeSvg(x: number, y: number, width: number, height: number, canvasWidth: number, canvasHeight: number): Buffer {
  return Buffer.from(
    `<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#000"/></svg>`,
  );
}

async function punchRect(image: Buffer, left: number, top: number, width: number, height: number, canvasWidth: number, canvasHeight: number): Promise<Buffer> {
  if (width < 1 || height < 1) return image;
  return sharp(image)
    .composite([{ input: holeSvg(left, top, width, height, canvasWidth, canvasHeight), blend: "dest-out" }])
    .png()
    .toBuffer();
}

async function edgeBuffer(
  contained: Buffer,
  extract: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
): Promise<Buffer | null> {
  if (width < 1 || height < 1 || extract.width < 1 || extract.height < 1) return null;
  return sharp(contained).extract(extract).resize(width, height, { fit: "fill" }).png().toBuffer();
}

export async function buildPrintableTexture(
  artworkPath: string,
  regionWidth: number,
  regionHeight: number,
  fill: FillStrategy,
): Promise<Buffer> {
  if (regionWidth < 1 || regionHeight < 1) throw new MockupError("unconfiguredRegion");
  const meta = await sharp(artworkPath).metadata();
  if (!meta.width || !meta.height) throw new MockupError("invalidArtwork");

  const contained = await sharp(artworkPath)
    .ensureAlpha()
    .resize(regionWidth, regionHeight, { fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();
  const placed = await sharp(contained).metadata();
  const placedWidth = placed.width ?? 0;
  const placedHeight = placed.height ?? 0;
  if (placedWidth < 1 || placedHeight < 1) throw new MockupError("invalidArtwork");
  const left = Math.floor((regionWidth - placedWidth) / 2);
  const top = Math.floor((regionHeight - placedHeight) / 2);

  let background: Buffer;
  if (fill.strategy === "solid") {
    const color = parseHexColor(fill.color);
    background = await sharp({
      create: { width: regionWidth, height: regionHeight, channels: 4, background: color },
    })
      .png()
      .toBuffer();
  } else if (fill.strategy === "blur") {
    const sigma = Math.min(100, Math.max(0.3, fill.sigma ?? 24));
    background = await sharp(artworkPath)
      .resize(regionWidth, regionHeight, { fit: "cover" })
      .blur(sigma)
      .ensureAlpha()
      .png()
      .toBuffer();
  } else {
    const transparent = await sharp({
      create: {
        width: regionWidth,
        height: regionHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
    const sourceMeta = { width: placedWidth, height: placedHeight };
    const right = regionWidth - (left + placedWidth);
    const bottom = regionHeight - (top + placedHeight);
    const overlays: { input: Buffer; left: number; top: number }[] = [];
    const push = async (
      extract: { left: number; top: number; width: number; height: number },
      box: { left: number; top: number; width: number; height: number },
    ) => {
      const piece = await edgeBuffer(contained, extract, box.width, box.height);
      if (piece) overlays.push({ input: piece, left: box.left, top: box.top });
    };
    await push({ left: 0, top: 0, width: 1, height: 1 }, { left: 0, top: 0, width: left, height: top });
    await push(
      { left: sourceMeta.width - 1, top: 0, width: 1, height: 1 },
      { left: left + placedWidth, top: 0, width: right, height: top },
    );
    await push(
      { left: 0, top: sourceMeta.height - 1, width: 1, height: 1 },
      { left: 0, top: top + placedHeight, width: left, height: bottom },
    );
    await push(
      { left: sourceMeta.width - 1, top: sourceMeta.height - 1, width: 1, height: 1 },
      { left: left + placedWidth, top: top + placedHeight, width: right, height: bottom },
    );
    await push({ left: 0, top: 0, width: sourceMeta.width, height: 1 }, { left, top: 0, width: placedWidth, height: top });
    await push(
      { left: 0, top: sourceMeta.height - 1, width: sourceMeta.width, height: 1 },
      { left, top: top + placedHeight, width: placedWidth, height: bottom },
    );
    await push({ left: 0, top: 0, width: 1, height: sourceMeta.height }, { left: 0, top, width: left, height: placedHeight });
    await push(
      { left: sourceMeta.width - 1, top: 0, width: 1, height: sourceMeta.height },
      { left: left + placedWidth, top, width: right, height: placedHeight },
    );
    background = overlays.length > 0 ? await sharp(transparent).composite(overlays).png().toBuffer() : transparent;
  }

  const bars = await punchRect(background, left, top, placedWidth, placedHeight, regionWidth, regionHeight);
  return sharp(bars).composite([{ input: contained, left, top }]).png().toBuffer();
}

async function toRaw(input: Buffer | string, width: number, height: number): Promise<RawImage> {
  const { data, info } = await sharp(input)
    .resize(width, height, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function rawPng(image: RawImage): Promise<Buffer> {
  return sharp(image.data, { raw: { width: image.width, height: image.height, channels: 4 } }).png().toBuffer();
}

function roundedMask(width: number, height: number, radius: number, origin: Point, rectWidth: number, rectHeight: number): Buffer {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect x="${origin.x}" y="${origin.y}" width="${rectWidth}" height="${rectHeight}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
}

async function loadMaskAlpha(maskPath: string, width: number, height: number): Promise<Buffer> {
  const meta = await sharp(maskPath).metadata();
  if (!meta.width || !meta.height) throw new MockupError("missingMask");
  const { data, info } = await sharp(maskPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minAlpha = 255;
  for (let index = 3; index < data.length; index += 4) {
    minAlpha = Math.min(minAlpha, data[index] ?? 255);
  }
  const alpha = Buffer.alloc(info.width * info.height);
  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    const index = pixel * 4;
    if (minAlpha < 250) {
      alpha[pixel] = data[index + 3] ?? 0;
    } else {
      const red = data[index] ?? 0;
      const green = data[index + 1] ?? 0;
      const blue = data[index + 2] ?? 0;
      alpha[pixel] = Math.round(0.2126 * red + 0.7152 * green + 0.0722 * blue);
    }
  }
  const gray = await sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
  const resized = await sharp(gray).resize(width, height, { fit: "fill" }).raw().toBuffer();
  const rgba = Buffer.alloc(width * height * 4, 255);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    rgba[pixel * 4 + 3] = resized[pixel] ?? 0;
  }
  return rawPng({ data: rgba, width, height });
}

async function fitLayer(filePath: string, width: number, height: number): Promise<Buffer> {
  const meta = await sharp(filePath).metadata();
  const sourceWidth = meta.width ?? width;
  const sourceHeight = meta.height ?? height;
  const sameAspect = Math.abs(sourceWidth / sourceHeight - width / height) < 0.02;
  return sharp(filePath)
    .resize(width, height, {
      fit: sameAspect ? "fill" : "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

function existingFile(
  root: string,
  relativePath: string | null,
  code: "missingBase" | "missingMask" | "unsupported",
): string {
  if (!relativePath) throw new MockupError(code);
  const absolute = resolveInside(root, relativePath);
  if (!existsSync(absolute)) throw new MockupError(code);
  return absolute;
}

export async function compositePrepared(options: {
  artworkPath: string;
  template: MockupTemplateConfig;
  templateRoot: string;
  outputPath: string;
  thumbPath: string;
}): Promise<{ width: number; height: number }> {
  const { template } = options;
  const regionWidth = template.printable.width;
  const regionHeight = template.printable.height;
  if (regionWidth < 1 || regionHeight < 1) throw new MockupError("unconfiguredRegion");
  const basePath = existingFile(options.templateRoot, template.basePath, "missingBase");
  const outputWidth = template.output.width;
  const outputHeight = template.output.height;
  const texture = await buildPrintableTexture(options.artworkPath, regionWidth, regionHeight, template.fill);
  const textureRaw = await toRaw(texture, regionWidth, regionHeight);

  let placed: Buffer;
  if (template.printable.quad) {
    const warped = warpImage(textureRaw, template.printable.quad, outputWidth, outputHeight);
    placed = await rawPng(warped);
  } else {
    const origin = template.printable.origin ?? { x: 0, y: 0 };
    placed = await sharp({
      create: {
        width: outputWidth,
        height: outputHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: texture, left: Math.round(origin.x), top: Math.round(origin.y) }])
      .png()
      .toBuffer();
  }

  if (template.displacementPath && template.displacementScale > 0) {
    const displacementPath = existingFile(options.templateRoot, template.displacementPath, "unsupported");
    const map = await toRaw(await sharp(displacementPath).png().toBuffer(), outputWidth, outputHeight);
    const art = await toRaw(placed, outputWidth, outputHeight);
    placed = await rawPng(displaceImage(art, map, template.displacementScale, template.displacementScale));
  }

  if (template.maskPath) {
    const mask = await loadMaskAlpha(
      existingFile(options.templateRoot, template.maskPath, "missingMask"),
      outputWidth,
      outputHeight,
    );
    placed = await sharp(placed).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  } else if (template.cornerRadius > 0 && !template.printable.quad) {
    const origin = template.printable.origin ?? { x: 0, y: 0 };
    placed = await sharp(placed)
      .composite([
        {
          input: roundedMask(outputWidth, outputHeight, template.cornerRadius, origin, regionWidth, regionHeight),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();
  }

  const overlays: { input: Buffer; blend?: "multiply" | "screen" }[] = [{ input: placed }];
  if (template.shadePath) {
    overlays.push({
      input: await fitLayer(existingFile(options.templateRoot, template.shadePath, "unsupported"), outputWidth, outputHeight),
      blend: "multiply",
    });
  }
  if (template.highlightPath) {
    overlays.push({
      input: await fitLayer(
        existingFile(options.templateRoot, template.highlightPath, "unsupported"),
        outputWidth,
        outputHeight,
      ),
      blend: "screen",
    });
  }

  const composited = await sharp(await fitLayer(basePath, outputWidth, outputHeight))
    .composite(overlays)
    .webp({ quality: template.output.quality })
    .toBuffer();

  const dir = mkdtempSync(join(tmpdir(), "shopghab-mockup-"));
  const tempImage = join(dir, "out.webp");
  const tempThumb = join(dir, "thumb.webp");
  try {
    writeFileSync(tempImage, composited);
    const thumb = await sharp(composited)
      .resize(template.output.thumbEdge, template.output.thumbEdge, { fit: "inside" })
      .webp({ quality: 80 })
      .toBuffer();
    writeFileSync(tempThumb, thumb);
    const { publishValidatedWebp } = await import("./output");
    const size = await publishValidatedWebp(tempImage, options.outputPath);
    await publishValidatedWebp(tempThumb, options.thumbPath);
    return size;
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 40 });
    } catch {
      // A locked temp directory must not fail a file that was already published.
    }
  }
}
