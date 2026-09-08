import "server-only";

import { gameCheatsPost } from "@/app/data/blog-cheats-data";
import type { BlogGame, BlogPost } from "@/app/data/blog";
import { getGameCoverImage, resolveGameImages } from "@/lib/game-images";

import {
  FEATURED_CHEAT_SLUGS,
  POPULAR_CHEAT_SLUGS,
  type CheatConsoleFilter,
  resolveGameSlug,
} from "./blog-cheats-paths";
import { normalizeCheatSearchQuery } from "./blog-cheats-filters";

export {
  CHEAT_POST_SLUG,
  FEATURED_CHEAT_SLUGS,
  POPULAR_CHEAT_SLUGS,
  cheatGamePath,
  cheatHubPath,
  gameInstallHref,
  gameInstallSlugFromConsole,
  resolveGameSlug,
  type CheatConsoleFilter,
} from "./blog-cheats-paths";

export { filterCheatSections } from "./blog-cheats-filters";

export type CheatGameEntry = BlogGame & {
  gameSlug: string;
  sectionId: string;
  sectionTitle: string;
};

const CONSOLE_LABELS: Record<BlogGame["console"], string> = {
  ps5: "PS5",
  ps4: "PS4",
  xbox: "Xbox",
};

let cachedAllGames: CheatGameEntry[] | null = null;

export function getCheatPost(): BlogPost {
  return gameCheatsPost;
}

export function getAllCheatGames(): CheatGameEntry[] {
  cachedAllGames ??= gameCheatsPost.sections.flatMap((section) =>
    section.games.map((game, index) => ({
      ...game,
      gameSlug: resolveGameSlug(game, index, section.id),
      sectionId: section.id,
      sectionTitle: section.title,
    })),
  );
  return cachedAllGames;
}

export function getCheatGame(gameSlug: string): CheatGameEntry | undefined {
  return getAllCheatGames().find((game) => game.gameSlug === gameSlug);
}

export function getCheatGamesByConsole(
  console: CheatConsoleFilter,
): CheatGameEntry[] {
  const all = getAllCheatGames();
  if (console === "all") return all;
  return all.filter((game) => game.console === console);
}

function gameSearchCorpus(game: CheatGameEntry): string {
  const cheatText =
    game.cheats?.map((c) => `${c.title} ${c.code} ${c.effect}`).join(" ") ?? "";
  return normalizeCheatSearchQuery(
    `${game.name} ${game.genre} ${game.highlight} ${cheatText} ${game.secrets?.join(" ") ?? ""}`,
  );
}

export function searchCheatGames(query: string): CheatGameEntry[] {
  const normalized = normalizeCheatSearchQuery(query);
  if (!normalized) return getAllCheatGames();

  return getAllCheatGames().filter((game) =>
    gameSearchCorpus(game).includes(normalized),
  );
}

export function filterCheatGames(
  console: CheatConsoleFilter,
  query: string,
): CheatGameEntry[] {
  const byConsole = getCheatGamesByConsole(console);
  const normalized = normalizeCheatSearchQuery(query);
  if (!normalized) return byConsole;

  return byConsole.filter((game) => gameSearchCorpus(game).includes(normalized));
}

export function getCheatGamesForInstallConsole(
  installConsoleSlug: string,
  limit = 6,
): CheatGameEntry[] {
  const consoleMap: Record<string, BlogGame["console"]> = {
    ps5: "ps5",
    ps4: "ps4",
    "xbox-one": "xbox",
    "xbox-series": "xbox",
  };
  const blogConsole = consoleMap[installConsoleSlug];
  if (!blogConsole) return [];

  return getCheatGamesByConsole(blogConsole).slice(0, limit);
}

export function generateGameSeo(game: CheatGameEntry): {
  title: string;
  description: string;
  keywords: string[];
} {
  const consoleLabel = CONSOLE_LABELS[game.console];
  const cheatCount = game.cheats?.length ?? 0;
  const secretCount = game.secrets?.length ?? 0;

  const title =
    game.seoTitle ??
    `چیت ${game.name} ${consoleLabel} | کدهای تقلب و رمز مخفی`;

  const description =
    game.seoDescription ??
    `${game.highlight} ${cheatCount > 0 ? `${cheatCount} کد تقلب` : ""}${secretCount > 0 ? ` و ${secretCount} ترفند مخفی` : ""} برای ${consoleLabel} — راهنمای فارسی فیکس‌بازی.`.trim();

  const keywords =
    game.keywords ??
    [
      `چیت ${game.name}`,
      `رمز ${game.name}`,
      `کد تقلب ${game.name}`,
      `چیت ${game.name} ${consoleLabel}`,
      `رمز بازی ${consoleLabel}`,
      "کد مخفی بازی",
      "فیکس بازی",
    ];

  return { title, description, keywords };
}

export function getPopularCheatGames(): CheatGameEntry[] {
  const all = getAllCheatGames();
  return POPULAR_CHEAT_SLUGS.map(
    (slug) => all.find((g) => g.gameSlug === slug)!,
  ).filter(Boolean);
}

export function getFeaturedCheatGames(): CheatGameEntry[] {
  const all = getAllCheatGames();
  return FEATURED_CHEAT_SLUGS.map(
    (slug) => all.find((g) => g.gameSlug === slug)!,
  ).filter(Boolean);
}

export function getHubItemListGames(): CheatGameEntry[] {
  const all = getAllCheatGames();
  const slugs = new Set<string>([
    ...POPULAR_CHEAT_SLUGS,
    ...FEATURED_CHEAT_SLUGS,
  ]);
  return [...slugs]
    .map((slug) => all.find((g) => g.gameSlug === slug))
    .filter((game): game is CheatGameEntry => Boolean(game));
}

export function getCheatGameImages(game: CheatGameEntry): string[] {
  return resolveGameImages({
    slug: game.gameSlug,
    name: game.name,
    fallback: game.coverImage,
  }).images;
}

export function getCheatGameCoverImage(game: CheatGameEntry): string {
  return (
    getGameCoverImage({
      slug: game.gameSlug,
      name: game.name,
      fallback: game.coverImage,
    }) ?? game.coverImage
  );
}

export function getSampleCheat(game: CheatGameEntry): {
  title: string;
  code: string;
} | null {
  if (game.cheats && game.cheats.length > 0) {
    return { title: game.cheats[0].title, code: game.cheats[0].code };
  }
  if (game.secrets && game.secrets.length > 0) {
    return { title: "ترفند مخفی", code: game.secrets[0] };
  }
  return null;
}
