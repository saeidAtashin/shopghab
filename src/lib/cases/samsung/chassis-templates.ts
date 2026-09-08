import type { PhoneBackGeometry } from "../types";

export type RelativeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius?: number;
};

export type RelativeCircle = {
  cx: number;
  cy: number;
  r: number;
};

export type ChassisTemplate = {
  slug: string;
  cornerRadiusRatio: number;
  camera: {
    module: RelativeRect;
    lenses: RelativeCircle[];
    flash?: RelativeRect;
    lidar?: RelativeCircle;
  };
  logo?: RelativeCircle;
  printSafeInsetRatio: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

const EDGE_INSET = { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 } as const;

function resolveRect(
  rect: RelativeRect,
  widthMm: number,
  heightMm: number,
  heightBasis: "width" | "height" = "height",
) {
  return {
    x: rect.x * widthMm,
    y: rect.y * heightMm,
    width: rect.width * widthMm,
    height: rect.height * (heightBasis === "width" ? widthMm : heightMm),
    cornerRadius:
      rect.cornerRadius !== undefined
        ? rect.cornerRadius * Math.min(widthMm, heightMm)
        : undefined,
  };
}

function resolveCircle(circle: RelativeCircle, widthMm: number, heightMm: number) {
  return {
    cx: circle.cx * widthMm,
    cy: circle.cy * heightMm,
    r: circle.r * Math.min(widthMm, heightMm),
  };
}

export function resolveChassisTemplate(
  template: ChassisTemplate,
  widthMm: number,
  heightMm: number,
): PhoneBackGeometry {
  const inset = template.printSafeInsetRatio;
  return {
    chassisTemplate: template.slug,
    cornerRadiusMm: template.cornerRadiusRatio * widthMm,
    camera: {
      module: resolveRect(template.camera.module, widthMm, heightMm, "width"),
      lenses: template.camera.lenses.map((l) => resolveCircle(l, widthMm, heightMm)),
      flash: template.camera.flash
        ? resolveRect(template.camera.flash, widthMm, heightMm, "width")
        : undefined,
      lidar: template.camera.lidar
        ? resolveCircle(template.camera.lidar, widthMm, heightMm)
        : undefined,
    },
    logo: template.logo ? resolveCircle(template.logo, widthMm, heightMm) : undefined,
    printSafeInsetMm: {
      top: inset.top * heightMm,
      right: inset.right * widthMm,
      bottom: inset.bottom * heightMm,
      left: inset.left * widthMm,
    },
  };
}

export const CHASSIS_TEMPLATES: Record<string, ChassisTemplate> = {
  "galaxy-s-ultra-isolated": {
    slug: "galaxy-s-ultra-isolated",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.05, y: 0.028, width: 0.32, height: 0.48, cornerRadius: 0.04 },
      lenses: [
        { cx: 0.14, cy: 0.055, r: 0.034 },
        { cx: 0.14, cy: 0.095, r: 0.034 },
        { cx: 0.14, cy: 0.135, r: 0.034 },
        { cx: 0.14, cy: 0.168, r: 0.028 },
      ],
      flash: { x: 0.24, y: 0.055, width: 0.038, height: 0.038 },
      lidar: { cx: 0.24, cy: 0.095, r: 0.02 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-s-plus-vertical": {
    slug: "galaxy-s-plus-vertical",
    cornerRadiusRatio: 0.145,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.28, height: 0.4, cornerRadius: 0.055 },
      lenses: [
        { cx: 0.14, cy: 0.055, r: 0.034 },
        { cx: 0.14, cy: 0.095, r: 0.034 },
        { cx: 0.14, cy: 0.135, r: 0.034 },
      ],
      flash: { x: 0.24, y: 0.055, width: 0.038, height: 0.038 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-s-base-vertical": {
    slug: "galaxy-s-base-vertical",
    cornerRadiusRatio: 0.145,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.26, height: 0.36, cornerRadius: 0.05 },
      lenses: [
        { cx: 0.135, cy: 0.052, r: 0.032 },
        { cx: 0.135, cy: 0.088, r: 0.032 },
        { cx: 0.135, cy: 0.124, r: 0.032 },
      ],
      flash: { x: 0.22, y: 0.052, width: 0.036, height: 0.036 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-s25-base-dual": {
    slug: "galaxy-s25-base-dual",
    cornerRadiusRatio: 0.145,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.34, height: 0.26, cornerRadius: 0.06 },
      lenses: [
        { cx: 0.135, cy: 0.068, r: 0.038 },
        { cx: 0.275, cy: 0.108, r: 0.038 },
      ],
      flash: { x: 0.32, y: 0.058, width: 0.038, height: 0.038 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-a-triple-vertical": {
    slug: "galaxy-a-triple-vertical",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.26, height: 0.34, cornerRadius: 0.05 },
      lenses: [
        { cx: 0.135, cy: 0.052, r: 0.032 },
        { cx: 0.135, cy: 0.088, r: 0.032 },
        { cx: 0.135, cy: 0.124, r: 0.032 },
      ],
      flash: { x: 0.22, y: 0.052, width: 0.034, height: 0.034 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-a-dual": {
    slug: "galaxy-a-dual",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.28, height: 0.22, cornerRadius: 0.045 },
      lenses: [
        { cx: 0.135, cy: 0.062, r: 0.03 },
        { cx: 0.135, cy: 0.105, r: 0.03 },
      ],
      flash: { x: 0.23, y: 0.062, width: 0.032, height: 0.032 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-z-fold-cover": {
    slug: "galaxy-z-fold-cover",
    cornerRadiusRatio: 0.12,
    camera: {
      module: { x: 0.05, y: 0.028, width: 0.44, height: 0.14, cornerRadius: 0.045 },
      lenses: [
        { cx: 0.12, cy: 0.058, r: 0.026 },
        { cx: 0.24, cy: 0.058, r: 0.026 },
        { cx: 0.36, cy: 0.058, r: 0.026 },
      ],
      flash: { x: 0.4, y: 0.048, width: 0.026, height: 0.026 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "galaxy-z-flip-dual": {
    slug: "galaxy-z-flip-dual",
    cornerRadiusRatio: 0.145,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.26, height: 0.22, cornerRadius: 0.05 },
      lenses: [
        { cx: 0.135, cy: 0.062, r: 0.032 },
        { cx: 0.135, cy: 0.105, r: 0.032 },
      ],
      flash: { x: 0.22, y: 0.062, width: 0.034, height: 0.034 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
};

export function getChassisTemplate(slug: string): ChassisTemplate {
  const template = CHASSIS_TEMPLATES[slug];
  if (!template) throw new Error(`Unknown chassis template: ${slug}`);
  return template;
}
