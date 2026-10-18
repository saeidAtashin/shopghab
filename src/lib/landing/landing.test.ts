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
} from "../catalog/logic";
import type { CategoryWriteInput, DesignWriteInput } from "../catalog/schema";
import { DEFAULT_LANDING_SECTIONS, parseLandingSections, selectLandingItems } from "./sections";
import { landingTaxonomy } from "./taxonomy";

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
