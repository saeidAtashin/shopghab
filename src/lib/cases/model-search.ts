import { normalizeSearchQuery, tokenizeSearchQuery } from "@/lib/search/normalize";
import { getBrandBySlug, PHONE_MODELS } from "./brands.static";
import { BRAND_SEARCH_ALIASES } from "./model-search-aliases";
import { getSeriesBySlug } from "./series";
import type { PhoneBrand, PhoneModel } from "./types";

export type ModelSearchResult = {
  model: PhoneModel;
  brand: PhoneBrand;
  seriesName?: string;
  score: number;
  matchedText: string;
};

const STRONG_MATCH_THRESHOLD = 400;

function getModelSearchCorpus(model: PhoneModel): string[] {
  const brand = getBrandBySlug(model.brandSlug);
  const series = getSeriesBySlug(model.brandSlug, model.seriesSlug);
  const slugSpaced = model.slug.replace(/-/g, " ");

  return [
    model.name,
    model.nameEn,
    model.slug,
    slugSpaced,
    brand?.name ?? "",
    brand?.nameEn ?? "",
    brand?.slug ?? "",
    series?.name ?? "",
    series?.nameEn ?? "",
    ...(brand ? (BRAND_SEARCH_ALIASES[brand.slug] ?? []) : []),
  ]
    .map(normalizeSearchQuery)
    .filter(Boolean);
}

function scoreModel(model: PhoneModel, query: string): ModelSearchResult | null {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return null;

  const brand = getBrandBySlug(model.brandSlug);
  if (!brand) return null;

  const series = getSeriesBySlug(model.brandSlug, model.seriesSlug);
  const title = normalizeSearchQuery(model.name);
  const titleEn = normalizeSearchQuery(model.nameEn);
  const slug = normalizeSearchQuery(model.slug);
  const corpus = getModelSearchCorpus(model);
  const corpusText = corpus.join(" ");

  let score = 0;
  let matchedText = model.name;

  if (title === normalizedQuery || titleEn === normalizedQuery) {
    score = 1000;
  } else if (title.startsWith(normalizedQuery) || titleEn.startsWith(normalizedQuery)) {
    score = 900;
  } else if (title.includes(normalizedQuery) || titleEn.includes(normalizedQuery)) {
    score = 800;
  } else if (slug.includes(normalizedQuery) || slug.replace(/-/g, " ").includes(normalizedQuery)) {
    score = 700;
    matchedText = model.nameEn;
  } else if (corpus.some((entry) => entry.includes(normalizedQuery))) {
    score = 600;
    matchedText = corpus.find((entry) => entry.includes(normalizedQuery)) ?? model.name;
  } else {
    const tokens = tokenizeSearchQuery(normalizedQuery);
    const allTokensMatch = tokens.every((token) => corpusText.includes(token));
    if (!allTokensMatch) return null;
    score = 400 + tokens.length * 10;
    matchedText = tokens.join(" ");
  }

  return {
    model,
    brand,
    seriesName: series?.name,
    score,
    matchedText,
  };
}

export function searchPhoneModels(
  query: string,
  options: { brandSlug?: string; limit?: number } = {},
): ModelSearchResult[] {
  const limit = options.limit ?? 8;
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  const pool = options.brandSlug
    ? PHONE_MODELS.filter((m) => m.brandSlug === options.brandSlug)
    : PHONE_MODELS.filter((m) => m.brandSlug !== "other");

  return pool
    .map((model) => scoreModel(model, normalizedQuery))
    .filter((result): result is ModelSearchResult => result !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.model.name.localeCompare(b.model.name, "fa");
    })
    .slice(0, limit);
}

export function hasStrongModelMatch(
  query: string,
  options: { brandSlug?: string } = {},
): boolean {
  const results = searchPhoneModels(query, { ...options, limit: 1 });
  return results.length > 0 && results[0].score >= STRONG_MATCH_THRESHOLD;
}

export function getStrongMatchThreshold(): number {
  return STRONG_MATCH_THRESHOLD;
}
