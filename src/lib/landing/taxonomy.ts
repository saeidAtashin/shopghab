import {
  descendantCategoryIds,
  isCategoryIndexable,
  isPublicCatalogDesign,
  publishedCountForCategory,
  rootCategories,
} from "@/lib/catalog/logic";
import type { DesignCatalog, DesignRecord } from "@/lib/catalog/schema";
import { selectProductImages } from "@/lib/mockups/display";
import type { LandingSectionKey, LandingSections } from "@/lib/landing/sections";

export type TaxonomyChip = {
  id: string;
  label: string;
  href: string;
};

export type TaxonomyCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
  count: number;
  chips: TaxonomyChip[];
  group?: string;
};

export type LandingTaxonomy = {
  categories: TaxonomyCard[];
  features: TaxonomyCard[];
  featureGroups: TaxonomyCard[];
  collections: TaxonomyCard[];
};

export type LandingBannerSelection = Partial<Record<LandingSectionKey, Record<string, string> | undefined>>;

export type BannerChoice = {
  id: string;
  title: string;
  image: string;
  cardIds: string[];
};

function designThumb(design: DesignRecord): string {
  const images = selectProductImages(design);
  return images.thumb.trim() || images.hero.trim();
}

function usableCover(cover: string): string {
  const trimmed = cover.trim();
  if (trimmed.startsWith("/designed/") && !trimmed.includes("..")) return trimmed;
  return "";
}

function pinnedThumb(
  catalog: DesignCatalog,
  designId: string | undefined,
  belongs: (design: DesignRecord) => boolean,
): string {
  if (!designId) return "";
  const design = catalog.designs.find((item) => item.id === designId);
  if (!design || !isPublicCatalogDesign(design) || !belongs(design)) return "";
  return designThumb(design);
}

export function landingBannerChoices(catalog: DesignCatalog): BannerChoice[] {
  const categoryMembers = new Map(
    rootCategories(catalog)
      .filter((category) => isCategoryIndexable(catalog, category))
      .map((category) => [category.id, descendantCategoryIds(catalog, category.id)] as const),
  );
  const valueIds = new Set(catalog.attributeValues.map((value) => value.id));
  const collectionIds = new Set(
    catalog.collections.filter((collection) => collection.status === "active").map((collection) => collection.id),
  );
  const choices: BannerChoice[] = [];

  for (const design of catalog.designs) {
    if (!isPublicCatalogDesign(design)) continue;
    const image = designThumb(design);
    if (!image) continue;
    const cardIds: string[] = [];
    for (const [categoryId, members] of categoryMembers) {
      if (design.categoryIds.some((id) => members.has(id))) cardIds.push(categoryId);
    }
    for (const id of design.attributeValueIds) {
      if (valueIds.has(id)) cardIds.push(id);
    }
    for (const id of design.collectionIds) {
      if (collectionIds.has(id)) cardIds.push(id);
    }
    if (cardIds.length === 0) continue;
    choices.push({ id: design.id, title: design.title, image, cardIds });
  }

  choices.sort((a, b) => a.title.localeCompare(b.title, "fa"));
  return choices;
}

export function sanitizeLandingBanners(catalog: DesignCatalog, sections: LandingSections): LandingSections {
  const members = new Map<string, Set<string>>();
  for (const choice of landingBannerChoices(catalog)) {
    for (const cardId of choice.cardIds) {
      const allowed = members.get(cardId) ?? new Set<string>();
      allowed.add(choice.id);
      members.set(cardId, allowed);
    }
  }
  const cards = landingTaxonomy(catalog);
  const next: LandingSections = {
    categories: { ...sections.categories },
    features: { ...sections.features },
    collections: { ...sections.collections },
  };

  for (const key of ["categories", "features", "collections"] as const) {
    const banners = next[key].banners;
    if (!banners) continue;
    const allowedCards = new Set(cards[key].map((card) => card.id));
    const cleaned: Record<string, string> = {};
    for (const [cardId, designId] of Object.entries(banners)) {
      if (!allowedCards.has(cardId) || !members.get(cardId)?.has(designId)) continue;
      cleaned[cardId] = designId;
    }
    if (Object.keys(cleaned).length > 0) next[key].banners = cleaned;
    else delete next[key].banners;
  }

  return next;
}

export function landingTaxonomy(
  catalog: DesignCatalog,
  banners: LandingBannerSelection = {},
  options: { publicOnly?: boolean } = {},
): LandingTaxonomy {
  const publicOnly = options.publicOnly === true;
  const published = catalog.designs.filter(isPublicCatalogDesign);
  const categoryThumb = new Map<string, string>();
  const collectionThumb = new Map<string, string>();
  const valueThumb = new Map<string, string>();

  for (const design of published) {
    const thumb = designThumb(design);
    if (!thumb) continue;
    for (const id of design.categoryIds) {
      if (!categoryThumb.has(id)) categoryThumb.set(id, thumb);
    }
    for (const id of design.collectionIds) {
      if (!collectionThumb.has(id)) collectionThumb.set(id, thumb);
    }
    for (const id of design.attributeValueIds) {
      if (!valueThumb.has(id)) valueThumb.set(id, thumb);
    }
  }

  const categories = rootCategories(catalog)
    .filter((category) => isCategoryIndexable(catalog, category))
    .map((category) => {
      const ids = descendantCategoryIds(catalog, category.id);
      let image = pinnedThumb(catalog, banners.categories?.[category.id], (design) =>
        design.categoryIds.some((id) => ids.has(id)),
      );
      if (!image) image = usableCover(category.coverImage);
      if (!image) {
        for (const id of ids) {
          const thumb = categoryThumb.get(id);
          if (thumb) {
            image = thumb;
            break;
          }
        }
      }
      return {
        id: category.id,
        title: category.name,
        description: category.description.trim(),
        href: `/designs/category/${category.slug}`,
        image,
        count: publishedCountForCategory(catalog, category.id),
        chips: [],
      };
    });

  const features: TaxonomyCard[] = [];
  const featureGroups = [...catalog.attributeGroups]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fa"))
    .map((group) => {
      const values = catalog.attributeValues
        .filter((value) => value.groupId === group.id)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fa"));
      if (values.length === 0) return null;
      const valueIds = new Set(values.map((value) => value.id));
      const countFor = (valueId: string) =>
        published.filter((design) => design.attributeValueIds.includes(valueId)).length;
      const visibleValues = publicOnly ? values.filter((value) => countFor(value.id) > 0) : values;
      let image = "";
      for (const value of visibleValues) {
        const thumb = valueThumb.get(value.id) ?? "";
        if (!image && thumb) image = thumb;
        features.push({
          id: value.id,
          title: value.name,
          description: group.name,
          href: `/designs/filter/${group.slug}/${value.slug}`,
          image:
            pinnedThumb(catalog, banners.features?.[value.id], (design) =>
              design.attributeValueIds.includes(value.id),
            ) || thumb,
          count: countFor(value.id),
          chips: [],
          group: group.name,
        });
      }
      const count = published.filter((design) =>
        design.attributeValueIds.some((id) => valueIds.has(id)),
      ).length;
      if (publicOnly && count === 0) return null;
      return {
        id: group.id,
        title: group.name,
        description: "",
        href: "/designs",
        image,
        count,
        chips: visibleValues.map((value) => ({
          id: value.id,
          label: value.name,
          href: `/designs/filter/${group.slug}/${value.slug}`,
        })),
      };
    })
    .filter((card): card is TaxonomyCard => card !== null);

  const collections = [...catalog.collections]
    .filter((collection) => collection.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fa"))
    .map((collection) => ({
      id: collection.id,
      title: collection.name,
      description: collection.description.trim(),
      href: `/designs/collection/${collection.slug}`,
      image:
        pinnedThumb(catalog, banners.collections?.[collection.id], (design) =>
          design.collectionIds.includes(collection.id),
        ) ||
        usableCover(collection.coverImage) ||
        collectionThumb.get(collection.id) ||
        "",
      count: published.filter((design) => design.collectionIds.includes(collection.id)).length,
      chips: [],
    }));

  return {
    categories: publicOnly ? categories.filter((card) => card.count > 0) : categories,
    features,
    featureGroups,
    collections: publicOnly ? collections.filter((card) => card.count > 0) : collections,
  };
}
