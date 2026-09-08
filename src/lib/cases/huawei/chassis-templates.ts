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
  "huawei-pura-circle": {
    slug: "huawei-pura-circle",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.05, y: 0.026, width: 0.42, height: 0.42, cornerRadius: 0.5 },
      lenses: [
        { cx: 0.17, cy: 0.058, r: 0.038 },
        { cx: 0.28, cy: 0.058, r: 0.028 },
        { cx: 0.17, cy: 0.1, r: 0.028 },
      ],
      flash: { x: 0.32, y: 0.05, width: 0.032, height: 0.032 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "huawei-mate-circle": {
    slug: "huawei-mate-circle",
    cornerRadiusRatio: 0.13,
    camera: {
      module: { x: 0.05, y: 0.026, width: 0.44, height: 0.44, cornerRadius: 0.5 },
      lenses: [
        { cx: 0.16, cy: 0.055, r: 0.036 },
        { cx: 0.28, cy: 0.055, r: 0.03 },
        { cx: 0.16, cy: 0.098, r: 0.03 },
      ],
      flash: { x: 0.32, y: 0.052, width: 0.032, height: 0.032 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "huawei-p60-island": {
    slug: "huawei-p60-island",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.36, height: 0.38, cornerRadius: 0.055 },
      lenses: [
        { cx: 0.185, cy: 0.09, r: 0.055 },
        { cx: 0.185, cy: 0.155, r: 0.028 },
        { cx: 0.28, cy: 0.155, r: 0.028 },
      ],
      flash: { x: 0.28, y: 0.08, width: 0.032, height: 0.032 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "huawei-p50-dual-circle": {
    slug: "huawei-p50-dual-circle",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.3, height: 0.42, cornerRadius: 0.05 },
      lenses: [
        { cx: 0.145, cy: 0.07, r: 0.042 },
        { cx: 0.145, cy: 0.13, r: 0.042 },
      ],
      flash: { x: 0.245, y: 0.07, width: 0.034, height: 0.034 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "huawei-nova-triple": {
    slug: "huawei-nova-triple",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.28, height: 0.4, cornerRadius: 0.05 },
      lenses: [
        { cx: 0.14, cy: 0.055, r: 0.032 },
        { cx: 0.14, cy: 0.095, r: 0.032 },
        { cx: 0.14, cy: 0.135, r: 0.032 },
      ],
      flash: { x: 0.24, y: 0.055, width: 0.034, height: 0.034 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "huawei-nova-dual": {
    slug: "huawei-nova-dual",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.26, height: 0.24, cornerRadius: 0.045 },
      lenses: [
        { cx: 0.135, cy: 0.065, r: 0.03 },
        { cx: 0.135, cy: 0.105, r: 0.03 },
      ],
      flash: { x: 0.22, y: 0.065, width: 0.032, height: 0.032 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
  "huawei-enjoy-dual": {
    slug: "huawei-enjoy-dual",
    cornerRadiusRatio: 0.14,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.24, height: 0.2, cornerRadius: 0.04 },
      lenses: [
        { cx: 0.13, cy: 0.06, r: 0.028 },
        { cx: 0.13, cy: 0.095, r: 0.028 },
      ],
      flash: { x: 0.21, y: 0.06, width: 0.028, height: 0.028 },
    },
    printSafeInsetRatio: EDGE_INSET,
  },
};

export function getChassisTemplate(slug: string): ChassisTemplate {
  const template = CHASSIS_TEMPLATES[slug];
  if (!template) throw new Error(`Unknown chassis template: ${slug}`);
  return template;
}
