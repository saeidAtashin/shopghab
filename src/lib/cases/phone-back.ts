import type {
  MmCircle,
  MmRect,
  PhoneBackGeometry,
  PhoneModel,
} from "./types";

export type PxRect = MmRect;
export type PxCircle = MmCircle;

export type CanvasGeometry = {
  canvasWidth: number;
  canvasHeight: number;
  cornerRadius: number;
  body: PxRect;
  cameraModule: PxRect;
  lenses: PxCircle[];
  flash?: PxRect;
  lidar?: PxCircle;
  logo?: PxCircle;
  printSafe: PxRect;
  cameraExclusion: PxRect;
};

const DEFAULT_BASE_CANVAS_WIDTH = 280;

const GENERIC_BACK: PhoneBackGeometry = {
  cornerRadiusMm: 11,
  camera: {
    module: { x: 4, y: 4, width: 28, height: 28, cornerRadius: 6 },
    lenses: [
      { cx: 12, cy: 12, r: 5 },
      { cx: 24, cy: 12, r: 5 },
      { cx: 18, cy: 24, r: 5 },
    ],
  },
  logo: { cx: 0, cy: 0, r: 4 },
  printSafeInsetMm: { top: 8, right: 4, bottom: 8, left: 4 },
  chassisTemplate: "generic-fallback",
};

export function computeCanvasSize(
  widthMm: number,
  heightMm: number,
  baseWidth = DEFAULT_BASE_CANVAS_WIDTH,
): { canvasWidth: number; canvasHeight: number } {
  return {
    canvasWidth: baseWidth,
    canvasHeight: Math.round(baseWidth * (heightMm / widthMm)),
  };
}

export function mmToPx(mm: number, model: Pick<PhoneModel, "widthMm" | "canvasWidth">): number {
  return mm * (model.canvasWidth / model.widthMm);
}

export function pxToMm(px: number, model: Pick<PhoneModel, "widthMm" | "canvasWidth">): number {
  return px * (model.widthMm / model.canvasWidth);
}

export function getModelBackSpec(model: PhoneModel): PhoneBackGeometry {
  if (model.back) return model.back;
  const logoY = model.heightMm * 0.52;
  return {
    ...GENERIC_BACK,
    logo: { cx: model.widthMm / 2, cy: logoY, r: model.widthMm * 0.045 },
    camera: {
      ...GENERIC_BACK.camera,
      module: {
        x: model.widthMm * 0.06,
        y: model.heightMm * 0.025,
        width: model.widthMm * 0.38,
        height: model.widthMm * 0.38,
        cornerRadius: model.widthMm * 0.08,
      },
      lenses: [
        { cx: model.widthMm * 0.16, cy: model.heightMm * 0.065, r: model.widthMm * 0.065 },
        { cx: model.widthMm * 0.32, cy: model.heightMm * 0.065, r: model.widthMm * 0.065 },
        { cx: model.widthMm * 0.24, cy: model.heightMm * 0.115, r: model.widthMm * 0.065 },
      ],
    },
  };
}

function mapRect(rect: MmRect, model: PhoneModel): PxRect {
  return {
    x: mmToPx(rect.x, model),
    y: mmToPx(rect.y, model),
    width: mmToPx(rect.width, model),
    height: mmToPx(rect.height, model),
    cornerRadius: rect.cornerRadius !== undefined ? mmToPx(rect.cornerRadius, model) : undefined,
  };
}

function mapCircle(circle: MmCircle, model: PhoneModel): PxCircle {
  return {
    cx: mmToPx(circle.cx, model),
    cy: mmToPx(circle.cy, model),
    r: mmToPx(circle.r, model),
  };
}

export function mapGeometryToCanvas(model: PhoneModel): CanvasGeometry {
  const back = getModelBackSpec(model);
  const { canvasWidth, canvasHeight } = model;
  const inset = back.printSafeInsetMm;

  const printSafe: PxRect = {
    x: mmToPx(inset.left, model),
    y: mmToPx(inset.top, model),
    width: canvasWidth - mmToPx(inset.left + inset.right, model),
    height: canvasHeight - mmToPx(inset.top + inset.bottom, model),
  };

  const cameraModule = mapRect(back.camera.module, model);

  return {
    canvasWidth,
    canvasHeight,
    cornerRadius: mmToPx(back.cornerRadiusMm, model),
    body: { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
    cameraModule,
    lenses: back.camera.lenses.map((l) => mapCircle(l, model)),
    flash: back.camera.flash ? mapRect(back.camera.flash, model) : undefined,
    lidar: back.camera.lidar ? mapCircle(back.camera.lidar, model) : undefined,
    logo: back.logo ? mapCircle(back.logo, model) : undefined,
    printSafe,
    cameraExclusion: { ...cameraModule },
  };
}

export function validateModelGeometry(model: PhoneModel): string[] {
  const errors: string[] = [];
  const back = getModelBackSpec(model);
  const ratio = model.canvasHeight / model.canvasWidth;
  const expectedRatio = model.heightMm / model.widthMm;
  if (Math.abs(ratio - expectedRatio) / expectedRatio > 0.001) {
    errors.push(`${model.slug}: canvas aspect ratio mismatch`);
  }

  const mod = back.camera.module;
  if (mod.x + mod.width > model.widthMm || mod.y + mod.height > model.heightMm) {
    errors.push(`${model.slug}: camera module exceeds body bounds`);
  }

  for (const lens of back.camera.lenses) {
    if (
      lens.cx - lens.r < mod.x ||
      lens.cx + lens.r > mod.x + mod.width ||
      lens.cy - lens.r < mod.y ||
      lens.cy + lens.r > mod.y + mod.height
    ) {
      errors.push(`${model.slug}: lens outside camera module`);
    }
  }

  return errors;
}

export type ClipPathContext = {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  closePath(): void;
  clip(fillRule?: CanvasFillRule): void;
};

export function drawRoundRectPath(
  ctx: ClipPathContext,
  rect: PxRect,
) {
  const { x, y, width, height } = rect;
  const r = Math.min(rect.cornerRadius ?? 0, width / 2, height / 2);

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function createCaseDesignClipFunc(geo: CanvasGeometry) {
  return (ctx: ClipPathContext) => {
    ctx.beginPath();
    drawRoundRectPath(ctx, {
      x: 0,
      y: 0,
      width: geo.canvasWidth,
      height: geo.canvasHeight,
      cornerRadius: geo.cornerRadius,
    });
    drawRoundRectPath(ctx, geo.cameraModule);
    ctx.clip("evenodd");
  };
}

export function createFallbackCaseDesignClipFunc(
  width: number,
  height: number,
  cornerRadius = 16,
) {
  return (ctx: ClipPathContext) => {
    ctx.beginPath();
    drawRoundRectPath(ctx, { x: 0, y: 0, width, height, cornerRadius });
    ctx.clip();
  };
}

export function buildPhoneModel(input: {
  slug: string;
  brandSlug: string;
  seriesSlug: string;
  name: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  back: PhoneBackGeometry;
  baseCanvasWidth?: number;
}): PhoneModel {
  const { canvasWidth, canvasHeight } = computeCanvasSize(
    input.widthMm,
    input.heightMm,
    input.baseCanvasWidth,
  );
  return {
    slug: input.slug,
    brandSlug: input.brandSlug,
    seriesSlug: input.seriesSlug,
    name: input.name,
    nameEn: input.nameEn,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    canvasWidth,
    canvasHeight,
    image: `/cases/models/${input.slug}.svg`,
    back: input.back,
  };
}

export function generatePhoneBackSvgString(model: PhoneModel, bodyFill = "#1a1a22"): string {
  const geo = mapGeometryToCanvas(model);
  const lensCircles = geo.lenses
    .map(
      (lens) =>
        `    <circle class="lens" cx="${round(lens.cx)}" cy="${round(lens.cy)}" r="${round(lens.r)}" fill="#0d0d12" stroke="#333340" stroke-width="1"/>`,
    )
    .join("\n");

  const lidarCircle = geo.lidar
    ? `    <circle cx="${round(geo.lidar.cx)}" cy="${round(geo.lidar.cy)}" r="${round(geo.lidar.r)}" fill="#12121a" stroke="#333340" stroke-width="1"/>`
    : "";

  const flashRect = geo.flash
    ? `    <rect x="${round(geo.flash.x)}" y="${round(geo.flash.y)}" width="${round(geo.flash.width)}" height="${round(geo.flash.height)}" rx="2" fill="#f5f5dc" opacity="0.85"/>`
    : "";

  const logoCircle = geo.logo
    ? `    <circle cx="${round(geo.logo.cx)}" cy="${round(geo.logo.cy)}" r="${round(geo.logo.r)}" fill="rgba(255,255,255,0.06)"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${geo.canvasWidth} ${geo.canvasHeight}" xmlns="http://www.w3.org/2000/svg">
  <g id="body">
    <rect x="0" y="0" width="${geo.canvasWidth}" height="${geo.canvasHeight}" rx="${round(geo.cornerRadius)}" ry="${round(geo.cornerRadius)}" fill="${bodyFill}"/>
  </g>
  ${logoCircle}
  <g id="camera-module">
    <rect x="${round(geo.cameraModule.x)}" y="${round(geo.cameraModule.y)}" width="${round(geo.cameraModule.width)}" height="${round(geo.cameraModule.height)}" rx="${round(geo.cameraModule.cornerRadius ?? 0)}" ry="${round(geo.cameraModule.cornerRadius ?? 0)}" fill="#252530" stroke="#3a3a48" stroke-width="1"/>
    <g id="lenses">
${lensCircles}
    </g>
${lidarCircle}
${flashRect}
  </g>
</svg>
`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
