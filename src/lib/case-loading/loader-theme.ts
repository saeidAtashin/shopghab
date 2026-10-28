import { SHOPGHAB_LOGO_COLORS } from "@/lib/case-loading/shopghab-mark";
import { brandSlugFromPathname } from "@/lib/preferred-brand-loader";

export type LoaderTheme = {
  colors: string[];
  glow: string;
};

export const DEFAULT_LOADER_THEME: LoaderTheme = {
  colors: [...SHOPGHAB_LOGO_COLORS],
  glow: SHOPGHAB_LOGO_COLORS[1],
};

const TONE_HEX = {
  cyan: "#22d3ee",
  amber: "#fbbf24",
  emerald: "#34d399",
  rose: "#fb7185",
  violet: "#a78bfa",
  sky: "#38bdf8",
  gold: "#facc15",
  orange: "#fb923c",
  fuchsia: "#e879f9",
} as const;

const CATEGORY_HEX: Record<string, string> = {
  abstract: TONE_HEX.cyan,
  "abstract-minimal": TONE_HEX.cyan,
  general: TONE_HEX.sky,
  religion: TONE_HEX.violet,
  animals: TONE_HEX.amber,
  nature: TONE_HEX.emerald,
  "fantasy-cute": TONE_HEX.fuchsia,
  "anime-manga": TONE_HEX.rose,
  gaming: TONE_HEX.violet,
  "iranian-art": TONE_HEX.gold,
  spiritual: TONE_HEX.violet,
  love: TONE_HEX.rose,
  typography: TONE_HEX.sky,
  luxury: TONE_HEX.gold,
  retro: TONE_HEX.orange,
  street: TONE_HEX.orange,
  "sports-motors": TONE_HEX.sky,
  lifestyle: TONE_HEX.fuchsia,
  "color-pattern": TONE_HEX.rose,
  personalization: TONE_HEX.cyan,
  electronics: TONE_HEX.sky,
  pinterest: TONE_HEX.rose,
  "optical-illusion": TONE_HEX.violet,
  bestsellers: TONE_HEX.amber,
  popular: TONE_HEX.sky,
  "shopghab-exclusive": TONE_HEX.gold,
};

const FILTER_HEX: Record<string, string> = {
  colors: TONE_HEX.rose,
  "visual-styles": TONE_HEX.violet,
  "image-types": TONE_HEX.amber,
  mood: TONE_HEX.rose,
  language: TONE_HEX.sky,
  characteristics: TONE_HEX.emerald,
};

const COLOR_SLUG_HEX: Record<string, string | "split"> = {
  black: "#171717",
  white: "#f4f4f5",
  red: "#ef4444",
  pink: "#ec4899",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  brown: "#92400e",
  gray: "#71717a",
  grey: "#71717a",
  gold: "#d4a017",
  silver: "#cbd5e1",
  multicolor: "split",
  rainbow: "split",
  مشکی: "#171717",
  سفید: "#f4f4f5",
  قرمز: "#ef4444",
  صورتی: "#ec4899",
  آبی: "#3b82f6",
  سبز: "#22c55e",
  زرد: "#eab308",
  نارنجی: "#f97316",
  بنفش: "#a855f7",
  "قهوه‌ای": "#92400e",
  خاکستری: "#71717a",
  طلایی: "#d4a017",
  "نقره‌ای": "#cbd5e1",
  چندرنگ: "split",
};

const BRAND_TINT: Record<string, string> = {
  apple: "#d4d4d8",
  samsung: "#60a5fa",
  xiaomi: "#fb923c",
  huawei: "#f87171",
};

const HEX_RE = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

export function themeFromHref(
  href: string | null | undefined,
  accentHint?: string | null,
): LoaderTheme {
  if (accentHint) {
    const hinted = themeFromAccent(accentHint);
    if (hinted) return hinted;
  }

  if (!href) return DEFAULT_LOADER_THEME;

  try {
    const url = new URL(href, "http://shopghab.local");
    return themeFromLocation(url.pathname, url.searchParams);
  } catch {
    const [path, query = ""] = href.split("?");
    return themeFromLocation(path ?? href, new URLSearchParams(query));
  }
}

export function themeFromLocation(
  pathname: string,
  searchParams?: URLSearchParams,
): LoaderTheme {
  const colorMatch = pathname.match(/^\/designs\/filter\/colors\/([^/]+)\/?$/);
  if (colorMatch?.[1]) {
    return themeFromAccent(decodeURIComponent(colorMatch[1])) ?? DEFAULT_LOADER_THEME;
  }

  const categoryMatch = pathname.match(/^\/designs\/category\/([^/]+)\/?$/);
  if (categoryMatch?.[1]) {
    return tintedTheme(toneHexForCategory(decodeURIComponent(categoryMatch[1])));
  }

  const collectionMatch = pathname.match(/^\/designs\/collection\/([^/]+)\/?$/);
  if (collectionMatch?.[1]) {
    return tintedTheme(toneHexForCategory(decodeURIComponent(collectionMatch[1])));
  }

  const filterMatch = pathname.match(/^\/designs\/filter\/([^/]+)\/([^/]+)\/?$/);
  if (filterMatch?.[1]) {
    return tintedTheme(toneHexForFilter(decodeURIComponent(filterMatch[1])));
  }

  const brand = brandSlugFromPathname(pathname);
  if (brand && BRAND_TINT[brand]) {
    return tintedTheme(BRAND_TINT[brand]);
  }

  const sub = searchParams?.get("sub")?.split(",")[0];
  if (sub) {
    return tintedTheme(toneHexForCategory(sub));
  }

  return DEFAULT_LOADER_THEME;
}

export function themeFromAccent(value: string): LoaderTheme | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "split") {
    return trimmed === "split" ? DEFAULT_LOADER_THEME : null;
  }
  if (HEX_RE.test(trimmed)) {
    return tintedTheme(normalizeHex(trimmed));
  }
  const fromSlug = COLOR_SLUG_HEX[trimmed] ?? COLOR_SLUG_HEX[trimmed.toLowerCase()];
  if (fromSlug === "split") return DEFAULT_LOADER_THEME;
  if (fromSlug) return tintedTheme(fromSlug);
  return null;
}

export function tintedTheme(accent: string): LoaderTheme {
  const base = [...SHOPGHAB_LOGO_COLORS];
  return {
    colors: [
      mixHex(base[0], accent, 0.28),
      accent,
      mixHex(base[2], accent, 0.42),
      mixHex(base[3], accent, 0.32),
      mixHex(base[4], accent, 0.5),
    ],
    glow: accent,
  };
}

function toneHexForCategory(slug: string): string {
  return CATEGORY_HEX[slug] ?? TONE_HEX.cyan;
}

function toneHexForFilter(slug: string): string {
  return FILTER_HEX[slug] ?? TONE_HEX.cyan;
}

function normalizeHex(value: string): string {
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value.toLowerCase();
}

function mixHex(left: string, right: string, amount: number): string {
  const a = parseHex(left);
  const b = parseHex(right);
  const t = Math.min(1, Math.max(0, amount));
  const hex = (channel: number) =>
    Math.round(channel).toString(16).padStart(2, "0");
  return `#${hex(a[0] + (b[0] - a[0]) * t)}${hex(a[1] + (b[1] - a[1]) * t)}${hex(
    a[2] + (b[2] - a[2]) * t,
  )}`;
}

function parseHex(value: string): [number, number, number] {
  const hex = normalizeHex(value).slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}
