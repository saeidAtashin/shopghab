import { services } from "@/app/data/services";

export type ConsoleId = "ps5" | "ps4" | "xbox";

export type ConsoleCatalogEntry = {
  id: ConsoleId;
  title: string;
  repairSlug: string;
  description: string;
  gameInstallSlugs: { slug: string; label: string }[];
};

const repair = (slug: string) => services.find((s) => s.slug === slug);

export const consoleCatalog: Record<ConsoleId, ConsoleCatalogEntry> = {
  ps5: {
    id: "ps5",
    title: "PS5",
    repairSlug: "ps5-repair",
    description:
      "تعمیر، نصب بازی، فروش کنسول و قطعات پلی‌استیشن 5 — همه خدمات در یک مسیر.",
    gameInstallSlugs: [{ slug: "ps5", label: "نصب بازی PS5" }],
  },
  ps4: {
    id: "ps4",
    title: "PS4",
    repairSlug: "ps4-repair",
    description:
      "تعمیر، نصب بازی، فروش کنسول و قطعات پلی‌استیشن 4 — همه خدمات در یک مسیر.",
    gameInstallSlugs: [{ slug: "ps4", label: "نصب بازی PS4" }],
  },
  xbox: {
    id: "xbox",
    title: "Xbox",
    repairSlug: "xbox-repair",
    description:
      "تعمیر، نصب بازی، فروش کنسول و قطعات Xbox Series و Xbox One.",
    gameInstallSlugs: [
      { slug: "xbox-series", label: "نصب بازی Xbox Series" },
      { slug: "xbox-one", label: "نصب بازی Xbox One" },
    ],
  },
};

export const consoleIds = Object.keys(consoleCatalog) as ConsoleId[];

export function getConsole(id: string): ConsoleCatalogEntry | undefined {
  return consoleCatalog[id as ConsoleId];
}

export function getRepairService(consoleId: ConsoleId) {
  return repair(consoleCatalog[consoleId].repairSlug);
}

export type ConsoleServiceKind = "game-install" | "repair" | "shop";

export function resolveConsoleServicePath(
  consoleId: ConsoleId,
  kind: ConsoleServiceKind,
): string {
  const config = consoleCatalog[consoleId];
  switch (kind) {
    case "repair":
      return `/repair?console=${consoleId}`;
    case "game-install":
      return `/services/game-install/${config.gameInstallSlugs[0].slug}`;
    case "shop":
      return `/shop/${consoleId}`;
  }
}
