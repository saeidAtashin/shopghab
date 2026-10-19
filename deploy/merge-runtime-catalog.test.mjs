import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { mergeCatalog } from "./merge-runtime-catalog.mjs";

function category(overrides) {
  return {
    id: "cat-live",
    name: "نام ویرایش‌شده",
    slug: "animals",
    parentId: null,
    description: "توضیح دستی",
    seoTitle: "سئوی دستی",
    seoDescription: "",
    coverImage: "",
    status: "active",
    sortOrder: 7,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

function design(overrides) {
  return {
    id: "design-live",
    sourceKey: "animals/cat.eps",
    legacySlug: "space-cat",
    templateSlug: "space-cat",
    imagePath: "/designed/space-cat.webp",
    thumbnailPath: "/designed/thumbs/space-cat.webp",
    width: 10,
    height: 10,
    title: "عنوان دستی",
    titleEn: "",
    slug: "space-cat",
    shortDescription: "",
    description: "توضیح دستی",
    categoryIds: ["cat-live"],
    tags: ["دستی"],
    colors: [],
    styles: [],
    attributeValueIds: ["val-live"],
    collectionIds: ["col-live"],
    alt: "عنوان دستی",
    gallery: [],
    mockups: [],
    seoTitle: "سئو",
    seoDescription: "",
    ogImage: "",
    status: "published",
    featured: true,
    sortOrder: 4,
    assetMissing: false,
    unedited: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
    publishedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function catalog(overrides = {}) {
  return {
    version: 1,
    categories: [category()],
    designs: [design()],
    redirects: [{ fromSlug: "old-cat", toSlug: "space-cat", designId: "design-live" }],
    categoryRedirects: [{ fromSlug: "old-animals", toSlug: "animals", categoryId: "cat-live" }],
    attributeGroups: [
      {
        id: "grp-live",
        name: "رنگ دستی",
        slug: "color",
        sortOrder: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
      },
    ],
    attributeValues: [
      {
        id: "val-live",
        groupId: "grp-live",
        name: "قرمز دستی",
        sortOrder: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
      },
    ],
    collections: [
      {
        id: "col-live",
        name: "کالکشن دستی",
        slug: "summer",
        description: "دستی",
        seoTitle: "",
        seoDescription: "",
        coverImage: "",
        status: "active",
        sortOrder: 3,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

test("merge keeps live edits and appends only new catalog rows", () => {
  const live = catalog();
  const incoming = catalog({
    categories: [
      category({
        id: "cat-git",
        name: "حیوانات",
        description: "پیش‌فرض",
        seoTitle: "",
        sortOrder: 100,
      }),
      category({
        id: "cat-new",
        name: "گل",
        slug: "flowers",
        parentId: "cat-git",
        description: "جدید",
        sortOrder: 8,
      }),
    ],
    designs: [
      design({
        id: "design-git",
        title: "پیش‌فرض",
        description: "پیش‌فرض",
        categoryIds: ["cat-git"],
        tags: [],
        status: "draft",
        featured: false,
        seoTitle: "",
        unedited: true,
      }),
      design({
        id: "design-new",
        sourceKey: "flowers/rose.eps",
        legacySlug: "rose",
        templateSlug: "rose",
        slug: "rose",
        title: "رز",
        categoryIds: ["cat-new"],
        collectionIds: ["col-new"],
        attributeValueIds: ["val-new"],
        sortOrder: 9,
      }),
      design({
        id: "design-mapped",
        sourceKey: "animals/extra.eps",
        legacySlug: "extra",
        templateSlug: "extra",
        slug: "extra",
        title: "اضافه",
        categoryIds: ["cat-git"],
        collectionIds: ["col-git"],
        attributeValueIds: ["val-live"],
      }),
    ],
    redirects: [
      { fromSlug: "old-cat", toSlug: "default", designId: "design-git" },
      { fromSlug: "rose-old", toSlug: "rose", designId: "design-new" },
    ],
    categoryRedirects: [
      { fromSlug: "old-animals", toSlug: "beasts", categoryId: "cat-git" },
      { fromSlug: "gol", toSlug: "flowers", categoryId: "cat-new" },
    ],
    attributeGroups: [
      {
        id: "grp-git",
        name: "رنگ",
        slug: "color",
        sortOrder: 10,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "grp-new",
        name: "سبک",
        slug: "style",
        sortOrder: 2,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
    ],
    attributeValues: [
      {
        id: "val-live",
        groupId: "grp-git",
        name: "قرمز",
        sortOrder: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "val-new",
        groupId: "grp-new",
        name: "مینیمال",
        sortOrder: 1,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
      {
        id: "val-blue",
        groupId: "grp-git",
        name: "آبی",
        sortOrder: 2,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
    ],
    collections: [
      {
        id: "col-git",
        name: "تابستان",
        slug: "summer",
        description: "پیش‌فرض",
        seoTitle: "",
        seoDescription: "",
        coverImage: "",
        status: "active",
        sortOrder: 10,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "col-new",
        name: "هدیه",
        slug: "gift",
        description: "جدید",
        seoTitle: "",
        seoDescription: "",
        coverImage: "",
        status: "active",
        sortOrder: 4,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
    ],
  });

  const merged = mergeCatalog(live, incoming);

  assert.equal(merged.categories.length, 2);
  assert.equal(merged.designs.length, 3);
  assert.equal(merged.attributeGroups.length, 2);
  assert.equal(merged.attributeValues.length, 3);
  assert.equal(merged.collections.length, 2);
  assert.equal(merged.redirects.length, 2);
  assert.equal(merged.categoryRedirects.length, 2);

  const animals = merged.categories.find((item) => item.slug === "animals");
  assert.equal(animals?.id, "cat-live");
  assert.equal(animals?.name, "نام ویرایش‌شده");
  assert.equal(animals?.seoTitle, "سئوی دستی");
  assert.equal(animals?.sortOrder, 7);

  const flowers = merged.categories.find((item) => item.slug === "flowers");
  assert.equal(flowers?.id, "cat-new");
  assert.equal(flowers?.parentId, "cat-live");

  const kept = merged.designs.find((item) => item.id === "design-live");
  assert.equal(kept?.title, "عنوان دستی");
  assert.equal(kept?.status, "published");
  assert.equal(kept?.featured, true);
  assert.deepEqual(kept?.categoryIds, ["cat-live"]);
  assert.deepEqual(kept?.tags, ["دستی"]);

  const rose = merged.designs.find((item) => item.slug === "rose");
  assert.equal(rose?.title, "رز");
  assert.deepEqual(rose?.categoryIds, ["cat-new"]);
  assert.deepEqual(rose?.collectionIds, ["col-new"]);
  assert.deepEqual(rose?.attributeValueIds, ["val-new"]);

  const mapped = merged.designs.find((item) => item.slug === "extra");
  assert.deepEqual(mapped?.categoryIds, ["cat-live"]);
  assert.deepEqual(mapped?.collectionIds, ["col-live"]);
  assert.deepEqual(mapped?.attributeValueIds, ["val-live"]);

  assert.equal(merged.attributeGroups.find((item) => item.slug === "color")?.name, "رنگ دستی");
  assert.equal(merged.attributeValues.find((item) => item.id === "val-live")?.name, "قرمز دستی");
  assert.equal(merged.attributeValues.find((item) => item.id === "val-blue")?.groupId, "grp-live");
  assert.equal(merged.collections.find((item) => item.slug === "summer")?.name, "کالکشن دستی");
  assert.equal(merged.redirects.find((item) => item.fromSlug === "old-cat")?.toSlug, "space-cat");
  assert.equal(merged.redirects.find((item) => item.fromSlug === "rose-old")?.designId, "design-new");
  assert.equal(merged.categoryRedirects.find((item) => item.fromSlug === "old-animals")?.toSlug, "animals");
  assert.equal(merged.categoryRedirects.find((item) => item.fromSlug === "gol")?.categoryId, "cat-new");

  assert.equal(live.designs[0]?.title, "عنوان دستی");
  assert.equal(live.categories[0]?.name, "نام ویرایش‌شده");
});

test("a design already on the server is not added again by source key or slug", () => {
  const live = catalog();
  const incoming = catalog({
    designs: [
      design({ id: "other-id", title: "از سورس", slug: "unrelated", templateSlug: "unrelated", legacySlug: "unrelated" }),
      design({
        id: "another-id",
        sourceKey: "",
        title: "از اسلاگ",
        slug: "space-cat",
        templateSlug: "different",
        legacySlug: "different",
      }),
    ],
  });

  const merged = mergeCatalog(live, incoming);
  assert.equal(merged.designs.length, 1);
  assert.equal(merged.designs[0]?.title, "عنوان دستی");
});

test("a release replaces product mockup photos and keeps the rest of a live design", () => {
  const live = catalog();
  const incoming = catalog({
    designs: [
      design({
        title: "پیش‌فرض",
        description: "پیش‌فرض",
        mockups: [{ templateId: "iphone-free-case", image: "/designed/mockups/space-cat/iphone-free-case.webp", status: "ready" }],
      }),
    ],
  });

  const merged = mergeCatalog(live, incoming);
  assert.equal(merged.designs.length, 1);
  assert.equal(merged.designs[0]?.title, "عنوان دستی");
  assert.equal(merged.designs[0]?.description, "توضیح دستی");
  assert.equal(merged.designs[0]?.mockups[0]?.templateId, "iphone-free-case");
});

test("cli writes the merged catalog without changing the live file", () => {
  const dir = mkdtempSync(join(tmpdir(), "catalog-merge-"));
  const livePath = join(dir, "live.json");
  const incomingPath = join(dir, "incoming.json");
  const outPath = join(dir, "out.json");
  const live = catalog();
  writeFileSync(livePath, JSON.stringify(live));
  writeFileSync(incomingPath, JSON.stringify(catalog({
    categories: [
      category({ name: "پیش‌فرض", seoTitle: "" }),
      category({ id: "cat-new", name: "گل", slug: "flowers", description: "جدید" }),
    ],
  })));

  const result = spawnSync(process.execPath, [
    "deploy/merge-runtime-catalog.mjs",
    "--live",
    livePath,
    "--incoming",
    incomingPath,
    "--out",
    outPath,
  ], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  const merged = JSON.parse(readFileSync(outPath, "utf8"));
  assert.equal(merged.categories.find((item) => item.slug === "animals")?.name, "نام ویرایش‌شده");
  assert.equal(merged.categories.some((item) => item.slug === "flowers"), true);
  assert.equal(JSON.parse(readFileSync(livePath, "utf8")).categories[0]?.name, "نام ویرایش‌شده");
  rmSync(dir, { recursive: true, force: true });
});
