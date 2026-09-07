import { GAME_FILTERS, type GameFilterId } from "@/lib/game-filters";

export type GameInstallConsole = "ps4" | "ps5" | "xbox-one" | "xbox-series";

/** RAWG platform IDs — https://api.rawg.io/api/platforms */
const CONSOLE_PLATFORM_IDS: Record<GameInstallConsole, number> = {
  ps4: 18,
  ps5: 187,
  "xbox-one": 1,
  "xbox-series": 186,
};

export type RawgGame = {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  backgroundImage: string | null;
  rating: number | null;
  metacritic: number | null;
};

type RawgGamesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    slug: string;
    name: string;
    released: string | null;
    background_image: string | null;
    rating: number | null;
    metacritic: number | null;
  }[];
};

export function isGameInstallConsole(value: string): value is GameInstallConsole {
  return value in CONSOLE_PLATFORM_IDS;
}

function getApiKey(): string {
  const key = process.env.RAWG_API_KEY;
  if (!key) {
    throw new Error("RAWG_API_KEY is not configured");
  }
  return key;
}

function mapGame(item: RawgGamesResponse["results"][number]): RawgGame {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    released: item.released,
    backgroundImage: item.background_image,
    rating: item.rating,
    metacritic: item.metacritic,
  };
}

export async function fetchGamesByConsole(
  console: GameInstallConsole,
  options?: {
    page?: number;
    pageSize?: number;
    filter?: GameFilterId;
  },
): Promise<{
  games: RawgGame[];
  count: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  filter: GameFilterId;
}> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(40, Math.max(1, options?.pageSize ?? 24));
  const filter = options?.filter ?? "best";
  const ordering = GAME_FILTERS[filter].ordering;
  const platformId = CONSOLE_PLATFORM_IDS[console];

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", getApiKey());
  url.searchParams.set("platforms", String(platformId));
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("ordering", ordering);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`RAWG API error: ${res.status}`);
  }

  const data = (await res.json()) as RawgGamesResponse;

  return {
    games: data.results.map(mapGame),
    count: data.count,
    page,
    pageSize,
    hasNext: Boolean(data.next),
    filter,
  };
}

export type GameCatalogSection = {
  filter: GameFilterId;
  games: RawgGame[];
  totalCount: number;
};

export async function fetchGameCatalogSections(
  console: GameInstallConsole,
  filterIds: GameFilterId[],
  previewSize = 12,
): Promise<GameCatalogSection[]> {
  const results = await Promise.all(
    filterIds.map(async (filter) => {
      const { games, count } = await fetchGamesByConsole(console, {
        filter,
        pageSize: previewSize,
      });
      return { filter, games, totalCount: count };
    }),
  );
  return results;
}

