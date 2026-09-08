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
  "iphone-se-single": {
    slug: "iphone-se-single",
    cornerRadiusRatio: 0.12,
    camera: {
      module: { x: 0.32, y: 0.04, width: 0.36, height: 0.1, cornerRadius: 0.035 },
      lenses: [{ cx: 0.5, cy: 0.072, r: 0.032 }],
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-x-dual-vertical": {
    slug: "iphone-x-dual-vertical",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.3, height: 0.2, cornerRadius: 0.05 },
      lenses: [
        { cx: 0.125, cy: 0.062, r: 0.038 },
        { cx: 0.125, cy: 0.102, r: 0.038 },
      ],
      flash: { x: 0.225, y: 0.062, width: 0.05, height: 0.05 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-xr-single": {
    slug: "iphone-xr-single",
    cornerRadiusRatio: 0.145,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.24, height: 0.24, cornerRadius: 0.05 },
      lenses: [{ cx: 0.16, cy: 0.078, r: 0.055 }],
      flash: { x: 0.2, y: 0.052, width: 0.04, height: 0.04 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-11-dual": {
    slug: "iphone-11-dual",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.34, height: 0.26, cornerRadius: 0.055 },
      lenses: [
        { cx: 0.135, cy: 0.068, r: 0.042 },
        { cx: 0.135, cy: 0.118, r: 0.042 },
      ],
      flash: { x: 0.26, y: 0.068, width: 0.05, height: 0.05 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-11-pro-triple": {
    slug: "iphone-11-pro-triple",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.36, height: 0.36, cornerRadius: 0.065 },
      lenses: [
        { cx: 0.135, cy: 0.085, r: 0.048 },
        { cx: 0.265, cy: 0.085, r: 0.048 },
        { cx: 0.2, cy: 0.175, r: 0.048 },
      ],
      flash: { x: 0.31, y: 0.155, width: 0.045, height: 0.045 },
      lidar: { cx: 0.135, cy: 0.175, r: 0.028 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-12-dual-diagonal": {
    slug: "iphone-12-dual-diagonal",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.36, height: 0.26, cornerRadius: 0.06 },
      lenses: [
        { cx: 0.135, cy: 0.068, r: 0.042 },
        { cx: 0.275, cy: 0.108, r: 0.042 },
      ],
      flash: { x: 0.32, y: 0.058, width: 0.04, height: 0.04 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-12-pro-triple": {
    slug: "iphone-12-pro-triple",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.38, height: 0.38, cornerRadius: 0.07 },
      lenses: [
        { cx: 0.135, cy: 0.085, r: 0.048 },
        { cx: 0.285, cy: 0.085, r: 0.048 },
        { cx: 0.21, cy: 0.185, r: 0.048 },
      ],
      flash: { x: 0.34, y: 0.155, width: 0.045, height: 0.045 },
      lidar: { cx: 0.135, cy: 0.185, r: 0.028 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-15-pro-triple": {
    slug: "iphone-15-pro-triple",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.4, height: 0.4, cornerRadius: 0.075 },
      lenses: [
        { cx: 0.135, cy: 0.085, r: 0.05 },
        { cx: 0.295, cy: 0.085, r: 0.05 },
        { cx: 0.215, cy: 0.195, r: 0.05 },
      ],
      flash: { x: 0.355, y: 0.165, width: 0.045, height: 0.045 },
      lidar: { cx: 0.135, cy: 0.195, r: 0.028 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-16-pro-triple": {
    slug: "iphone-16-pro-triple",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.42, height: 0.44, cornerRadius: 0.075 },
      lenses: [
        { cx: 0.135, cy: 0.078, r: 0.046 },
        { cx: 0.305, cy: 0.078, r: 0.046 },
        { cx: 0.22, cy: 0.168, r: 0.046 },
      ],
      flash: { x: 0.37, y: 0.145, width: 0.04, height: 0.04 },
      lidar: { cx: 0.135, cy: 0.168, r: 0.026 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-16-dual": {
    slug: "iphone-16-dual",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.055, y: 0.028, width: 0.36, height: 0.26, cornerRadius: 0.06 },
      lenses: [
        { cx: 0.135, cy: 0.068, r: 0.042 },
        { cx: 0.275, cy: 0.108, r: 0.042 },
      ],
      flash: { x: 0.32, y: 0.058, width: 0.04, height: 0.04 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-air-single": {
    slug: "iphone-air-single",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.36, y: 0.04, width: 0.28, height: 0.11, cornerRadius: 0.04 },
      lenses: [{ cx: 0.5, cy: 0.072, r: 0.032 }],
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
  "iphone-17-pro-triple": {
    slug: "iphone-17-pro-triple",
    cornerRadiusRatio: 0.155,
    camera: {
      module: { x: 0.04, y: 0.025, width: 0.48, height: 0.36, cornerRadius: 0.08 },
      lenses: [
        { cx: 0.13, cy: 0.075, r: 0.044 },
        { cx: 0.32, cy: 0.075, r: 0.044 },
        { cx: 0.225, cy: 0.155, r: 0.044 },
      ],
      flash: { x: 0.42, y: 0.13, width: 0.038, height: 0.038 },
      lidar: { cx: 0.13, cy: 0.155, r: 0.024 },
    },
    logo: { cx: 0.5, cy: 0.52, r: 0.038 },
    printSafeInsetRatio: { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 },
  },
};

export function getChassisTemplate(slug: string): ChassisTemplate {
  const template = CHASSIS_TEMPLATES[slug];
  if (!template) throw new Error(`Unknown chassis template: ${slug}`);
  return template;
}
