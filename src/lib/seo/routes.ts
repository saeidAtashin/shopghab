import { issues } from "@/app/data/issues";
import { services } from "@/app/data/services";
import { repairSitemapPaths } from "./repair-seo";

export const GAME_INSTALL_CONSOLES = [
  "ps4",
  "ps5",
  "xbox-one",
  "xbox-series",
] as const;

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
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/issues", changeFrequency: "weekly", priority: 0.8 },
  ...repairSitemapPaths().map((path) => ({
    path,
    changeFrequency: "monthly" as const,
    priority: path === "/repair" ? 0.85 : 0.8,
  })),
  { path: "/tracking", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.65 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  ...services.map((s) => ({
    path: `/services/${s.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  })),
  ...issues.map((i) => ({
    path: `/issues/${i.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  })),
  ...GAME_INSTALL_CONSOLES.map((slug) => ({
    path: `/services/game-install/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  })),
];
