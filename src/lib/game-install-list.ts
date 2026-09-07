import type { RawgGame } from "@/lib/rawg";

export type InstallListGame = {
  id: number;
  slug: string;
  name: string;
  backgroundImage: string | null;
  consoleSlug: string;
};

const STORAGE_KEY = "game-install-list";

export function toInstallListGame(
  game: RawgGame,
  consoleSlug: string,
): InstallListGame {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    backgroundImage: game.backgroundImage,
    consoleSlug,
  };
}

export function readInstallGameList(): InstallListGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as InstallListGame[]) : [];
  } catch {
    return [];
  }
}

export function writeInstallGameList(games: InstallListGame[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function isInInstallGameList(gameId: number): boolean {
  return readInstallGameList().some((g) => g.id === gameId);
}

export function addToInstallGameList(entry: InstallListGame): boolean {
  const list = readInstallGameList();
  if (list.some((g) => g.id === entry.id)) return false;
  writeInstallGameList([...list, entry]);
  return true;
}

export function removeFromInstallGameList(gameId: number): void {
  writeInstallGameList(readInstallGameList().filter((g) => g.id !== gameId));
}
