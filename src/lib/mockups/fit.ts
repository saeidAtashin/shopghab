export type ContainPlacement = {
  artWidth: number;
  artHeight: number;
  regionWidth: number;
  regionHeight: number;
  scale: number;
  x: number;
  y: number;
  placedWidth: number;
  placedHeight: number;
};

const RATIO_EPSILON = 1e-6;

export function containPlacement(
  artWidth: number,
  artHeight: number,
  regionWidth: number,
  regionHeight: number,
): ContainPlacement {
  if (artWidth <= 0 || artHeight <= 0 || regionWidth <= 0 || regionHeight <= 0) {
    throw new Error("Artwork and printable region dimensions must be positive.");
  }

  const scale = Math.min(regionWidth / artWidth, regionHeight / artHeight);
  const placedWidth = artWidth * scale;
  const placedHeight = artHeight * scale;

  return {
    artWidth,
    artHeight,
    regionWidth,
    regionHeight,
    scale,
    x: (regionWidth - placedWidth) / 2,
    y: (regionHeight - placedHeight) / 2,
    placedWidth,
    placedHeight,
  };
}

export function aspectPreserved(placement: ContainPlacement): boolean {
  const artRatio = placement.artWidth / placement.artHeight;
  const placedRatio = placement.placedWidth / placement.placedHeight;
  return Math.abs(artRatio - placedRatio) <= RATIO_EPSILON;
}

export function artworkFullyInside(placement: ContainPlacement): boolean {
  return (
    placement.x >= -RATIO_EPSILON &&
    placement.y >= -RATIO_EPSILON &&
    placement.x + placement.placedWidth <= placement.regionWidth + RATIO_EPSILON &&
    placement.y + placement.placedHeight <= placement.regionHeight + RATIO_EPSILON &&
    placement.placedWidth <= placement.regionWidth + RATIO_EPSILON &&
    placement.placedHeight <= placement.regionHeight + RATIO_EPSILON
  );
}

/** The filled printable texture always matches the region, including bars around the contained artwork. */
export function filledTextureSize(placement: ContainPlacement): { width: number; height: number } {
  return { width: placement.regionWidth, height: placement.regionHeight };
}
