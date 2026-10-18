import {
  descendantCategoryIds,
  designHasImage,
  isCategoryIndexable,
  isPublishedDesign,
  publishedCountForCategory,
  rootCategories,
} from "@/lib/catalog/logic";
import type { DesignCatalog, DesignRecord } from "@/lib/catalog/schema";
import { selectProductImages } from "@/lib/mockups/display";

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

function designThumb(design: DesignRecord): string {
  const images = selectProductImages(design);
  return images.thumb.trim() || images.hero.trim();
}

function usableCover(cover: string): string {
  const trimmed = cover.trim();
  if (trimmed.startsWith("/designed/") && !trimmed.includes("..")) return trimmed;
  return "";
}

export function landingTaxonomy(catalog: DesignCatalog): LandingTaxonomy {
  const published = catalog.designs.filter(isPublishedDesign);
  const categoryThumb = new Map<string, string>();
  const collectionThumb = new Map<string, string>();
  const valueThumb = new Map<string, string>();

  for (const design of published) {
    if (!designHasImage(design)) continue;
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
      let image = usableCover(category.coverImage);
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
      let image = "";
      for (const value of values) {
        const thumb = valueThumb.get(value.id) ?? "";
        if (!image && thumb) image = thumb;
        features.push({
          id: value.id,
          title: value.name,
          description: group.name,
          href: `/designs?attr=${encodeURIComponent(value.id)}`,
          image: thumb,
          count: published.filter((design) => design.attributeValueIds.includes(value.id)).length,
          chips: [],
          group: group.name,
        });
      }
      const count = published.filter((design) =>
        design.attributeValueIds.some((id) => valueIds.has(id)),
      ).length;
      return {
        id: group.id,
        title: group.name,
        description: "",
        href: "/designs",
        image,
        count,
        chips: values.map((value) => ({
          id: value.id,
          label: value.name,
          href: `/designs?attr=${encodeURIComponent(value.id)}`,
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
      image: usableCover(collection.coverImage) || collectionThumb.get(collection.id) || "",
      count: published.filter(
        (design) => designHasImage(design) && design.collectionIds.includes(collection.id),
      ).length,
      chips: [],
    }));

  return { categories, features, featureGroups, collections };
}
