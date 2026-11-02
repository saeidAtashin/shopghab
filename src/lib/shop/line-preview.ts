import { designedAssetUrl } from "@/lib/designed-assets";
import { getReadyCaseById } from "@/lib/cases/ready.static";

import type { CartLineItem } from "./types";

export type LinePreview = {
  src: string;
  alt: string;
};

type PreviewOptions = {
  /** In-memory cart previews may be data URLs. Stored responses omit them. */
  allowData?: boolean;
};

export function resolvePreviewSrc(image: string): string {
  if (!image) return "";
  if (
    image.startsWith("data:") ||
    image.startsWith("blob:") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/")
  ) {
    return image;
  }
  return designedAssetUrl(image);
}

export function linePreview(item: CartLineItem, options: PreviewOptions = {}): LinePreview | null {
  let raw = "";
  let alt = "قاب";

  if (item.kind === "ready") {
    const product = getReadyCaseById(item.productId);
    raw = product?.image ?? "";
    alt = product?.title || "قاب آماده";
  } else {
    raw = item.previewUrl;
    alt = item.title.trim() || (item.kind === "catalog" ? "طرح پیش‌ساخته" : "طراحی اختصاصی");
  }

  if (!raw) return null;
  if (!options.allowData && raw.startsWith("data:")) return null;

  const src = resolvePreviewSrc(raw);
  if (!src) return null;
  return { src, alt };
}

export function linePreviews(items: CartLineItem[], options: PreviewOptions = {}): LinePreview[] {
  const previews: LinePreview[] = [];
  for (const item of items) {
    const preview = linePreview(item, options);
    if (preview) previews.push(preview);
  }
  return previews;
}
