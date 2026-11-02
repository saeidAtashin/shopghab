import type { MockupRecord } from "./types";

export type ProductImageSource = {
  imagePath: string;
  thumbnailPath: string;
  gallery: string[];
  mockups: MockupRecord[];
  width: number;
  height: number;
  alt: string;
  title: string;
};

export type ProductFrame = {
  src: string;
  thumb: string;
};

export type ProductImages = {
  hero: string;
  thumb: string;
  gallery: string[];
  frames: ProductFrame[];
  width: number;
  height: number;
  alt: string;
};

/** Listing photo that should open every design gallery. */
export const LEAD_LISTING_TEMPLATE_ID = "iphone-pro-in-hand";

function safeAsset(path: string): boolean {
  return path.startsWith("/designed/") && !path.includes("..") && !path.includes("\\");
}

function leadFirst(mockups: MockupRecord[]): MockupRecord[] {
  const leadIndex = mockups.findIndex((item) => item.templateId === LEAD_LISTING_TEMPLATE_ID);
  if (leadIndex <= 0) return mockups;
  const lead = mockups[leadIndex];
  if (!lead) return mockups;
  return [lead, ...mockups.slice(0, leadIndex), ...mockups.slice(leadIndex + 1)];
}

function readyProductMockups(mockups: MockupRecord[]): MockupRecord[] {
  return mockups.filter(
    (item) => item.status === "ready" && safeAsset(item.path) && safeAsset(item.thumbPath),
  );
}

export function designHasProductMockup(design: { mockups: MockupRecord[] }): boolean {
  return readyProductMockups(design.mockups).length > 0;
}

export function designImageAlt(design: { alt: string; title: string }): string {
  const alt = design.alt.trim();
  if (alt) return alt;
  const title = design.title.trim();
  if (!title) return "طرح قاب";
  if (/[\u0600-\u06FF]/.test(title)) return title;
  return `طرح قاب ${title}`;
}

export function selectProductImages(design: ProductImageSource): ProductImages {
  const ready = leadFirst(readyProductMockups(design.mockups));
  const hero = ready[0];
  const extra = ready.slice(1).map((item) => item.path);
  const used = new Set<string>([hero?.path ?? "", ...extra]);
  const editorial = design.gallery.filter((path) => safeAsset(path) && !used.has(path));
  const frames = ready.map((item) => ({ src: item.path, thumb: item.thumbPath }));
  if (frames.length === 0 && safeAsset(design.imagePath)) {
    frames.push({ src: design.imagePath, thumb: design.thumbnailPath || design.imagePath });
  }
  return {
    hero: hero?.path || design.imagePath,
    thumb: hero?.thumbPath || design.thumbnailPath || design.imagePath,
    gallery: [...extra, ...editorial],
    frames,
    width: hero?.width || design.width || 1600,
    height: hero?.height || design.height || 1600,
    alt: designImageAlt(design),
  };
}
