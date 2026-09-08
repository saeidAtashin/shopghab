import type { BlogGame } from "@/app/data/blog";

export type InstallCatalogGame = {
  id: string;
  slug: string;
  name: string;
  coverImage: string;
  rating: number;
  metacritic?: number;
  genre: string;
  console: BlogGame["console"];
  sectionTitle: string;
  source: "cheats" | "blog";
};

/** Section titles hidden from catalog and category filters. */
export const EXCLUDED_CATALOG_SECTIONS = new Set([
  "رمز و چیت انحصاری‌ها و مستقل‌ها",
  "کلاسیک‌های PS4 که هنوز ارزش نصب دارند",
]);

const CONSOLE_LABELS: Record<BlogGame["console"], string> = {
  ps5: "PS5",
  ps4: "PS4",
  xbox: "Xbox",
};

export function getInstallCatalogConsoleLabel(
  consoleId: BlogGame["console"],
): string {
  return CONSOLE_LABELS[consoleId];
}

export function isExcludedCatalogSection(sectionTitle: string): boolean {
  return EXCLUDED_CATALOG_SECTIONS.has(sectionTitle);
}

export function getInstallCatalogSections(
  games: InstallCatalogGame[],
): string[] {
  return [...new Set(games.map((g) => g.sectionTitle))]
    .filter((title) => !isExcludedCatalogSection(title))
    .sort((a, b) => a.localeCompare(b, "fa"));
}
