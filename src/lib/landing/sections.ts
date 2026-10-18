import { z } from "zod";

export const landingCardStyleSchema = z.enum(["glass", "bento", "editorial", "ticket"]);

export const landingSectionSchema = z.object({
  visible: z.boolean(),
  style: landingCardStyleSchema,
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
    description: "تم‌های طراحی قاب را بر اساس موضوع ببین.",
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
  return parsed.data;
}
