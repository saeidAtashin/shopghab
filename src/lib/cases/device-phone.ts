import { getModelBySlug, PHONE_MODELS } from "./brands.static";
import { normalizeSearchQuery } from "@/lib/search/normalize";

export const SELECTED_PHONE_STORAGE_KEY = "shopghab-selected-phone";

export type PhonePick = {
  brandSlug: string;
  modelSlug: string;
};

export type DeviceSignals = {
  userAgent: string;
  modelName?: string | null;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
};

const MODEL_QUALIFIER = /[a-z0-9+]/i;

/** Longest prefix wins. Regional suffixes such as SM-S928B still match. */
const SAMSUNG_CODE_PREFIXES: { prefix: string; slug: string }[] = [
  { prefix: "SM-S938", slug: "galaxy-s25-ultra" },
  { prefix: "SM-S936", slug: "galaxy-s25-plus" },
  { prefix: "SM-S931", slug: "galaxy-s25" },
  { prefix: "SM-S731", slug: "galaxy-s25-fe" },
  { prefix: "SM-S928", slug: "galaxy-s24-ultra" },
  { prefix: "SM-S926", slug: "galaxy-s24-plus" },
  { prefix: "SM-S921", slug: "galaxy-s24" },
  { prefix: "SM-S721", slug: "galaxy-s24-fe" },
  { prefix: "SM-S918", slug: "galaxy-s23-ultra" },
  { prefix: "SM-S916", slug: "galaxy-s23-plus" },
  { prefix: "SM-S911", slug: "galaxy-s23" },
  { prefix: "SM-S711", slug: "galaxy-s23-fe" },
  { prefix: "SM-S908", slug: "galaxy-s22-ultra" },
  { prefix: "SM-S906", slug: "galaxy-s22-plus" },
  { prefix: "SM-S901", slug: "galaxy-s22" },
  { prefix: "SM-G998", slug: "galaxy-s21-ultra" },
  { prefix: "SM-G996", slug: "galaxy-s21-plus" },
  { prefix: "SM-G991", slug: "galaxy-s21" },
  { prefix: "SM-G990", slug: "galaxy-s21-fe" },
  { prefix: "SM-A566", slug: "galaxy-a56" },
  { prefix: "SM-A556", slug: "galaxy-a55" },
  { prefix: "SM-A546", slug: "galaxy-a54" },
  { prefix: "SM-A536", slug: "galaxy-a53" },
  { prefix: "SM-A366", slug: "galaxy-a36" },
  { prefix: "SM-A356", slug: "galaxy-a35" },
  { prefix: "SM-A346", slug: "galaxy-a34" },
  { prefix: "SM-A336", slug: "galaxy-a33" },
  { prefix: "SM-A266", slug: "galaxy-a26" },
  { prefix: "SM-A256", slug: "galaxy-a25" },
  { prefix: "SM-A166", slug: "galaxy-a16" },
  { prefix: "SM-A156", slug: "galaxy-a15" },
  { prefix: "SM-F966", slug: "galaxy-z-fold-7" },
  { prefix: "SM-F956", slug: "galaxy-z-fold-6" },
  { prefix: "SM-F946", slug: "galaxy-z-fold-5" },
  { prefix: "SM-F936", slug: "galaxy-z-fold-4" },
  { prefix: "SM-F926", slug: "galaxy-z-fold-3" },
  { prefix: "SM-F766", slug: "galaxy-z-flip-7" },
  { prefix: "SM-F741", slug: "galaxy-z-flip-6" },
  { prefix: "SM-F731", slug: "galaxy-z-flip-5" },
  { prefix: "SM-F721", slug: "galaxy-z-flip-4" },
  { prefix: "SM-F711", slug: "galaxy-z-flip-3" },
];

/**
 * Portrait CSS pixels. Shared sizes point at the newest catalog model.
 * iPhone user agents do not include the model name.
 */
const IPHONE_SCREEN_BUCKETS: {
  width: number;
  height: number;
  dpr: number;
  slug: string;
}[] = [
  { width: 440, height: 956, dpr: 3, slug: "iphone-17-pro-max" },
  { width: 402, height: 874, dpr: 3, slug: "iphone-17-pro" },
  { width: 430, height: 932, dpr: 3, slug: "iphone-16-plus" },
  { width: 393, height: 852, dpr: 3, slug: "iphone-16" },
  { width: 428, height: 926, dpr: 3, slug: "iphone-14-plus" },
  { width: 390, height: 844, dpr: 3, slug: "iphone-14" },
  { width: 375, height: 812, dpr: 3, slug: "iphone-13-mini" },
  { width: 414, height: 896, dpr: 3, slug: "iphone-11-pro-max" },
  { width: 414, height: 896, dpr: 2, slug: "iphone-11" },
  { width: 375, height: 667, dpr: 2, slug: "iphone-se-3" },
];

const NAME_MATCHES = PHONE_MODELS
  .filter((model) => model.brandSlug !== "other")
  .map((model) => ({
    brandSlug: model.brandSlug,
    modelSlug: model.slug,
    token: normalizeModelText(model.nameEn),
  }))
  .filter((item) => item.token.length >= 3)
  .sort((a, b) => b.token.length - a.token.length);

function normalizeModelText(value: string): string {
  return normalizeSearchQuery(value)
    .replace(/\+/g, " plus ")
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function phraseInText(haystack: string, phrase: string): boolean {
  let from = 0;
  while (from <= haystack.length - phrase.length) {
    const index = haystack.indexOf(phrase, from);
    if (index < 0) return false;
    const before = index === 0 ? "" : haystack[index - 1];
    const after = haystack[index + phrase.length] ?? "";
    const beforeOk = before === "" || !MODEL_QUALIFIER.test(before);
    const afterOk = after === "" || !MODEL_QUALIFIER.test(after);
    if (beforeOk && afterOk) return true;
    from = index + 1;
  }
  return false;
}

function pick(brandSlug: string, modelSlug: string): PhonePick | null {
  if (!getModelBySlug(brandSlug, modelSlug)) return null;
  return { brandSlug, modelSlug };
}

function matchSamsungCode(text: string): PhonePick | null {
  const code = text.toUpperCase().match(/SM-[A-Z]\d{3,4}/)?.[0];
  if (!code) return null;
  const hit = SAMSUNG_CODE_PREFIXES.find((item) => code.startsWith(item.prefix));
  if (!hit) return null;
  return pick("samsung", hit.slug);
}

function matchCatalogName(text: string): PhonePick | null {
  const haystack = normalizeModelText(text);
  if (!haystack) return null;
  const hit = NAME_MATCHES.find((item) => phraseInText(haystack, item.token));
  if (!hit) return null;
  return pick(hit.brandSlug, hit.modelSlug);
}

function portraitScreen(width: number, height: number): { width: number; height: number } {
  if (width <= height) return { width, height };
  return { width: height, height: width };
}

function matchIphoneScreen(signals: DeviceSignals): PhonePick | null {
  if (!/iPhone|iPod/i.test(signals.userAgent)) return null;
  const screen = portraitScreen(signals.screenWidth, signals.screenHeight);
  const hit = IPHONE_SCREEN_BUCKETS.find(
    (bucket) =>
      Math.abs(screen.width - bucket.width) <= 2 &&
      Math.abs(screen.height - bucket.height) <= 2 &&
      Math.abs(signals.devicePixelRatio - bucket.dpr) < 0.35,
  );
  if (!hit) return null;
  return pick("apple", hit.slug);
}

export function matchPhoneFromDevice(signals: DeviceSignals): PhonePick | null {
  const labeled = [signals.modelName, signals.userAgent].filter(Boolean).join(" ");
  return matchSamsungCode(labeled) ?? matchCatalogName(labeled) ?? matchIphoneScreen(signals);
}

export function isPhoneVisitor(userAgent: string, viewportWidth: number): boolean {
  if (viewportWidth > 0 && viewportWidth < 768) return true;
  if (/iPhone|iPod/i.test(userAgent)) return true;
  return /Android/i.test(userAgent) && /Mobile/i.test(userAgent);
}

export function parseRememberedPhone(raw: string | null): PhonePick | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PhonePick>;
    if (!parsed.brandSlug || !parsed.modelSlug) return null;
    return pick(parsed.brandSlug, parsed.modelSlug);
  } catch {
    return null;
  }
}

export function resolveSuggestedPhone(options: {
  isPhone: boolean;
  remembered: PhonePick | null;
  detected: PhonePick | null;
}): PhonePick | null {
  if (!options.isPhone) return null;
  return options.remembered ?? options.detected;
}

export function readRememberedPhone(): PhonePick | null {
  if (typeof window === "undefined") return null;
  try {
    return parseRememberedPhone(window.localStorage.getItem(SELECTED_PHONE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function rememberSelectedPhone(pick: PhonePick): void {
  if (typeof window === "undefined") return;
  if (!getModelBySlug(pick.brandSlug, pick.modelSlug)) return;
  window.localStorage.setItem(
    SELECTED_PHONE_STORAGE_KEY,
    JSON.stringify({ brandSlug: pick.brandSlug, modelSlug: pick.modelSlug }),
  );
}
