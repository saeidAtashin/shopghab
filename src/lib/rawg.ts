import type { GameFilterId } from "@/lib/game-filters";
import { getApiBaseUrl } from "@/lib/api-client";

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

export function isGameInstallConsole(value: string): value is GameInstallConsole {
  return value in CONSOLE_PLATFORM_IDS;
}

type RemoteGamesResponse = {
  success?: boolean;
  message?: string;
  games?: RawgGame[];
  count?: number;
  hasNext?: boolean;
};

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
  const url = new URL(`${getApiBaseUrl()}/api/games`);
  url.searchParams.set("console", console);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("filter", filter);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  const data = (await res.json()) as RemoteGamesResponse;

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Games API error: ${res.status}`);
  }

  return {
    games: data.games ?? [],
    count: data.count ?? 0,
    page,
    pageSize,
    hasNext: Boolean(data.hasNext),
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

