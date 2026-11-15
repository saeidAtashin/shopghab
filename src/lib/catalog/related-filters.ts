import type {
  AttributeGroupRecord,
  AttributeValueRecord,
  CategoryRecord,
  DesignCatalog,
} from "./schema";

/** Attribute value refs as `groupSlug:valueSlug`. */
export type AttributeRef = `${string}:${string}`;

export type RelatedSuggestion = {
  id: string;
  label: string;
  groupSlug: string;
  valueSlug: string;
  groupLabel: string;
};

type RelatedRule = {
  /** Category slugs that trigger suggestions (including descendants matched by slug). */
  categorySlugs?: string[];
  /** Attribute value refs (`group:value`) that trigger suggestions. */
  attributeRefs?: AttributeRef[];
  /** Suggested attribute value refs to offer as Guided one-tap chips. */
  suggest: AttributeRef[];
};

/**
 * Guided related filters: when a style/category is active, suggest related facets.
 * Never auto-applied — callers render optional one-tap chips.
 */
export const RELATED_FILTER_RULES: RelatedRule[] = [
  {
    categorySlugs: [
      "typography",
      "persian-type",
      "english-type",
      "quotes",
      "motivational",
      "humor-memes",
      "sarcasm",
      "single-words",
      "letters-alphabet",
      "numbers-dates",
      "handwritten",
      "retro-fonts",
      "initials",
    ],
    attributeRefs: ["visual-styles:typography", "image-types:typography", "characteristics:text"],
    suggest: [
      "visual-styles:typography",
      "image-types:typography",
      "characteristics:text",
      "language:fa",
      "language:en",
      "language:none",
    ],
  },
  {
    categorySlugs: [
      "retro",
      "seventies",
      "retro-pop",
      "y2k",
      "vintage-poster",
      "retro-fonts",
      "anime-retro",
      "retro-gaming",
    ],
    attributeRefs: ["visual-styles:retro", "visual-styles:vintage"],
    suggest: [
      "visual-styles:retro",
      "visual-styles:vintage",
      "mood:nostalgic",
      "image-types:illustration",
      "characteristics:busy",
    ],
  },
  {
    attributeRefs: ["colors:single-color", "characteristics:mono"],
    suggest: ["colors:single-color", "characteristics:mono", "colors:black", "colors:white", "visual-styles:minimal"],
  },
  {
    attributeRefs: ["colors:duo"],
    suggest: ["colors:duo", "colors:black", "colors:white", "colors:gold"],
  },
  {
    attributeRefs: ["language:fa", "language:en", "language:multi"],
    suggest: ["characteristics:text", "image-types:typography", "visual-styles:typography", "language:none"],
  },
];

const COLOR_MODE_SLUGS = new Set(["single-color", "duo", "multicolor"]);

export function isColorModeSlug(slug: string): boolean {
  return COLOR_MODE_SLUGS.has(slug);
}

function parseRef(ref: AttributeRef): { groupSlug: string; valueSlug: string } {
  const sep = ref.indexOf(":");
  return { groupSlug: ref.slice(0, sep), valueSlug: ref.slice(sep + 1) };
}

function valueByRef(
  catalog: DesignCatalog,
  ref: AttributeRef,
): { group: AttributeGroupRecord; value: AttributeValueRecord } | undefined {
  const { groupSlug, valueSlug } = parseRef(ref);
  const group = catalog.attributeGroups.find((item) => item.slug === groupSlug);
  if (!group) return undefined;
  const value = catalog.attributeValues.find(
    (item) => item.groupId === group.id && item.slug === valueSlug,
  );
  if (!value) return undefined;
  return { group, value };
}

function activeCategorySlugs(
  catalog: DesignCatalog,
  categoryIds: string[],
  categorySlugs: string[],
): Set<string> {
  const slugs = new Set<string>(categorySlugs);
  const byId = new Map(catalog.categories.map((category) => [category.id, category]));
  for (const id of categoryIds) {
    let current: CategoryRecord | undefined = byId.get(id);
    while (current) {
      slugs.add(current.slug);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
  }
  return slugs;
}

function activeAttributeRefs(catalog: DesignCatalog, attributeValueIds: string[]): Set<AttributeRef> {
  const refs = new Set<AttributeRef>();
  const groupById = new Map(catalog.attributeGroups.map((group) => [group.id, group]));
  for (const id of attributeValueIds) {
    const value = catalog.attributeValues.find((item) => item.id === id);
    if (!value) continue;
    const group = groupById.get(value.groupId);
    if (!group) continue;
    refs.add(`${group.slug}:${value.slug}` as AttributeRef);
  }
  return refs;
}

export type RelatedFilterInput = {
  catalog: DesignCatalog;
  /** Selected category IDs (admin) or active browse category chain. */
  categoryIds?: string[];
  /** Active category slugs from the URL (browse). */
  categorySlugs?: string[];
  attributeValueIds: string[];
  /** When set, only suggest IDs present in this set (scope availability). */
  availableValueIds?: ReadonlySet<string>;
};

/**
 * Returns Guided suggestions that are not already selected.
 * Dedupe by value id; preserve rule order then suggest order.
 */
export function relatedFilterSuggestions(input: RelatedFilterInput): RelatedSuggestion[] {
  const cats = activeCategorySlugs(input.catalog, input.categoryIds ?? [], input.categorySlugs ?? []);
  const attrs = activeAttributeRefs(input.catalog, input.attributeValueIds);
  const selectedIds = new Set(input.attributeValueIds);
  const seen = new Set<string>();
  const out: RelatedSuggestion[] = [];

  for (const rule of RELATED_FILTER_RULES) {
    const categoryHit = rule.categorySlugs?.some((slug) => cats.has(slug)) ?? false;
    const attributeHit = rule.attributeRefs?.some((ref) => attrs.has(ref)) ?? false;
    if (!categoryHit && !attributeHit) continue;

    for (const ref of rule.suggest) {
      if (attrs.has(ref)) continue;
      const matched = valueByRef(input.catalog, ref);
      if (!matched) continue;
      if (selectedIds.has(matched.value.id)) continue;
      if (input.availableValueIds && !input.availableValueIds.has(matched.value.id)) continue;
      if (seen.has(matched.value.id)) continue;
      seen.add(matched.value.id);
      out.push({
        id: matched.value.id,
        label: matched.value.name,
        groupSlug: matched.group.slug,
        valueSlug: matched.value.slug,
        groupLabel: matched.group.name,
      });
    }
  }

  return out;
}
