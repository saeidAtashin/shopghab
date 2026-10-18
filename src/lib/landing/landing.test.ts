import assert from "node:assert/strict";
import test from "node:test";

import {
  createAttribute,
  createCategory,
  createCollection,
  createDesign,
  emptyCatalog,
  parsePublicListingQuery,
  queryPublicDesigns,
  updateCategory,
} from "../catalog/logic";
import type { CategoryWriteInput, DesignWriteInput } from "../catalog/schema";
import { DEFAULT_LANDING_SECTIONS, parseLandingSections, selectLandingItems } from "./sections";
import { landingBannerChoices, landingTaxonomy, sanitizeLandingBanners } from "./taxonomy";

const NOW = "2026-01-01T00:00:00.000Z";

function categoryInput(name: string, slug: string): CategoryWriteInput {
  return {
    name,
    slug,
    parentId: null,
    description: `توضیح ${name}`,
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  };
}

test("landing section defaults survive invalid files", () => {
  const first = parseLandingSections(undefined);
  first.categories.visible = false;
  assert.equal(parseLandingSections({ categories: { visible: true, style: "nope" } }).categories.style, "bento");
  assert.deepEqual(parseLandingSections(DEFAULT_LANDING_SECTIONS), DEFAULT_LANDING_SECTIONS);
  assert.equal(parseLandingSections(undefined).categories.visible, true);
  assert.equal(parseLandingSections(undefined).features.itemIds, undefined);
  assert.deepEqual(
    parseLandingSections({
      ...DEFAULT_LANDING_SECTIONS,
      features: { visible: true, style: "glass", itemIds: ["val_red", "missing"] },
    }).features.itemIds,
    ["val_red", "missing"],
  );
  assert.deepEqual(
    parseLandingSections({
      ...DEFAULT_LANDING_SECTIONS,
      categories: {
        visible: true,
        style: "bento",
        banners: { cat_nature: "dsn_anar", ["x".repeat(81)]: "dsn_bad", cat_bad: 4 },
      },
    }).categories.banners,
    { cat_nature: "dsn_anar" },
  );
  const dropped = parseLandingSections({
    ...DEFAULT_LANDING_SECTIONS,
    features: { visible: false, style: "glass", banners: "nope" },
  });
  assert.equal(dropped.features.visible, false);
  assert.equal(dropped.features.style, "glass");
  assert.equal(dropped.features.banners, undefined);
});

test("landing item selection keeps order and drops unknown ids", () => {
  const items = [
    { id: "red", title: "قرمز" },
    { id: "blue", title: "آبی" },
    { id: "green", title: "سبز" },
  ];
  assert.deepEqual(
    selectLandingItems(items, undefined).map((item) => item.id),
    ["red", "blue", "green"],
  );
  assert.deepEqual(
    selectLandingItems(items, ["green", "missing", "red", "green"]).map((item) => item.id),
    ["green", "red"],
  );
  assert.deepEqual(selectLandingItems(items, []), []);
});

test("attribute query filters published designs and stays out of the index", () => {
  const category = createCategory(emptyCatalog(), categoryInput("طبیعت", "nature"), NOW);
  const grouped = createAttribute(category.catalog, { kind: "group", name: "رنگ", slug: "colors" }, NOW);
  const group = grouped.attributeGroups[0];
  assert.ok(group);
  const valued = createAttribute(grouped, { kind: "value", groupId: group.id, name: "قرمز" }, NOW);
  const value = valued.attributeValues[0];
  assert.ok(value);
  const collected = createCollection(
    valued,
    {
      name: "یلدا",
      slug: "yalda",
      description: "شب یلدا",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  const input: DesignWriteInput = {
    title: "انار",
    titleEn: "",
    slug: "anar",
    shortDescription: "طرح انار",
    description: "",
    categoryIds: [category.category.id],
    attributeValueIds: [value.id],
    collectionIds: [collected.collection.id],
    tags: [],
    colors: [],
    styles: [],
    alt: "انار",
    imagePath: "/designed/anar.webp",
    thumbnailPath: "/designed/thumbs/anar.webp",
    gallery: [],
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    status: "published",
    featured: false,
    sortOrder: 0,
    templateSlug: "anar",
  };
  const saved = createDesign(collected.catalog, input, NOW);
  const unused = createCategory(saved.catalog, categoryInput("خالی", "empty-theme"), NOW);
  const emptyCollection = createCollection(
    unused.catalog,
    {
      name: "بدون طرح",
      slug: "empty-set",
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );

  const cards = landingTaxonomy(emptyCollection.catalog);
  assert.equal(cards.categories.length, 1);
  assert.equal(cards.categories[0]?.title, "طبیعت");
  assert.equal(cards.categories[0]?.href, "/designs/category/nature");
  assert.equal(cards.categories[0]?.image, "/designed/thumbs/anar.webp");
  assert.equal(cards.collections.length, 2);
  assert.equal(cards.collections[0]?.href, "/designs/collection/yalda");
  assert.equal(cards.features.length, 1);
  assert.equal(cards.features[0]?.title, "قرمز");
  assert.equal(cards.features[0]?.description, "رنگ");
  assert.equal(cards.features[0]?.group, "رنگ");
  assert.equal(cards.features[0]?.href, `/designs?attr=${encodeURIComponent(value.id)}`);
  assert.equal(cards.featureGroups.length, 1);
  assert.equal(cards.featureGroups[0]?.chips[0]?.href, `/designs?attr=${encodeURIComponent(value.id)}`);

  assert.equal(queryPublicDesigns(emptyCollection.catalog, { attributeValueId: value.id }).total, 1);
  assert.equal(queryPublicDesigns(emptyCollection.catalog, { attributeValueId: "val_missing" }).total, 0);
  assert.equal(parsePublicListingQuery({ attr: value.id }).noIndex, true);
  assert.equal(parsePublicListingQuery({ attr: value.id }).attr, value.id);
  assert.equal(parsePublicListingQuery({}).attr, "");
  assert.equal(parsePublicListingQuery({}).noIndex, false);
  assert.equal(parsePublicListingQuery({ attr: "../secret" }).attr, "");
});

function designInput(
  title: string,
  slug: string,
  categoryIds: string[],
  extra: Partial<DesignWriteInput> = {},
): DesignWriteInput {
  return {
    title,
    titleEn: "",
    slug,
    shortDescription: title,
    description: "",
    categoryIds,
    attributeValueIds: [],
    collectionIds: [],
    tags: [],
    colors: [],
    styles: [],
    alt: title,
    imagePath: `/designed/${slug}.webp`,
    thumbnailPath: `/designed/thumbs/${slug}.webp`,
    gallery: [],
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    status: "published",
    featured: false,
    sortOrder: 0,
    templateSlug: slug,
    ...extra,
  };
}

test("pinned design replaces the automatic landing card photo", () => {
  const nature = createCategory(emptyCatalog(), categoryInput("طبیعت", "nature"), NOW);
  const leaf = createCategory(
    nature.catalog,
    { ...categoryInput("برگ", "leaf"), parentId: nature.category.id },
    NOW,
  );
  const other = createCategory(leaf.catalog, categoryInput("شهر", "city"), NOW);
  const grouped = createAttribute(other.catalog, { kind: "group", name: "رنگ", slug: "colors" }, NOW);
  const group = grouped.attributeGroups[0];
  assert.ok(group);
  const valued = createAttribute(grouped, { kind: "value", groupId: group.id, name: "قرمز" }, NOW);
  const value = valued.attributeValues[0];
  assert.ok(value);
  const collected = createCollection(
    valued,
    {
      name: "یلدا",
      slug: "yalda",
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  const first = createDesign(
    collected.catalog,
    designInput("انار", "anar", [nature.category.id], {
      attributeValueIds: [value.id],
      collectionIds: [collected.collection.id],
    }),
    NOW,
  );
  const later = createDesign(
    first.catalog,
    designInput("انار دوم", "anar-2", [nature.category.id], {
      attributeValueIds: [value.id],
      collectionIds: [collected.collection.id],
    }),
    NOW,
  );
  const child = createDesign(later.catalog, designInput("برگ", "leaf-art", [leaf.category.id]), NOW);
  const outsider = createDesign(child.catalog, designInput("برج", "tower", [other.category.id]), NOW);
  const covered = updateCategory(
    outsider.catalog,
    nature.category.id,
    { ...categoryInput("طبیعت", "nature"), coverImage: "/designed/cover.webp" },
    NOW,
  );

  const automatic = landingTaxonomy(covered.catalog);
  const natureCard = automatic.categories.find((card) => card.id === nature.category.id);
  assert.equal(natureCard?.image, "/designed/cover.webp");

  const ignored = landingTaxonomy(covered.catalog, {
    categories: { [nature.category.id]: outsider.design.id },
  });
  assert.equal(
    ignored.categories.find((card) => card.id === nature.category.id)?.image,
    "/designed/cover.webp",
  );

  const pinned = landingTaxonomy(covered.catalog, {
    categories: { [nature.category.id]: child.design.id },
    features: { [value.id]: later.design.id },
    collections: { [collected.collection.id]: later.design.id },
  });
  assert.equal(
    pinned.categories.find((card) => card.id === nature.category.id)?.image,
    "/designed/thumbs/leaf-art.webp",
  );
  assert.equal(pinned.features[0]?.image, "/designed/thumbs/anar-2.webp");
  assert.equal(
    pinned.collections.find((card) => card.id === collected.collection.id)?.image,
    "/designed/thumbs/anar-2.webp",
  );
  assert.equal(landingTaxonomy(covered.catalog).features[0]?.image, "/designed/thumbs/anar.webp");

  const choices = landingBannerChoices(covered.catalog);
  assert.ok(choices.find((choice) => choice.id === child.design.id)?.cardIds.includes(nature.category.id));
  assert.equal(
    choices.find((choice) => choice.id === outsider.design.id)?.cardIds.includes(nature.category.id),
    false,
  );

  const cleaned = sanitizeLandingBanners(covered.catalog, {
    ...DEFAULT_LANDING_SECTIONS,
    categories: {
      visible: true,
      style: "bento",
      itemIds: [],
      banners: {
        [nature.category.id]: child.design.id,
        [other.category.id]: child.design.id,
        missing: first.design.id,
      },
    },
  });
  assert.deepEqual(cleaned.categories.banners, { [nature.category.id]: child.design.id });
  assert.deepEqual(cleaned.categories.itemIds, []);
});
