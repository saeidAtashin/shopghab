import type { ConsoleId } from "@/lib/console-catalog";
import { consoleIdFromIssueSlug } from "@/lib/repair-links";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/site";
import type { ShopConsole, ShopProduct } from "@/lib/shop/types";

export type QuickAccessServiceKind = "game-install" | "repair" | "shop";

const CONSOLE_ICON: Record<ConsoleId, string> = {
  ps4: "/icons/ps4.svg",
  ps5: "/icons/ps5.svg",
  xbox: "/icons/xbox.svg",
};

export const quickAccessImages: Record<
  ConsoleId,
  Record<QuickAccessServiceKind, string>
> = {
  ps4: {
    "game-install": CONSOLE_ICON.ps4,
    repair: CONSOLE_ICON.ps4,
    shop: CONSOLE_ICON.ps4,
  },
  ps5: {
    "game-install": CONSOLE_ICON.ps5,
    repair: CONSOLE_ICON.ps5,
    shop: CONSOLE_ICON.ps5,
  },
  xbox: {
    "game-install": CONSOLE_ICON.xbox,
    repair: CONSOLE_ICON.xbox,
    shop: CONSOLE_ICON.xbox,
  },
};

const DEFAULT_ISSUE_IMAGE = DEFAULT_OG_IMAGE;

export function shopConsoleToConsoleId(console: ShopConsole): ConsoleId {
  if (console === "ps4" || console === "ps5") return console;
  return "xbox";
}

export function getShopProductImage(product: ShopProduct): string {
  return quickAccessImages[shopConsoleToConsoleId(product.console)].shop;
}

export function getGameInstallImage(consoleSlug: string): string | undefined {
  if (consoleSlug === "ps4" || consoleSlug === "ps5") {
    return quickAccessImages[consoleSlug]["game-install"];
  }
  if (consoleSlug === "xbox-one" || consoleSlug === "xbox-series") {
    return quickAccessImages.xbox["game-install"];
  }
  return undefined;
}

export function getIssueImage(slug: string, explicitImage?: string): string {
  if (explicitImage) return explicitImage;

  const consoleId = consoleIdFromIssueSlug(slug);
  if (consoleId) {
    return quickAccessImages[consoleId].repair;
  }

  return DEFAULT_ISSUE_IMAGE;
}
