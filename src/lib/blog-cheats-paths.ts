import type { BlogGame } from "@/app/data/blog";

export const CHEAT_POST_SLUG = "game-cheats-codes-2026";

export type CheatConsoleFilter = "all" | "ps5" | "ps4" | "xbox";

export const POPULAR_CHEAT_SLUGS = [
  "gta-v-cheats",
  "rdr2-cheats",
  "minecraft-cheats",
  "sims-4-cheats",
  "skyrim-cheats",
  "mortal-kombat-1-cheats",
] as const;

export const FEATURED_CHEAT_SLUGS = [
  "gta-v-cheats",
  "minecraft-cheats",
  "sims-4-cheats",
  "rdr2-cheats",
  "skyrim-cheats",
  "lego-harry-potter-cheats",
] as const;

export function cheatHubPath(): string {
  return `/blog/${CHEAT_POST_SLUG}`;
}

export function cheatGamePath(gameSlug: string): string {
  return `/blog/${CHEAT_POST_SLUG}/${gameSlug}`;
}

export function gameInstallHref(console: BlogGame["console"]): string {
  const map: Record<BlogGame["console"], string> = {
    ps5: "/services/game-install/ps5",
    ps4: "/services/game-install/ps4",
    xbox: "/services/game-install/xbox-series",
  };
  return map[console];
}

export function gameInstallSlugFromConsole(
  console: BlogGame["console"],
): string {
  const map: Record<BlogGame["console"], string> = {
    ps5: "ps5",
    ps4: "ps4",
    xbox: "xbox-series",
  };
  return map[console];
}

export function resolveGameSlug(
  game: BlogGame,
  index: number,
  sectionId: string,
): string {
  return game.slug ?? `${sectionId}-game-${index}`;
}
