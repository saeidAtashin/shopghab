import type { InstallCatalogGame } from "@/lib/game-install-catalog";
import {
  calculateInstallQuote,
  formatQuoteSummary,
  type InstallMethodId,
} from "@/lib/game-install-quote";

export type InstallListGame = {
  id: string;
  slug: string;
  name: string;
  backgroundImage: string | null;
  consoleSlug: string;
  custom?: boolean;
};

export const INSTALL_GAME_LIST_CHANGED_EVENT = "game-install-list-changed";

const STORAGE_KEY = "game-install-list";

function normalizeGameName(name: string): string {
  return name.trim().toLowerCase();
}

function dispatchListChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(INSTALL_GAME_LIST_CHANGED_EVENT));
}

function isValidListGame(value: unknown): value is InstallListGame {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<InstallListGame>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.consoleSlug === "string"
  );
}

export function toInstallListGame(
  game: InstallCatalogGame,
  consoleSlug: string,
): InstallListGame {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    backgroundImage: game.coverImage,
    consoleSlug,
  };
}

export function readInstallGameList(): InstallListGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidListGame);
  } catch {
    return [];
  }
}

export function writeInstallGameList(games: InstallListGame[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  dispatchListChanged();
}

export function filterInstallGameList(consoleSlug: string): InstallListGame[] {
  return readInstallGameList().filter((g) => g.consoleSlug === consoleSlug);
}

export function isInInstallGameList(gameId: string): boolean {
  return readInstallGameList().some((g) => g.id === gameId);
}

export function addToInstallGameList(entry: InstallListGame): boolean {
  const list = readInstallGameList();
  if (list.some((g) => g.id === entry.id)) return false;
  writeInstallGameList([...list, entry]);
  return true;
}

export function addCustomGameToInstallList(
  name: string,
  consoleSlug: string,
): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;

  const list = readInstallGameList();
  const normalized = normalizeGameName(trimmed);
  const duplicate = list.some(
    (g) =>
      g.consoleSlug === consoleSlug &&
      normalizeGameName(g.name) === normalized,
  );
  if (duplicate) return false;

  writeInstallGameList([
    ...list,
    {
      id: `custom-${Date.now()}`,
      slug: "",
      name: trimmed,
      backgroundImage: null,
      consoleSlug,
      custom: true,
    },
  ]);
  return true;
}

export function removeFromInstallGameList(gameId: string): void {
  writeInstallGameList(readInstallGameList().filter((g) => g.id !== gameId));
}

export function clearInstallGameListForConsole(consoleSlug: string): void {
  writeInstallGameList(
    readInstallGameList().filter((g) => g.consoleSlug !== consoleSlug),
  );
}

export function formatInstallGameListDescription(
  games: InstallListGame[],
  consoleLabel: string,
  options?: {
    installMethodId?: InstallMethodId;
  },
): string {
  const quote = options?.installMethodId
    ? calculateInstallQuote(options.installMethodId, games.length)
    : null;

  const lines = games.map(
    (game, index) =>
      `${(index + 1).toLocaleString("fa-IR")}. ${game.name}`,
  );

  const header = [`درخواست نصب بازی — ${consoleLabel}`];
  const quoteLine = formatQuoteSummary(quote);
  if (quoteLine) header.push(quoteLine);

  return [...header, "", ...lines].join("\n");
}
