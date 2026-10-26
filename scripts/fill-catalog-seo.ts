import { mutateCatalog } from "../src/lib/catalog/store";
import {
  isWeakDesignAlt,
  suggestedCategorySeoDescription,
  suggestedCategorySeoTitle,
  suggestedCollectionSeoDescription,
  suggestedCollectionSeoTitle,
  suggestedDesignAlt,
  suggestedDesignSeoDescription,
  suggestedDesignSeoTitle,
} from "../src/lib/catalog/seo-copy";

async function main(): Promise<void> {
  const now = new Date().toISOString();
  const refreshAt = process.env.CATALOG_SEO_REFRESH_AT?.trim();
  const canReplace = (value: string, updatedAt: string) =>
    !value.trim() || (Boolean(refreshAt) && updatedAt === refreshAt);
  const filled = await mutateCatalog((catalog) => {
    const categoriesById = new Map(catalog.categories.map((category) => [category.id, category]));
    let designs = 0;
    let categories = 0;
    let collections = 0;
    let alts = 0;

    for (const category of catalog.categories) {
      let changed = false;
      if (canReplace(category.seoTitle, category.updatedAt)) {
        category.seoTitle = suggestedCategorySeoTitle(category.name);
        changed = true;
      }
      if (canReplace(category.seoDescription, category.updatedAt)) {
        const parentName = category.parentId
          ? categoriesById.get(category.parentId)?.name
          : undefined;
        category.seoDescription = suggestedCategorySeoDescription(category.name, category.slug, parentName);
        changed = true;
      }
      if (changed) {
        category.updatedAt = now;
        categories += 1;
      }
    }

    for (const collection of catalog.collections) {
      let changed = false;
      if (canReplace(collection.seoTitle, collection.updatedAt)) {
        collection.seoTitle = suggestedCollectionSeoTitle(collection.name, collection.slug);
        changed = true;
      }
      if (canReplace(collection.seoDescription, collection.updatedAt)) {
        collection.seoDescription = suggestedCollectionSeoDescription(collection.name, collection.slug);
        changed = true;
      }
      if (changed) {
        collection.updatedAt = now;
        collections += 1;
      }
    }

    for (const design of catalog.designs) {
      let changed = false;
      const categoryName = design.categoryIds
        .map((id) => categoriesById.get(id)?.name)
        .find((name) => Boolean(name));
      if (canReplace(design.seoTitle, design.updatedAt)) {
        design.seoTitle = suggestedDesignSeoTitle(design.title);
        changed = true;
      }
      if (canReplace(design.seoDescription, design.updatedAt)) {
        design.seoDescription = suggestedDesignSeoDescription({
          title: design.title,
          slug: design.slug,
          categoryName,
          tags: design.tags,
        });
        changed = true;
      }
      if (isWeakDesignAlt(design.alt, design.title) || (refreshAt && design.updatedAt === refreshAt && design.alt.startsWith("طرح قاب موبایل "))) {
        design.alt = suggestedDesignAlt(design.title);
        alts += 1;
        changed = true;
      }
      if (changed) {
        design.updatedAt = now;
        designs += 1;
      }
    }

    const descriptions = [
      ...catalog.designs.map((design) => design.seoDescription),
      ...catalog.categories.map((category) => category.seoDescription),
      ...catalog.collections.map((collection) => collection.seoDescription),
    ];
    const outOfRange = descriptions.filter((text) => text.length < 140 || text.length > 160);
    if (outOfRange.length > 0) {
      throw new Error(
        `${outOfRange.length} SEO descriptions are outside 140–160 characters. First: ${outOfRange[0]}`,
      );
    }

    return {
      catalog,
      result: { designs, categories, collections, alts },
    };
  });

  console.log(
    `Filled SEO for ${filled.designs} designs (${filled.alts} alt texts), ${filled.categories} categories, ${filled.collections} collections.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
