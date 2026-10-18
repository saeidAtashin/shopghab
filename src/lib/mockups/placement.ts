import type { Point } from "./types";

export type CornerSource = {
  transform?: number[];
  nonAffineTransform?: number[];
};

/**
 * Photoshop stores the visible corners in `nonAffineTransform` when a Smart Object
 * is rotated or in perspective. `transform` is often only the upright bounds.
 * Order is top-left, top-right, bottom-right, bottom-left.
 */
export function placementCorners(placed: CornerSource): number[] {
  const nonAffine = placed.nonAffineTransform;
  if (nonAffine && nonAffine.length === 8) return nonAffine;
  return placed.transform ?? [];
}

export function quadIsAxisAligned(quad: [Point, Point, Point, Point], epsilon = 1.5): boolean {
  const [topLeft, topRight, bottomRight, bottomLeft] = quad;
  const same = (left: number, right: number) => Math.abs(left - right) <= epsilon;
  return (
    same(topLeft.y, topRight.y) &&
    same(bottomLeft.y, bottomRight.y) &&
    same(topLeft.x, bottomLeft.x) &&
    same(topRight.x, bottomRight.x)
  );
}

/** True when opaque pixels fill a straight rectangle. A tilted silhouette leaves the box corners empty. */
export function opaqueBoundsFillRectangle(
  data: Uint8Array | Buffer,
  width: number,
  height: number,
  channels = 4,
): boolean {
  const alphaAt = (x: number, y: number) => data[(y * width + x) * channels + (channels - 1)] ?? 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alphaAt(x, y) < 128) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX - minX < 2 || maxY - minY < 2) return false;
  const corners = [alphaAt(minX, minY), alphaAt(maxX, minY), alphaAt(minX, maxY), alphaAt(maxX, maxY)];
  return corners.filter((alpha) => alpha >= 128).length >= 3;
}
