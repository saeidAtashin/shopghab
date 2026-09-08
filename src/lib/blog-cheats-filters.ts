import type { BlogGame, BlogGameSection } from "@/app/data/blog";

import {
  type CheatConsoleFilter,
  resolveGameSlug,
} from "./blog-cheats-paths";

export function normalizeCheatSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function gameSearchCorpus(game: BlogGame): string {
  const cheatText =
    game.cheats?.map((c) => `${c.title} ${c.code} ${c.effect}`).join(" ") ?? "";
  return normalizeCheatSearchQuery(
    `${game.name} ${game.genre} ${game.highlight} ${cheatText} ${game.secrets?.join(" ") ?? ""}`,
  );
}

function matchesConsole(
  game: BlogGame,
  console: CheatConsoleFilter,
): boolean {
  return console === "all" || game.console === console;
}

function matchesQuery(game: BlogGame, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return gameSearchCorpus(game).includes(normalizedQuery);
}

export function filterCheatSections(
  sections: BlogGameSection[],
  console: CheatConsoleFilter,
  query: string,
): BlogGameSection[] {
  const normalizedQuery = normalizeCheatSearchQuery(query);

  return sections
    .map((section) => ({
      ...section,
      games: section.games.filter(
        (game, index) =>
          matchesConsole(game, console) &&
          matchesQuery(game, normalizedQuery),
      ),
    }))
    .filter((section) => section.games.length > 0);
}
