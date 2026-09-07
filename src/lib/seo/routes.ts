import { cases } from "@/app/data/cases";

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
  { path: "/cases", changeFrequency: "weekly", priority: 0.95 },
  { path: "/custom", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tracking", changeFrequency: "monthly", priority: 0.55 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.65 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  ...cases.map((item) => ({
    path: `/cases/${item.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  })),
];
