import type { ProductCategory, ShopConsole } from "./types";

export const CONSOLE_SEARCH_ALIASES: Record<ShopConsole, string[]> = {
  ps5: [
    "ps5",
    "ps 5",
    "playstation 5",
    "playstation5",
    "پلی استیشن 5",
    "پلی‌استیشن 5",
    "پلیستیشن 5",
  ],
  ps4: [
    "ps4",
    "ps 4",
    "playstation 4",
    "playstation4",
    "پلی استیشن 4",
    "پلی‌استیشن 4",
    "پلیستیشن 4",
  ],
  "xbox-series": [
    "xbox series",
    "xbox series x",
    "xbox series s",
    "series x",
    "series s",
    "xsx",
    "xss",
    "ایکس باکس سریز",
    "ایکس‌باکس سریز",
  ],
  "xbox-one": [
    "xbox one",
    "xbox one s",
    "xbox one x",
    "one s",
    "one x",
    "ایکس باکس وان",
    "ایکس‌باکس وان",
  ],
};

export const CATEGORY_SEARCH_ALIASES: Record<ProductCategory, string[]> = {
  console: ["console", "کنسول", "کنسول بازی", "دستگاه بازی"],
  tools: [
    "tools",
    "tool",
    "controller",
    "دسته",
    "دسته بازی",
    "ابزار",
    "تجهیزات",
    "شارژ",
    "پایه شارژ",
  ],
  accessories: [
    "accessories",
    "accessory",
    "لوازم جانبی",
    "hdmi",
    "کابل",
    "هدست",
    "headset",
    "کیف",
  ],
};

export const POPULAR_SEARCH_QUERIES = [
  "ps5",
  "ps4",
  "xbox series",
  "dualsense",
  "hdmi",
  "دسته بازی",
  "هدست",
  "کنسول دست دوم",
] as const;
