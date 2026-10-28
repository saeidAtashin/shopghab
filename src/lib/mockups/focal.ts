import { z } from "zod";

export const mockupPlacementSchema = z.object({
  focalX: z.number().min(0).max(1),
  focalY: z.number().min(0).max(1),
});

export type MockupPlacement = z.infer<typeof mockupPlacementSchema>;

const CENTER = 0.5;
const CENTER_EPSILON = 0.0001;

export function normalizePlacement(focalX: number, focalY: number): MockupPlacement {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const round = (value: number) => Math.round(clamp(value) * 10000) / 10000;
  return { focalX: round(focalX), focalY: round(focalY) };
}

export function isCenterPlacement(placement: MockupPlacement | undefined): boolean {
  if (!placement) return true;
  return (
    Math.abs(placement.focalX - CENTER) <= CENTER_EPSILON &&
    Math.abs(placement.focalY - CENTER) <= CENTER_EPSILON
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

/** Pixel window of a cover crop. Focal 0 is the start edge and 1 is the end edge. */
export function coverCropRect(
  artWidth: number,
  artHeight: number,
  regionWidth: number,
  regionHeight: number,
  placement: MockupPlacement,
): CoverCropRect {
  const scale = Math.max(regionWidth / artWidth, regionHeight / artHeight);
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

/** Visible fraction of the artwork after a cover fit, used by the admin crop frame. */
export function coverWindowFractions(
  artWidth: number,
  artHeight: number,
  regionWidth: number,
  regionHeight: number,
): { width: number; height: number } {
  if (artWidth < 1 || artHeight < 1 || regionWidth < 1 || regionHeight < 1) {
    return { width: 1, height: 1 };
  }
  const scale = Math.max(regionWidth / artWidth, regionHeight / artHeight);
  return {
    width: Math.min(1, regionWidth / (artWidth * scale)),
    height: Math.min(1, regionHeight / (artHeight * scale)),
  };
}
