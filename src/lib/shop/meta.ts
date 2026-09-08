import type { Brand } from "@/lib/brand-theme";
import { GAME_INSTALL_CONSOLE_META } from "@/lib/game-install-meta";
import type { ShopConsole } from "./types";

export type ShopConsoleMeta = {
  slug: ShopConsole;
  label: string;
  subtitle: string;
  iconSrc: string;
  brand: Brand;
};

export const SHOP_CONSOLE_META: Record<ShopConsole, ShopConsoleMeta> = {
  ps5: {
    slug: "ps5",
    label: GAME_INSTALL_CONSOLE_META.ps5.label,
    subtitle: "PlayStation 5",
    iconSrc: "/icons/ps5.svg",
    brand: "playstation",
  },
  ps4: {
    slug: "ps4",
    label: GAME_INSTALL_CONSOLE_META.ps4.label,
    subtitle: "PlayStation 4",
    iconSrc: "/icons/ps4.svg",
    brand: "playstation",
  },
  "xbox-series": {
    slug: "xbox-series",
    label: GAME_INSTALL_CONSOLE_META["xbox-series"].label,
    subtitle: "Xbox Series X|S",
    iconSrc: "/icons/xbox.svg",
    brand: "xbox",
  },
  "xbox-one": {
    slug: "xbox-one",
    label: GAME_INSTALL_CONSOLE_META["xbox-one"].label,
    subtitle: "Xbox One",
    iconSrc: "/icons/xbox.svg",
    brand: "xbox",
  },
};

export const SHOP_CONSOLE_ORDER: ShopConsole[] = [
  "ps5",
  "ps4",
  "xbox-series",
  "xbox-one",
];
