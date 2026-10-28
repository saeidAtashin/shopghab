import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { initializeCanvas, readPsd, type Layer } from "ag-psd";
import sharp from "sharp";

import { splitPrintStack } from "../src/lib/mockups/stack";

const PSD_PATH =
  process.argv[2] ??
  "c:/Users/s.atashin/OneDrive/Desktop/Free-Iphone-16-Phone-Cover-Mockup/Free-Iphone-16-Phone-Cover-Mockup.psd";
const OUT_DIR = join(process.cwd(), "public", "images", "hero-phone");
const MAX_EDGE = 1600;
const OMITTED = new Set(["Background", "Delete This Layer"]);

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

function outputSize(width: number, height: number) {
  const scale = MAX_EDGE / Math.max(width, height);
  return {
    scale,
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function omitStudio(layers: Layer[]): Layer[] {
  return layers.filter((layer) => !OMITTED.has(layer.name ?? ""));
}

async function main() {
  const psd = readPsd(readFileSync(PSD_PATH), {
    skipLayerImageData: false,
    skipCompositeImageData: true,
    skipThumbnail: true,
    skipLinkedFilesData: true,
    useImageData: true,
    logMissingFeatures: false,
  });
  const width = psd.width;
  const height = psd.height;
  const layers = omitStudio(psd.children ?? []);
  let stack = await splitPrintStack({
    layers,
    width,
    height,
    smartObjectName: "Design",
  });
  if (!stack) {
    const design = layers
      .flatMap(function walk(layer: Layer): Layer[] {
        return [layer, ...(layer.children ?? []).flatMap(walk)];
      })
      .find((layer) => layer.name === "Design");
    if (design?.placedLayer) design.placedLayer.warp = undefined;
    stack = await splitPrintStack({
      layers,
      width,
      height,
      smartObjectName: "Design",
    });
  }
  if (!stack) throw new Error("Design smart object could not be split");

  const size = outputSize(width, height);
  mkdirSync(OUT_DIR, { recursive: true });
  await sharp(stack.base).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(OUT_DIR, "base.png"));
  await sharp(stack.mask).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(OUT_DIR, "mask.png"));

  const overlays = [];
  for (let index = 0; index < stack.overlays.length; index += 1) {
    const overlay = stack.overlays[index];
    if (!overlay) continue;
    const file = `overlay-${index}.png`;
    await sharp(overlay.png).resize(size.width, size.height, { fit: "fill" }).png().toFile(join(OUT_DIR, file));
    overlays.push({ file, blend: overlay.blend, name: overlay.name });
  }

  const [x0, y0, x1, y1] = stack.transform;
  const print = {
    x: Math.round((x0 ?? 0) * size.scale),
    y: Math.round((y0 ?? 0) * size.scale),
    width: Math.round(((x1 ?? 0) - (x0 ?? 0)) * size.scale),
    height: Math.round(((stack.transform[5] ?? 0) - (y1 ?? 0)) * size.scale),
  };

  const base = await sharp(join(OUT_DIR, "base.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sampleX = print.x + Math.floor(print.width / 2);
  const sampleY = print.y + Math.floor(print.height / 2);
  const sampleAlpha = base.data[(sampleY * base.info.width + sampleX) * 4 + 3] ?? 0;

  const manifest = {
    width: size.width,
    height: size.height,
    print,
    printWindowTransparent: sampleAlpha < 16,
    overlays,
  };
  writeFileSync(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
