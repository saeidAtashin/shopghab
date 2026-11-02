import { readFileSync, writeFileSync } from "node:fs";

import type { PhoneBackGeometry } from "../src/lib/cases/types";
import {
  toCaseGeometry,
  type GlassPhone,
} from "../src/lib/cases/glassback/to-case-geometry";

type Target = {
  slug: string;
  glassbackId: string;
  widthMm: number;
  heightMm: number;
  logo: boolean;
};

const PRINT_SAFE = { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 } as const;
const APPLE_LOGO = { cx: 0.5, cy: 0.52, r: 0.038 } as const;

/** Phones that already exist in this shop and in GlassBack. Body size stays the catalog size. */
const TARGETS: Target[] = [
  { slug: "galaxy-s25-ultra", glassbackId: "galaxy-s25-ultra", widthMm: 77.6, heightMm: 162.8, logo: false },
  { slug: "galaxy-s25-plus", glassbackId: "galaxy-s25-plus", widthMm: 75.8, heightMm: 158.4, logo: false },
  { slug: "galaxy-s25", glassbackId: "galaxy-s25", widthMm: 70.5, heightMm: 146.9, logo: false },
  { slug: "galaxy-s25-fe", glassbackId: "galaxy-s25-fe", widthMm: 76.7, heightMm: 161.9, logo: false },
  { slug: "galaxy-s24-ultra", glassbackId: "galaxy-s24-ultra", widthMm: 79.0, heightMm: 162.3, logo: false },
  { slug: "galaxy-s24-plus", glassbackId: "galaxy-s24-plus", widthMm: 75.9, heightMm: 158.5, logo: false },
  { slug: "galaxy-s24", glassbackId: "galaxy-s24", widthMm: 70.6, heightMm: 147.0, logo: false },
  { slug: "galaxy-s24-fe", glassbackId: "galaxy-s24-fe", widthMm: 78.0, heightMm: 162.0, logo: false },
  { slug: "galaxy-s23-ultra", glassbackId: "galaxy-s23-ultra", widthMm: 78.1, heightMm: 163.4, logo: false },
  { slug: "galaxy-s23-plus", glassbackId: "galaxy-s23-plus", widthMm: 76.2, heightMm: 157.8, logo: false },
  { slug: "galaxy-s23", glassbackId: "galaxy-s23", widthMm: 70.9, heightMm: 146.3, logo: false },
  { slug: "galaxy-s23-fe", glassbackId: "galaxy-s23-fe", widthMm: 76.5, heightMm: 162.0, logo: false },
  { slug: "iphone-17-pro-max", glassbackId: "iphone-17-pro-max", widthMm: 78.0, heightMm: 163.4, logo: true },
  { slug: "iphone-17-pro", glassbackId: "iphone-17-pro", widthMm: 71.9, heightMm: 150.0, logo: true },
  { slug: "iphone-air", glassbackId: "iphone-air", widthMm: 74.7, heightMm: 156.2, logo: true },
  { slug: "iphone-17", glassbackId: "iphone-17", widthMm: 71.5, heightMm: 149.6, logo: true },
  { slug: "iphone-16-pro-max", glassbackId: "iphone-16-pro-max", widthMm: 77.6, heightMm: 163.0, logo: true },
  { slug: "iphone-16-pro", glassbackId: "iphone-16-pro", widthMm: 71.5, heightMm: 149.6, logo: true },
  { slug: "iphone-16-plus", glassbackId: "iphone-16-plus", widthMm: 77.8, heightMm: 160.9, logo: true },
  { slug: "iphone-16", glassbackId: "iphone-16", widthMm: 71.6, heightMm: 147.6, logo: true },
  { slug: "iphone-15-pro-max", glassbackId: "iphone-15-pro-max", widthMm: 76.7, heightMm: 159.9, logo: true },
  { slug: "iphone-15-pro", glassbackId: "iphone-15-pro", widthMm: 70.6, heightMm: 146.6, logo: true },
  { slug: "iphone-15-plus", glassbackId: "iphone-15-plus", widthMm: 77.8, heightMm: 160.9, logo: true },
  { slug: "iphone-15", glassbackId: "iphone-15", widthMm: 71.6, heightMm: 147.6, logo: true },
  { slug: "iphone-14-pro-max", glassbackId: "iphone-14-pro-max", widthMm: 77.6, heightMm: 160.7, logo: true },
  { slug: "iphone-14-pro", glassbackId: "iphone-14-pro", widthMm: 71.5, heightMm: 147.5, logo: true },
  { slug: "iphone-14-plus", glassbackId: "iphone-14-plus", widthMm: 78.1, heightMm: 160.8, logo: true },
  { slug: "iphone-14", glassbackId: "iphone-14", widthMm: 71.5, heightMm: 146.7, logo: true },
  { slug: "iphone-13-pro-max", glassbackId: "iphone-13-pro-max", widthMm: 78.1, heightMm: 160.8, logo: true },
  { slug: "iphone-13-pro", glassbackId: "iphone-13-pro", widthMm: 71.5, heightMm: 146.7, logo: true },
  { slug: "iphone-13-mini", glassbackId: "iphone-13-mini", widthMm: 64.2, heightMm: 131.5, logo: true },
  { slug: "iphone-13", glassbackId: "iphone-13", widthMm: 71.5, heightMm: 146.7, logo: true },
  { slug: "iphone-12-pro-max", glassbackId: "iphone-12-pro-max", widthMm: 78.1, heightMm: 160.8, logo: true },
  { slug: "iphone-12-pro", glassbackId: "iphone-12-pro", widthMm: 71.5, heightMm: 146.7, logo: true },
  { slug: "iphone-12-mini", glassbackId: "iphone-12-mini", widthMm: 64.2, heightMm: 131.5, logo: true },
  { slug: "iphone-12", glassbackId: "iphone-12", widthMm: 71.5, heightMm: 146.7, logo: true },
  { slug: "iphone-se-3", glassbackId: "iphone-se", widthMm: 67.3, heightMm: 138.4, logo: true },
];

function loadPhones(source: string): GlassPhone[] {
  const raw = readFileSync(source, "utf8");
  const json = raw.slice(raw.indexOf("{")).replace(/;\s*$/, "");
  const data = JSON.parse(json) as { phones: GlassPhone[] };
  return data.phones.map((phone) => ({
    id: phone.id,
    panels: phone.panels.map((panel) => ({ w: panel.w, h: panel.h, r: panel.r })),
    lenses: phone.lenses.map((lens) => ({ kind: lens.kind, d: lens.d, x: lens.x, y: lens.y })),
    rects: phone.rects.map((rect) => ({
      kind: rect.kind,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      r: rect.r,
      label: rect.label,
    })),
  }));
}

function formatRect(rect: PhoneBackGeometry["camera"]["module"]): string {
  const radius =
    rect.cornerRadius !== undefined ? `, cornerRadius: ${rect.cornerRadius}` : "";
  return `{ x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}${radius} }`;
}

function formatCircle(circle: { cx: number; cy: number; r: number }): string {
  return `{ cx: ${circle.cx}, cy: ${circle.cy}, r: ${circle.r} }`;
}

function formatGeometry(geometry: PhoneBackGeometry): string {
  const lenses = geometry.camera.lenses.map((lens) => formatCircle(lens)).join(", ");
  const flash = geometry.camera.flash ? `\n        flash: ${formatRect(geometry.camera.flash)},` : "";
  const lidar = geometry.camera.lidar ? `\n        lidar: ${formatCircle(geometry.camera.lidar)},` : "";
  const logo = geometry.logo ? `\n      logo: ${formatCircle(geometry.logo)},` : "";
  const inset = geometry.printSafeInsetMm;
  return `{
      chassisTemplate: ${JSON.stringify(geometry.chassisTemplate)},
      cornerRadiusMm: ${geometry.cornerRadiusMm},
      camera: {
        module: ${formatRect(geometry.camera.module)},
        lenses: [${lenses}],${flash}${lidar}
      },${logo}
      printSafeInsetMm: { top: ${inset.top}, right: ${inset.right}, bottom: ${inset.bottom}, left: ${inset.left} },
    }`;
}

const source = process.argv[2];
if (!source) {
  console.error("Usage: npx tsx scripts/glassback-to-case-geometry.ts <glassback-data.js>");
  process.exit(1);
}

const phones = new Map(loadPhones(source).map((phone) => [phone.id, phone]));
const blocks: string[] = [];

for (const target of TARGETS) {
  const phone = phones.get(target.glassbackId);
  if (!phone) throw new Error(`Missing GlassBack phone ${target.glassbackId}`);
  if (phone.id.includes("fold") || phone.id.includes("flip")) {
    throw new Error(`Refusing fold phone ${phone.id}`);
  }
  const geometry = toCaseGeometry({
    slug: target.slug,
    widthMm: target.widthMm,
    heightMm: target.heightMm,
    phone,
    printSafeInsetRatio: PRINT_SAFE,
    logoRatio: target.logo ? APPLE_LOGO : undefined,
  });
  const mod = geometry.camera.module;
  console.log(
    `${target.slug}: window ${mod.width}x${mod.height} r${mod.cornerRadius} lenses ${geometry.camera.lenses.length}`,
  );
  blocks.push(`  ${JSON.stringify(target.slug)}: ${formatGeometry(geometry)},`);
}

const output = `import type { PhoneBackGeometry } from "../types";

/**
 * Case-cover backs converted from GlassBack panel measurements.
 * One rounded rectangle holds every lens, flash, and sensor.
 * Regenerate with scripts/glassback-to-case-geometry.ts. Do not edit by hand.
 */
export const GLASSBACK_CASE_BACKS: Record<string, PhoneBackGeometry> = {
${blocks.join("\n")}
};
`;

const destination = "src/lib/cases/glassback/case-backs.generated.ts";
writeFileSync(destination, output, "utf8");
console.log(`Wrote ${TARGETS.length} phones to ${destination}`);
