import assert from "node:assert/strict";
import test from "node:test";

import { createCategory, createDesign, emptyCatalog, indexableCatalogPaths, syncCatalog, updateCategoryStatus, updateDesign } from "./logic";
import { parseCatalogDocument, type DesignWriteInput } from "./schema";
import type { MockupRecord } from "@/lib/mockups/types";
import { FOLDED_OCCASION_SLUGS, OCCASION_COLLECTION_SLUG, SEEDED_CATEGORY_COUNT, seedCatalogTaxonomy } from "./taxonomy";

const NOW = "2026-01-01T00:00:00.000Z";

function readyMockup(imagePath: string, thumbnailPath: string): MockupRecord {
  return {
    templateId: "case",
    path: imagePath,
    thumbPath: thumbnailPath || imagePath,
    width: 1600,
    height: 1067,
    contentHash: "test",
    templateVersion: "1",
    generatedAt: NOW,
    status: "ready",
    error: "",
  };
}

function writeInput(overrides: Partial<DesignWriteInput> = {}): DesignWriteInput {
  return {
    title: "گربه فضایی",
    titleEn: "",
    slug: "space-cat",
    shortDescription: "",
    description: "",
    categoryIds: [],
    tags: [],
    colors: [],
    styles: [],
    alt: "گربه",
    imagePath: "/designed/space-cat.webp",
    thumbnailPath: "/designed/thumbs/space-cat.webp",
    gallery: [],
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    status: "published",
    featured: false,
    sortOrder: 1,
    templateSlug: "space-cat",
    ...overrides,
  };
}

test("seed inserts the full hierarchy once and keeps edits", () => {
  const first = seedCatalogTaxonomy(emptyCatalog(), NOW);
  assert.equal(SEEDED_CATEGORY_COUNT, 213);
  assert.equal(first.created, 213 + 6 + 59 + 14);
  assert.equal(first.catalog.categories.length, 213);
  assert.equal(first.catalog.attributeGroups.length, 6);
  assert.equal(first.catalog.attributeValues.length, 59);
  assert.equal(first.catalog.collections.length, 14);
  assert.equal(first.catalog.collections.some((item) => item.slug === OCCASION_COLLECTION_SLUG), true);
  assert.equal(first.catalog.collections.some((item) => item.slug === "mothers-day"), false);

  const slugs = first.catalog.categories.map((category) => category.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(slugs.includes("abstract"), false);
  assert.equal(slugs.includes("islamic"), false);
  assert.equal(slugs.includes("general"), false);

  const animals = first.catalog.categories.find((category) => category.slug === "animals");
  assert.ok(animals);
  animals.name = "نام ویرایش‌شده";
  animals.slug = "animals-edited";
  animals.sortOrder = 7;
  animals.seoTitle = "سئوی دستی";
  animals.description = "توضیح دستی";

  const custom = createCategory(first.catalog, {
    name: "دسته سفارشی",
    slug: "custom-shop",
    parentId: animals.id,
    description: "سفارشی",
    seoTitle: "سئو سفارشی",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  const assignment = createDesign(custom.catalog, writeInput({
    categoryIds: [animals.id, custom.category.id],
    slug: "multi-cat",
  }), NOW);

  const second = seedCatalogTaxonomy(assignment.catalog, "2026-02-01T00:00:00.000Z");
  assert.equal(second.created, 0);
  const edited = second.catalog.categories.find((category) => category.id === animals.id);
  assert.equal(edited?.name, "نام ویرایش‌شده");
  assert.equal(edited?.slug, "animals-edited");
  assert.equal(edited?.sortOrder, 7);
  assert.equal(edited?.seoTitle, "سئوی دستی");
  assert.equal(edited?.description, "توضیح دستی");
  assert.ok(second.catalog.categories.some((category) => category.slug === "custom-shop"));
  assert.deepEqual(second.catalog.designs[0]?.categoryIds, [animals.id, custom.category.id]);
  assert.equal(second.catalog.categories.filter((category) => category.slug === "animals").length, 0);
});

test("old occasion collections fold into مناسبت خاص", () => {
  const seeded = seedCatalogTaxonomy(emptyCatalog(), NOW);
  const occasion = seeded.catalog.collections.find((item) => item.slug === OCCASION_COLLECTION_SLUG);
  assert.ok(occasion);
  const yalda = {
    ...occasion,
    id: "col_yalda",
    name: "یلدا",
    slug: "yalda",
    sortOrder: 900,
  };
  seeded.catalog.collections.push(yalda);
  const created = createDesign(seeded.catalog, writeInput({
    slug: "yalda-cat",
    collectionIds: [yalda.id, occasion.id],
  }), NOW);
  const folded = seedCatalogTaxonomy(created.catalog, "2026-02-01T00:00:00.000Z");
  const design = folded.catalog.designs[0];
  assert.ok(design);
  assert.equal(design.collectionIds.includes(yalda.id), false);
  assert.equal(design.collectionIds.includes(occasion.id), true);
  assert.equal(design.collectionIds.filter((id) => id === occasion.id).length, 1);
  assert.equal(folded.catalog.collections.find((item) => item.slug === "yalda")?.status, "archived");
  assert.equal(FOLDED_OCCASION_SLUGS.includes("yalda"), true);
});

test("a design can belong to several categories and keeps them on re-import", () => {
  const seeded = seedCatalogTaxonomy(emptyCatalog(), NOW);
  const cats = seeded.catalog.categories.find((category) => category.slug === "cats");
  const roses = seeded.catalog.categories.find((category) => category.slug === "roses");
  assert.ok(cats && roses);
  const created = createDesign(seeded.catalog, writeInput({
    categoryIds: [cats.id, roses.id],
    collectionIds: [seeded.catalog.collections[0]?.id ?? ""],
    attributeValueIds: [seeded.catalog.attributeValues[0]?.id ?? ""],
  }), NOW);
  assert.deepEqual(created.design.categoryIds, [cats.id, roses.id]);

  const saved = updateDesign(created.catalog, created.design.id, writeInput({
    categoryIds: [roses.id],
    title: "عنوان دستی",
    seoTitle: "سئو",
    status: "published",
  }), NOW);
  assert.deepEqual(saved.design.categoryIds, [roses.id]);
  assert.deepEqual(saved.design.attributeValueIds, [seeded.catalog.attributeValues[0]?.id]);

  const reimported = syncCatalog(saved.catalog, [{
    sourceKey: "abstract/space-cat.eps",
    templateSlug: "space-cat",
    categorySlug: "abstract",
    subcategory: "others",
    titleHint: "از فایل",
    descriptionHint: "از فایل",
    tagsHint: [],
    imagePath: "/designed/space-cat.webp",
    thumbnailPath: "/designed/thumbs/space-cat.webp",
    width: 10,
    height: 10,
  }], { now: NOW, defaultStatus: "draft" });

  assert.equal(reimported.catalog.designs[0]?.title, "عنوان دستی");
  assert.equal(reimported.catalog.designs[0]?.seoTitle, "سئو");
  assert.equal(reimported.catalog.designs[0]?.status, "published");
  assert.deepEqual(reimported.catalog.designs[0]?.categoryIds, [roses.id]);
});

test("inactive categories stay assigned but stay out of the sitemap", () => {
  const seeded = seedCatalogTaxonomy(emptyCatalog(), NOW);
  const cats = seeded.catalog.categories.find((category) => category.slug === "cats");
  assert.ok(cats);
  const created = createDesign(seeded.catalog, writeInput({ categoryIds: [cats.id] }), NOW);
  created.design.mockups = [readyMockup(created.design.imagePath, created.design.thumbnailPath)];
  const inactive = updateCategoryStatus(created.catalog, cats.id, "inactive", NOW);
  const paths = indexableCatalogPaths(inactive.catalog).map((item) => item.path);
  assert.equal(paths.includes("/designs/category/cats"), false);
  assert.equal(paths.includes("/designs/collection/bestsellers"), false);
  assert.ok(paths.includes("/designs/space-cat"));
  const design = inactive.catalog.designs[0];
  assert.ok(design?.categoryIds.includes(cats.id));
});

test("older catalog files gain the new fields on read", () => {
  const parsed = parseCatalogDocument({
    version: 1,
    categories: [{
      id: "cat_old",
      name: "قدیمی",
      slug: "legacy",
      parentId: null,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
      createdAt: NOW,
      updatedAt: NOW,
    }],
    designs: [{
      id: "dsn_old",
      sourceKey: "a.eps",
      legacySlug: "a",
      templateSlug: "a",
      imagePath: "/designed/a.webp",
      thumbnailPath: "/designed/thumbs/a.webp",
      width: 1,
      height: 1,
      title: "الف",
      titleEn: "",
      slug: "a",
      shortDescription: "",
      description: "",
      categoryIds: ["cat_old"],
      tags: [],
      colors: [],
      styles: [],
      alt: "",
      gallery: [],
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      status: "published",
      featured: false,
      sortOrder: 0,
      assetMissing: false,
      createdAt: NOW,
      updatedAt: NOW,
      publishedAt: NOW,
    }],
    redirects: [],
  });
  assert.equal(parsed.categories[0]?.sortOrder, 0);
  assert.deepEqual(parsed.designs[0]?.attributeValueIds, []);
  assert.deepEqual(parsed.designs[0]?.collectionIds, []);
  assert.deepEqual(parsed.designs[0]?.mockups, []);
  assert.equal(parsed.designs[0]?.unedited, true);
  assert.equal(parsed.designs[0]?.placements, undefined);
  const withPlacement = structuredClone(parsed);
  const design = withPlacement.designs[0];
  assert.ok(design);
  design.placements = { "iphone-17-pro-cover": { focalX: 0.2, focalY: 0.8 } };
  const again = parseCatalogDocument(withPlacement);
  assert.equal(again.designs[0]?.placements?.["iphone-17-pro-cover"]?.focalX, 0.2);
  assert.deepEqual(parsed.collections, []);
});

test("missing attribute slugs recover the seed key", () => {
  const seeded = seedCatalogTaxonomy(emptyCatalog(), NOW);
  const black = seeded.catalog.attributeValues.find((value) => value.slug === "black");
  assert.ok(black);
  const raw = structuredClone(seeded.catalog);
  const value = raw.attributeValues.find((item) => item.id === black.id);
  assert.ok(value);
  delete (value as { slug?: string }).slug;
  const parsed = parseCatalogDocument(raw);
  assert.equal(parsed.attributeValues.find((item) => item.id === black.id)?.slug, "black");
});
