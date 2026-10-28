import { z } from "zod";

export const MIN_PLACEMENT_ZOOM = 1;
export const MAX_PLACEMENT_ZOOM = 6;

export const mockupPlacementSchema = z.object({
  focalX: z.number().min(0).max(1),
  focalY: z.number().min(0).max(1),
  /** 1 is the cover fit. Higher values crop tighter around the focal point. */
  zoom: z.number().min(MIN_PLACEMENT_ZOOM).max(MAX_PLACEMENT_ZOOM).optional(),
});

export type MockupPlacement = z.infer<typeof mockupPlacementSchema>;

const CENTER = 0.5;
const CENTER_EPSILON = 0.0001;

export function clampPlacementZoom(zoom: number | undefined): number {
  if (zoom == null || !Number.isFinite(zoom)) return MIN_PLACEMENT_ZOOM;
  const clamped = Math.min(MAX_PLACEMENT_ZOOM, Math.max(MIN_PLACEMENT_ZOOM, zoom));
  return Math.round(clamped * 10000) / 10000;
}

export function normalizePlacement(focalX: number, focalY: number, zoom = MIN_PLACEMENT_ZOOM): MockupPlacement {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const round = (value: number) => Math.round(clamp(value) * 10000) / 10000;
  const nextZoom = clampPlacementZoom(zoom);
  const placement: MockupPlacement = { focalX: round(focalX), focalY: round(focalY) };
  if (Math.abs(nextZoom - MIN_PLACEMENT_ZOOM) > CENTER_EPSILON) placement.zoom = nextZoom;
  return placement;
}

export function isCenterPlacement(placement: MockupPlacement | undefined): boolean {
  if (!placement) return true;
  return (
    Math.abs(placement.focalX - CENTER) <= CENTER_EPSILON &&
    Math.abs(placement.focalY - CENTER) <= CENTER_EPSILON &&
    Math.abs(clampPlacementZoom(placement.zoom) - MIN_PLACEMENT_ZOOM) <= CENTER_EPSILON
  );
}

export type CoverCropRect = {
  resizedWidth: number;
  resizedHeight: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Pixel window of a cover crop. Focal 0 is the start edge and 1 is the end edge. Zoom 1 is the cover fit. */
export function coverCropRect(
  artWidth: number,
  artHeight: number,
  regionWidth: number,
  regionHeight: number,
  placement: MockupPlacement,
): CoverCropRect {
  const zoom = clampPlacementZoom(placement.zoom);
  const scale = Math.max(regionWidth / artWidth, regionHeight / artHeight) * zoom;
  const resizedWidth = Math.max(regionWidth, Math.round(artWidth * scale));
  const resizedHeight = Math.max(regionHeight, Math.round(artHeight * scale));
  const maxLeft = resizedWidth - regionWidth;
  const maxTop = resizedHeight - regionHeight;
  return {
    resizedWidth,
    resizedHeight,
    left: Math.min(maxLeft, Math.max(0, Math.round(placement.focalX * maxLeft))),
    top: Math.min(maxTop, Math.max(0, Math.round(placement.focalY * maxTop))),
    width: regionWidth,
    height: regionHeight,
  };
}
