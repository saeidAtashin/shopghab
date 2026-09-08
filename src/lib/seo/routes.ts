import { PHONE_BRANDS, PHONE_MODELS } from "@/lib/cases/brands.static";

export type SitemapEntry = {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

/** Public indexable routes for sitemap and internal linking. */
export const PUBLIC_SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/create", changeFrequency: "weekly", priority: 0.95 },
  ...PHONE_BRANDS.filter((b) => b.slug !== "other").map((brand) => ({
    path: `/phones/${brand.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  })),
  ...PHONE_MODELS.filter((m) => m.brandSlug !== "other").map((model) => ({
    path: `/phones/${model.brandSlug}/${model.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  })),
  ...PHONE_BRANDS.map((brand) => ({
    path: `/create/${brand.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  })),
  { path: "/cart", changeFrequency: "monthly", priority: 0.5 },
  { path: "/checkout", changeFrequency: "monthly", priority: 0.5 },
  { path: "/tracking", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
];
