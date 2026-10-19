import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { initializeCanvas, readPsd, type Layer } from "ag-psd";
import sharp from "sharp";

import { mockupTemplates } from "../mockup-templates/templates.config";
import { quadIsAxisAligned } from "../src/lib/mockups/placement";
import { mockupRoot } from "../src/lib/mockups/paths";
import { splitPrintStack } from "../src/lib/mockups/stack";
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

function nextVersion(version: string): string {
  const value = Number(version);
  if (Number.isInteger(value) && value >= 0) return String(value + 1);
  return `${version}-stack`;
}

function renderConfig(templates: MockupTemplateConfig[]): string {
  const body = templates
    .map((template) => {
      const quad = template.printable.quad;
      const quadText = quad
        ? `\n      quad: [\n${quad.map((point) => `        { x: ${point.x}, y: ${point.y} },`).join("\n")}\n      ],`
        : "";
      const mesh = template.printable.mesh;
      const meshText = mesh
        ? `\n      mesh: {\n        columns: ${mesh.columns},\n        rows: ${mesh.rows},\n        points: [\n${mesh.points
            .map((point) => `          { x: ${point.x}, y: ${point.y} },`)
            .join("\n")}\n        ],\n      },`
        : "";
      const overlays = template.overlays;
      const overlayText =
        overlays === undefined
          ? ""
          : overlays.length
            ? `\n    overlays: [\n${overlays
                .map((overlay) => `      { path: ${JSON.stringify(overlay.path)}, blend: ${JSON.stringify(overlay.blend)} },`)
                .join("\n")}\n    ],`
            : "\n    overlays: [],";
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
      height: ${template.printable.height},${quadText}${meshText}
      smartObjectName: ${JSON.stringify(template.printable.smartObjectName ?? "")},
    },
    maskPath: ${template.maskPath ? JSON.stringify(template.maskPath) : "null"},
    basePath: ${template.basePath ? JSON.stringify(template.basePath) : "null"},
    shadePath: ${template.shadePath ? JSON.stringify(template.shadePath) : "null"},
    highlightPath: ${template.highlightPath ? JSON.stringify(template.highlightPath) : "null"},${overlayText}
    displacementPath: ${template.displacementPath ? JSON.stringify(template.displacementPath) : "null"},
    displacementScale: ${template.displacementScale},
    fit: ${JSON.stringify(template.fit)},
    listing: ${template.listing},
    fill: { strategy: "blur", sigma: 24 },
    cornerRadius: ${template.cornerRadius},
  }`;
    })
    .join(",\n");
  return `import type { MockupTemplateConfig } from "@/lib/mockups/types";

/**
 * Placement comes from each PSD Smart Object. Rotated and perspective cases use
 * the non-affine corners, so the design turns with the case. A custom envelope
 * grid is applied in the smart object before that quad. Other warps stay disabled.
 * Layers above the Print slot are composited after the design, in the PSD's stack order.
 */
export const mockupTemplates: MockupTemplateConfig[] = [
${body},
];
`;
}

function readOptions(withPixels: boolean) {
  return {
    skipLayerImageData: !withPixels,
    skipCompositeImageData: true,
    skipThumbnail: true,
    skipLinkedFilesData: true,
    useImageData: withPixels,
    logMissingFeatures: false,
    totalMemoryLimit: 8 * 1024 * 1024 * 1024,
  } as const;
}

function readLayers(psdPath: string): { width: number; height: number; layers: Layer[] } {
  const psd = readPsd(readFileSync(psdPath), readOptions(true));
  return { width: psd.width, height: psd.height, layers: psd.children ?? [] };
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

async function writePlate(png: Buffer, filePath: string, width: number, height: number): Promise<void> {
  await sharp(png).resize(width, height, { fit: "fill" }).png().toFile(filePath);
}

async function prepareFromPixels(root: string, template: MockupTemplateConfig): Promise<MockupTemplateConfig> {
  const { width, height, layers } = readLayers(join(root, template.psdPath));
  const stack = await splitPrintStack({
    layers,
    width,
    height,
    smartObjectName: template.printable.smartObjectName ?? "",
  });
  if (!stack) {
    console.warn(`${template.psdPath}: no plain Smart Object placement. Left unchanged.`);
    return template;
  }

  const size = outputSize(width, height);
  const dir = join(root, "prepared", template.id);
  mkdirSync(dir, { recursive: true });
  await writePlate(stack.base, join(dir, "base.png"), size.width, size.height);
  await writePlate(stack.mask, join(dir, "mask.png"), size.width, size.height);
  const overlays = [];
  for (let index = 0; index < stack.overlays.length; index += 1) {
    const overlay = stack.overlays[index];
    if (!overlay) continue;
    const path = `prepared/${template.id}/overlay-${index}.png`;
    await writePlate(overlay.png, join(dir, `overlay-${index}.png`), size.width, size.height);
    overlays.push({ path, blend: overlay.blend });
  }

  const basePath = `prepared/${template.id}/base.png`;
  const flatCard = await isFlatColorBase(join(dir, "base.png"));
  const next: MockupTemplateConfig = {
    ...template,
    enabled: true,
    version: template.overlays ? template.version : nextVersion(template.version),
    listing: template.listing && !flatCard,
    output: { ...template.output, width: size.width, height: size.height },
    printable: {
      width: stack.width,
      height: stack.height,
      quad: quadFromTransform(stack.transform, width, height, size.width, size.height),
      mesh: stack.mesh
        ? {
            columns: stack.mesh.columns,
            rows: stack.mesh.rows,
            points: stack.mesh.points.map((point) => ({
              x: Math.round(point.x * 100) / 100,
              y: Math.round(point.y * 100) / 100,
            })),
          }
        : undefined,
      smartObjectName: stack.name,
    },
    basePath,
    maskPath: `prepared/${template.id}/mask.png`,
    shadePath: null,
    highlightPath: null,
    overlays,
  };
  const rotated = next.printable.quad ? !quadIsAxisAligned(next.printable.quad) : false;
  console.log(
    `${template.id}: ${stack.name} ${stack.width}x${stack.height} -> ${size.width}x${size.height}, overlays ${overlays.length}${rotated ? " (rotated)" : ""}${flatCard ? " (flat card, not a listing photo)" : ""}`,
  );
  return next;
}

async function main(): Promise<void> {
  const root = mockupRoot();
  const configPath = join(root, "templates.config.ts");
  const next: MockupTemplateConfig[] = [];
  for (const template of mockupTemplates) {
    try {
      next.push(await prepareFromPixels(root, template));
    } catch (error) {
      const message = error instanceof Error ? error.message : "prepare failed";
      console.warn(`${template.psdPath}: ${message}. Left unchanged.`);
      next.push(template);
    }
    writeFileSync(configPath, renderConfig([...next, ...mockupTemplates.slice(next.length)]), "utf8");
  }
  const enabled = next.filter((item) => item.enabled).length;
  console.log(`Prepared ${enabled} of ${next.length} templates.`);
  if (enabled === 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Mockup prepare failed.");
  process.exit(1);
});
