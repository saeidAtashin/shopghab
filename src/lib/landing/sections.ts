import { z } from "zod";

export const landingCardStyleSchema = z.enum(["glass", "bento", "editorial", "ticket"]);

const bannerIdSchema = z.string().min(1).max(80);

export function cleanBannerMap(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const banners: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    const parsed = bannerIdSchema.safeParse(item);
    if (!bannerIdSchema.safeParse(key).success || !parsed.success) continue;
    banners[key] = parsed.data;
  }
  return Object.keys(banners).length > 0 ? banners : undefined;
}

export const landingSectionSchema = z.object({
  visible: z.boolean(),
  style: landingCardStyleSchema,
  itemIds: z.array(z.string()).optional(),
  banners: z.preprocess(cleanBannerMap, z.record(bannerIdSchema, bannerIdSchema).optional()).optional(),
});

export const landingSectionsSchema = z.object({
  categories: landingSectionSchema,
  features: landingSectionSchema,
  collections: landingSectionSchema,
});

export type LandingCardStyle = z.infer<typeof landingCardStyleSchema>;
export type LandingSectionSetting = z.infer<typeof landingSectionSchema>;
export type LandingSections = z.infer<typeof landingSectionsSchema>;
export type LandingSectionKey = keyof LandingSections;

export const LANDING_CARD_STYLES: { id: LandingCardStyle; label: string }[] = [
  { id: "glass", label: "شیشه‌ای" },
  { id: "bento", label: "بنتو" },
  { id: "editorial", label: "ادیتوریال" },
  { id: "ticket", label: "بلیت" },
];

export const LANDING_SECTION_COPY: Record<
  LandingSectionKey,
  { title: string; description: string }
> = {
  categories: {
    title: "دسته‌ها",
    description: "تم‌های فروش قاب موبایل را در شاپ قاب بر اساس موضوع ببین.",
  },
  features: {
    title: "ویژگی‌ها",
    description: "رنگ، سبک بصری و حال‌وهوا را جدا از دسته انتخاب کن.",
  },
  collections: {
    title: "کالکشن‌ها",
    description: "فهرست‌های منتخب فروشگاه برای هدیه، فصل و مناسبت.",
  },
};

export const DEFAULT_LANDING_SECTIONS: LandingSections = {
  categories: { visible: true, style: "bento" },
  features: { visible: true, style: "glass" },
  collections: { visible: true, style: "ticket" },
};

export function parseLandingSections(value: unknown): LandingSections {
  const parsed = landingSectionsSchema.safeParse(value);
  if (!parsed.success) return structuredClone(DEFAULT_LANDING_SECTIONS);
  for (const section of Object.values(parsed.data)) {
    if (!section.banners) delete section.banners;
  }
  return parsed.data;
}

export function selectLandingItems<T extends { id: string }>(
  items: T[],
  itemIds: string[] | undefined,
): T[] {
  if (itemIds === undefined) return items;
  const byId = new Map(items.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const selected: T[] = [];
  for (const id of itemIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const item = byId.get(id);
    if (item) selected.push(item);
  }
  return selected;
}
