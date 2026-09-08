import "server-only";

import type { BlogGame } from "@/app/data/blog";
import { blogPosts } from "@/app/data/blog";
import { getAllCheatGames } from "@/lib/blog-cheats";
import { resolveGameSlug } from "@/lib/blog-cheats-paths";
import {
  isExcludedCatalogSection,
  type InstallCatalogGame,
} from "@/lib/game-install-catalog";

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function dedupeKey(name: string, consoleId: BlogGame["console"]): string {
  return `${normalizeName(name)}|${consoleId}`;
}

function toCatalogGame(
  game: BlogGame,
  sectionTitle: string,
  source: InstallCatalogGame["source"],
  slug: string,
): InstallCatalogGame {
  return {
    id: `${slug}|${game.console}`,
    slug,
    name: game.name,
    coverImage: game.coverImage,
    rating: game.rating,
    metacritic: game.metacritic,
    genre: game.genre,
    console: game.console,
    sectionTitle,
    source,
  };
}

/** All installable games from cheats + blog, every console, minus excluded sections. */
export function getInstallCatalogGames(_consoleSlug?: string): InstallCatalogGame[] {
  const byKey = new Map<string, InstallCatalogGame>();

  for (const cheat of getAllCheatGames()) {
    if (isExcludedCatalogSection(cheat.sectionTitle)) continue;
    const entry = toCatalogGame(
      cheat,
      cheat.sectionTitle,
      "cheats",
      cheat.gameSlug,
    );
    byKey.set(dedupeKey(cheat.name, cheat.console), entry);
  }

  for (const post of blogPosts) {
    if (!post.sections?.length) continue;
    for (const section of post.sections) {
      if (isExcludedCatalogSection(section.title)) continue;
      section.games.forEach((game, index) => {
        const key = dedupeKey(game.name, game.console);
        if (byKey.has(key)) return;
        const slug = resolveGameSlug(game, index, section.id);
        byKey.set(key, toCatalogGame(game, section.title, "blog", slug));
      });
    }
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
