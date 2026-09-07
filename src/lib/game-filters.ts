export const GAME_FILTERS = {
  popular: {
    id: "popular",
    label: "پرطرفدار",
    description: "بازی‌های پرطرفدار و پر بازدید",
    ordering: "-added",
  },
  newest: {
    id: "newest",
    label: "جدیدترین",
    description: "تازه‌ترین انتشارها",
    ordering: "-released",
  },
  best: {
    id: "best",
    label: "بهترین امتیاز",
    description: "بالاترین امتیاز کاربران",
    ordering: "-rating",
  },
  metacritic: {
    id: "metacritic",
    label: "برترین متاکریتیک",
    description: "بالاترین نمره منتقدان",
    ordering: "-metacritic",
  },
} as const;

export type GameFilterId = keyof typeof GAME_FILTERS;

export const GAME_FILTER_IDS = Object.keys(GAME_FILTERS) as GameFilterId[];

/** Filters shown as horizontal rows on the game-install hub page */
export const GAME_CATALOG_FILTER_IDS: GameFilterId[] = [
  "popular",
  "newest",
  "best",
  "metacritic",
];

export function isGameFilter(value: string): value is GameFilterId {
  return value in GAME_FILTERS;
}

export function getGameFilter(value: string) {
  return isGameFilter(value) ? GAME_FILTERS[value] : undefined;
}

export function gameListPath(
  consoleSlug: string,
  filter: GameFilterId,
  page = 1,
): string {
  const base = `/services/game-install/${consoleSlug}/games`;
  const params = new URLSearchParams({ filter });
  if (page > 1) params.set("page", String(page));
  return `${base}?${params.toString()}`;
}
