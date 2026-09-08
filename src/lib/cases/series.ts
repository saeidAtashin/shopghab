import type { PhoneModel, PhoneSeries } from "./types";

const SAMSUNG_SERIES: PhoneSeries[] = [
  { slug: "galaxy-s", name: "گلکسی S", nameEn: "Galaxy S", sortOrder: 1 },
  { slug: "galaxy-a", name: "گلکسی A", nameEn: "Galaxy A", sortOrder: 2 },
  { slug: "galaxy-z-fold", name: "گلکسی Z Fold", nameEn: "Galaxy Z Fold", sortOrder: 3 },
  { slug: "galaxy-z-flip", name: "گلکسی Z Flip", nameEn: "Galaxy Z Flip", sortOrder: 4 },
];

const APPLE_SERIES: PhoneSeries[] = [
  { slug: "iphone-17", name: "آیفون ۱۷", nameEn: "iPhone 17", sortOrder: 1 },
  { slug: "iphone-16", name: "آیفون ۱۶", nameEn: "iPhone 16", sortOrder: 2 },
  { slug: "iphone-15", name: "آیفون ۱۵", nameEn: "iPhone 15", sortOrder: 3 },
  { slug: "iphone-14", name: "آیفون ۱۴", nameEn: "iPhone 14", sortOrder: 4 },
  { slug: "iphone-13", name: "آیفون ۱۳", nameEn: "iPhone 13", sortOrder: 5 },
  { slug: "iphone-12", name: "آیفون ۱۲", nameEn: "iPhone 12", sortOrder: 6 },
  { slug: "iphone-11", name: "آیفون ۱۱", nameEn: "iPhone 11", sortOrder: 7 },
  { slug: "iphone-x", name: "آیفون X", nameEn: "iPhone X", sortOrder: 8 },
  { slug: "iphone-se", name: "آیفون SE", nameEn: "iPhone SE", sortOrder: 9 },
];

const XIAOMI_SERIES: PhoneSeries[] = [
  { slug: "xiaomi", name: "شیائومی", nameEn: "Xiaomi", sortOrder: 1 },
  { slug: "redmi-note", name: "ردمی نوت", nameEn: "Redmi Note", sortOrder: 2 },
  { slug: "redmi", name: "ردمی", nameEn: "Redmi", sortOrder: 3 },
  { slug: "poco", name: "POCO", nameEn: "POCO", sortOrder: 4 },
];

const HUAWEI_SERIES: PhoneSeries[] = [
  { slug: "pura", name: "پورا", nameEn: "Pura", sortOrder: 1 },
  { slug: "mate", name: "میت", nameEn: "Mate", sortOrder: 2 },
  { slug: "p-series", name: "سری P", nameEn: "P Series", sortOrder: 3 },
  { slug: "nova", name: "نوا", nameEn: "nova", sortOrder: 4 },
  { slug: "enjoy", name: "انجوی", nameEn: "Enjoy", sortOrder: 5 },
];

const SERIES_BY_BRAND: Record<string, PhoneSeries[]> = {
  samsung: SAMSUNG_SERIES,
  apple: APPLE_SERIES,
  xiaomi: XIAOMI_SERIES,
  huawei: HUAWEI_SERIES,
};

export type SeriesGroup = {
  series: PhoneSeries;
  models: PhoneModel[];
};

export function getSeriesForBrand(brandSlug: string): PhoneSeries[] {
  return SERIES_BY_BRAND[brandSlug] ?? [];
}

export function getSeriesBySlug(brandSlug: string, seriesSlug: string): PhoneSeries | undefined {
  return getSeriesForBrand(brandSlug).find((s) => s.slug === seriesSlug);
}

export function groupModelsBySeries(models: PhoneModel[], brandSlug: string): SeriesGroup[] {
  const seriesList = getSeriesForBrand(brandSlug);
  const bySlug = new Map<string, PhoneModel[]>();

  for (const model of models) {
    const list = bySlug.get(model.seriesSlug) ?? [];
    list.push(model);
    bySlug.set(model.seriesSlug, list);
  }

  return seriesList
    .filter((series) => (bySlug.get(series.slug)?.length ?? 0) > 0)
    .map((series) => ({
      series,
      models: bySlug.get(series.slug) ?? [],
    }));
}

export function getModelsByBrandAndSeries(
  models: PhoneModel[],
  brandSlug: string,
  seriesSlug?: string,
): PhoneModel[] {
  const brandModels = models.filter((m) => m.brandSlug === brandSlug);
  if (!seriesSlug) return brandModels;
  return brandModels.filter((m) => m.seriesSlug === seriesSlug);
}

export function brandSeriesHref(brandSlug: string, seriesSlug: string): string {
  return `/create/${brandSlug}?series=${seriesSlug}`;
}
