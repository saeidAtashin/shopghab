import type { PhoneModel } from "./types";

const LEADING_BRAND: Record<string, RegExp[]> = {
  apple: [/^\s*آیفون\s+/u, /^\s*iPhone\s+/i],
  samsung: [/^\s*سامسونگ\s+/u, /^\s*Samsung\s+/i, /^\s*گلکسی\s+/u, /^\s*Galaxy\s+/i],
  xiaomi: [/^\s*شیائومی\s+/u, /^\s*Xiaomi\s+/i],
  huawei: [/^\s*هواوی\s+/u, /^\s*Huawei\s+/i],
};

function stripLeadingBrand(value: string, brandSlug: string): string {
  const trimmed = value.trim();
  for (const pattern of LEADING_BRAND[brandSlug] ?? []) {
    const next = trimmed.replace(pattern, "").trim();
    if (next && next !== trimmed) return next;
  }
  return trimmed;
}

/** Model title for a picker that already shows the brand. Catalog names stay unchanged. */
export function modelPickerName(model: Pick<PhoneModel, "brandSlug" | "name" | "nameEn">): {
  name: string;
  nameEn: string;
} {
  return {
    name: stripLeadingBrand(model.name, model.brandSlug),
    nameEn: stripLeadingBrand(model.nameEn, model.brandSlug),
  };
}
