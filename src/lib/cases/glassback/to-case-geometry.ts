import type { MmCircle, MmRect, PhoneBackGeometry } from "../types";

/** Extra millimetres around every camera circle so the case lip clears the bump. */
export const CASE_CLEARANCE_MM = 1.2;

/** Corner radius used when the phone has no measured camera island. */
export const SYNTHETIC_CORNER_MM = 3;

export type GlassCircle = {
  kind: string;
  d: number;
  x: number;
  y: number;
};

export type GlassRect = {
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  label?: string;
};

export type GlassPanel = {
  w: number;
  h: number;
  r: number;
};

export type GlassPhone = {
  id: string;
  panels: GlassPanel[];
  lenses: GlassCircle[];
  rects: GlassRect[];
};

export type CaseGeometryInput = {
  slug: string;
  widthMm: number;
  heightMm: number;
  phone: GlassPhone;
  printSafeInsetRatio: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  logoRatio?: { cx: number; cy: number; r: number };
};

type Box = { x: number; y: number; width: number; height: number };

const OPTICAL_KINDS = new Set([
  "wide",
  "ultrawide",
  "telephoto",
  "periscope",
  "macro",
  "depth",
  "monochrome",
]);

const SENSOR_KINDS = new Set(["sensor", "lidar", "tof", "laser"]);

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundOutRect(rect: Box): Box {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  const x = Math.floor(rect.x * 100) / 100;
  const y = Math.floor(rect.y * 100) / 100;
  return {
    x: round2(x),
    y: round2(y),
    width: round2(Math.ceil((right - x) * 100) / 100),
    height: round2(Math.ceil((bottom - y) * 100) / 100),
  };
}

function containsCircle(box: Box, circle: MmCircle, pad: number): boolean {
  return (
    circle.cx - circle.r - pad >= box.x - 1e-6 &&
    circle.cy - circle.r - pad >= box.y - 1e-6 &&
    circle.cx + circle.r + pad <= box.x + box.width + 1e-6 &&
    circle.cy + circle.r + pad <= box.y + box.height + 1e-6
  );
}

function circleBox(circle: MmCircle, pad: number): Box {
  return {
    x: circle.cx - circle.r - pad,
    y: circle.cy - circle.r - pad,
    width: (circle.r + pad) * 2,
    height: (circle.r + pad) * 2,
  };
}

function unionBox(a: Box, b: Box): Box {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

function isCameraCover(rect: GlassRect): boolean {
  const label = (rect.label ?? "").toLowerCase();
  if (
    /keep-?out|not a physical|lidar|magsafe|wireless|ceramic shield|glass window|glass inlay/.test(
      label,
    )
  ) {
    return false;
  }
  if (rect.kind === "island" || rect.kind === "plateau") return true;
  return /camera plateau|camera bump|camera island/.test(label);
}

/**
 * Mics and duplicate ring measurements are not extra cameras.
 * A case window still uses the real lenses, flash, and sensors.
 */
function isRequiredCircle(lens: GlassCircle): boolean {
  if (lens.kind === "other" && lens.d < 6) return false;
  return true;
}

function isConcentricDuplicate(lens: GlassCircle, kept: GlassCircle[]): boolean {
  return kept.some((other) => {
    const sameCenter = Math.hypot(lens.x - other.x, lens.y - other.y) <= 0.4;
    const similarSize = lens.d <= other.d * 1.2;
    return sameCenter && similarSize;
  });
}

function capSyntheticRadius(box: Box): number {
  const shortSide = Math.min(box.width, box.height);
  return Math.min(SYNTHETIC_CORNER_MM, shortSide * 0.45);
}

function translateBox(box: Box, dx: number, dy: number): Box {
  return { x: box.x + dx, y: box.y + dy, width: box.width, height: box.height };
}

function fitBoxInBody(box: Box, widthMm: number, heightMm: number): { box: Box; dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  if (box.x < 0) dx = -box.x;
  if (box.y < 0) dy = -box.y;
  if (box.x + box.width + dx > widthMm) dx = widthMm - (box.x + box.width);
  if (box.y + box.height + dy > heightMm) dy = heightMm - (box.y + box.height);
  return { box: translateBox(box, dx, dy), dx, dy };
}

function circleOverlapsRect(circle: MmCircle, rect: Box): boolean {
  const nearestX = Math.min(Math.max(circle.cx, rect.x), rect.x + rect.width);
  const nearestY = Math.min(Math.max(circle.cy, rect.y), rect.y + rect.height);
  const dx = circle.cx - nearestX;
  const dy = circle.cy - nearestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

export function toCaseGeometry(input: CaseGeometryInput): PhoneBackGeometry {
  const panel = input.phone.panels[0];
  if (!panel) throw new Error(`${input.phone.id}: missing back panel`);

  const insetX = (input.widthMm - panel.w) / 2;
  const insetY = (input.heightMm - panel.h) / 2;
  const frameInset = Math.max(0, (insetX + insetY) / 2);

  const circles: MmCircle[] = input.phone.lenses.map((lens) => ({
    cx: lens.x + insetX,
    cy: lens.y + insetY,
    r: lens.d / 2,
  }));
  const required = input.phone.lenses
    .map((lens, index) => ({ lens, circle: circles[index]! }))
    .filter((item) => isRequiredCircle(item.lens));
  if (required.length === 0) {
    throw new Error(`${input.phone.id}: no camera circles`);
  }

  const shiftedRects = input.phone.rects.map((rect) => ({
    ...rect,
    x: rect.x + insetX,
    y: rect.y + insetY,
  }));
  const covers = shiftedRects.filter(isCameraCover);
  const containing = covers.filter((rect) =>
    required.every((item) =>
      containsCircle({ x: rect.x, y: rect.y, width: rect.w, height: rect.h }, item.circle, 0),
    ),
  );
  const pool = containing.length > 0 ? containing : covers;
  const cover = pool.reduce<GlassRect | null>((best, rect) => {
    if (!best) return rect;
    return rect.w * rect.h > best.w * best.h ? rect : best;
  }, null);

  const requiredCircles = required.map((item) => item.circle);
  let module: Box;
  let cornerRadius: number;
  let circleBounds = circleBox(requiredCircles[0]!, CASE_CLEARANCE_MM);
  for (const circle of requiredCircles.slice(1)) {
    circleBounds = unionBox(circleBounds, circleBox(circle, CASE_CLEARANCE_MM));
  }

  if (
    cover &&
    requiredCircles.every((circle) =>
      containsCircle({ x: cover.x, y: cover.y, width: cover.w, height: cover.h }, circle, CASE_CLEARANCE_MM),
    )
  ) {
    module = { x: cover.x, y: cover.y, width: cover.w, height: cover.h };
    cornerRadius = Math.min(cover.r, module.width / 2, module.height / 2);
  } else if (cover) {
    module = unionBox(circleBounds, { x: cover.x, y: cover.y, width: cover.w, height: cover.h });
    cornerRadius = Math.min(cover.r, module.width / 2, module.height / 2);
  } else {
    module = circleBounds;
    cornerRadius = capSyntheticRadius(module);
  }

  const fitted = fitBoxInBody(module, input.widthMm, input.heightMm);
  module = fitted.box;

  const move = (circle: MmCircle): MmCircle => ({
    cx: circle.cx + fitted.dx,
    cy: circle.cy + fitted.dy,
    r: circle.r,
  });

  const drawn: MmCircle[] = [];
  const keptSources: GlassCircle[] = [];
  let lidar: MmCircle | undefined;
  let flash: MmRect | undefined;

  for (const item of required) {
    const circle = move(item.circle);
    if (item.lens.kind === "flash") {
      if (!flash) {
        flash = {
          x: circle.cx - circle.r,
          y: circle.cy - circle.r,
          width: circle.r * 2,
          height: circle.r * 2,
        };
      }
      continue;
    }
    if (SENSOR_KINDS.has(item.lens.kind)) {
      if (!lidar) {
        lidar = circle;
        continue;
      }
    }
    if (!OPTICAL_KINDS.has(item.lens.kind) && item.lens.kind !== "other") continue;
    if (isConcentricDuplicate(item.lens, keptSources)) continue;
    keptSources.push(item.lens);
    drawn.push(circle);
  }

  module = roundOutRect(module);
  const lenses = drawn.map((lens) => ({
    cx: round2(lens.cx),
    cy: round2(lens.cy),
    r: Math.ceil(lens.r * 100) / 100,
  }));
  if (flash) {
    flash = roundOutRect(flash);
  }
  if (lidar) {
    lidar = {
      cx: round2(lidar.cx),
      cy: round2(lidar.cy),
      r: Math.ceil(lidar.r * 100) / 100,
    };
  }

  for (const lens of lenses) {
    module = unionBox(module, circleBox(lens, 0));
  }
  if (flash) module = unionBox(module, flash);
  if (lidar) module = unionBox(module, circleBox(lidar, 0));
  module = roundOutRect(module);
  cornerRadius = Math.min(cornerRadius, module.width / 2, module.height / 2);

  const logoRatio = input.logoRatio;
  let logo: MmCircle | undefined;
  if (logoRatio) {
    logo = {
      cx: round2(logoRatio.cx * input.widthMm),
      cy: round2(logoRatio.cy * input.heightMm),
      r: round2(logoRatio.r * Math.min(input.widthMm, input.heightMm)),
    };
    if (circleOverlapsRect(logo, module)) logo = undefined;
  }

  const inset = input.printSafeInsetRatio;
  return {
    chassisTemplate: `glassback:${input.phone.id}`,
    cornerRadiusMm: round2(panel.r + frameInset),
    camera: {
      module: {
        x: round2(module.x),
        y: round2(module.y),
        width: round2(module.width),
        height: round2(module.height),
        cornerRadius: round2(cornerRadius),
      },
      lenses,
      flash,
      lidar,
    },
    logo,
    printSafeInsetMm: {
      top: round2(inset.top * input.heightMm),
      right: round2(inset.right * input.widthMm),
      bottom: round2(inset.bottom * input.heightMm),
      left: round2(inset.left * input.widthMm),
    },
  };
}
