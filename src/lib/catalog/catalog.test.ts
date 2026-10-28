import assert from "node:assert/strict";
import test from "node:test";

import { browseHref } from "./browse";
import { stableDesignId } from "./ids";
import {
  CatalogError,
  categoryCreatesCycle,
  cleanAttributeRedirect,
  changeDesignSlug,
  createAttribute,
  createCategory,
  createDesign,
  deleteAttribute,
  emptyCatalog,
  forkDesignFromArtwork,
  saveDesignPlacement,
  indexableCatalogPaths,
  moveDesign,
  syncCatalog,
  queryDesigns,
  publicBrowseSections,
  publicBrowseShell,
  publicCategoryCards,
  parsePublicListingQuery,
  queryPublicDesigns,
  editorDesignPicker,
  updateAttribute,
  updateCategory,
  updateDesign,
  updateDesignStatus,
  type CatalogImportEntry,
} from "./logic";
import { filterEditorDesigns } from "./editor-picker";
import type { DesignWriteInput } from "./schema";
import type { MockupRecord } from "@/lib/mockups/types";

const NOW = "2026-01-01T00:00:00.000Z";

function entry(overrides: Partial<CatalogImportEntry> = {}): CatalogImportEntry {
  return {
    sourceKey: "abstract/space-cat.eps",
    templateSlug: "space-cat",
    categorySlug: "abstract",
    subcategory: "others",
    titleHint: "گربه فضایی",
    descriptionHint: "طرح گربه فضایی",
    tagsHint: ["گربه"],
    imagePath: "/designed/space-cat.webp",
    thumbnailPath: "/designed/thumbs/space-cat.webp",
    width: 1000,
    height: 1000,
    ...overrides,
  };
}

function writeInput(overrides: Partial<DesignWriteInput> = {}): DesignWriteInput {
  return {
    title: "گربه فضایی",
    titleEn: "Space Cat",
    slug: "space-cat",
    shortDescription: "کوتاه",
    description: "کامل",
    categoryIds: [],
    tags: ["گربه"],
    colors: ["آبی"],
    styles: ["مینیمال"],
    alt: "گربه فضایی",
    imagePath: "/designed/space-cat.webp",
    thumbnailPath: "/designed/thumbs/space-cat.webp",
    gallery: [],
    seoTitle: "سئو گربه",
    seoDescription: "توضیح سئو",
    ogImage: "",
    status: "published",
    featured: true,
    sortOrder: 1,
    templateSlug: "space-cat",
    ...overrides,
  };
}

test("import creates one catalog record with a stable id", () => {
  const result = syncCatalog(emptyCatalog(), [entry()], {
    now: NOW,
    defaultStatus: "draft",
  });

  assert.equal(result.report.created.length, 1);
  assert.equal(result.catalog.designs.length, 1);
  assert.equal(result.catalog.designs[0]?.id, stableDesignId("abstract/space-cat.eps"));
  assert.equal(result.catalog.designs[0]?.status, "draft");
  assert.equal(result.catalog.designs[0]?.unedited, true);
  assert.equal(result.catalog.designs[0]?.categoryIds.length, 1);
});

test("re-import does not duplicate or overwrite editorial fields", () => {
  const first = syncCatalog(emptyCatalog(), [entry()], {
    now: NOW,
    defaultStatus: "published",
  });
  const design = first.catalog.designs[0];
  assert.ok(design);
  const categoryId = first.catalog.categories[0]?.id;
  assert.ok(categoryId);

  const edited = updateDesign(first.catalog, design.id, writeInput({ categoryIds: [categoryId] }), NOW);
  edited.design.title = "عنوان دستی";

  const second = syncCatalog(
    edited.catalog,
    [entry({ titleHint: "عنوان جدید فایل", imagePath: "/designed/space-cat-2.webp", width: 20 })],
    { now: "2026-02-01T00:00:00.000Z", defaultStatus: "draft" },
  );

  assert.equal(second.catalog.designs.length, 1);
  assert.equal(second.report.created.length, 0);
  assert.equal(second.report.editorialPreserved.length, 1);
  assert.equal(second.catalog.designs[0]?.title, "عنوان دستی");
  assert.equal(second.catalog.designs[0]?.seoTitle, "سئو گربه");
  assert.deepEqual(second.catalog.designs[0]?.categoryIds, [categoryId]);
  assert.equal(second.catalog.designs[0]?.status, "published");
  assert.equal(second.catalog.designs[0]?.imagePath, "/designed/space-cat-2.webp");
  assert.equal(second.catalog.designs[0]?.width, 20);
  assert.equal(second.catalog.designs[0]?.unedited, false);
});

test("saving a design clears unedited and a status change keeps it", () => {
  const imported = syncCatalog(emptyCatalog(), [entry()], {
    now: NOW,
    defaultStatus: "published",
  });
  const design = imported.catalog.designs[0];
  assert.ok(design);
  assert.equal(design.unedited, true);

  const statusOnly = updateDesignStatus(imported.catalog, design.id, "draft", NOW);
  assert.equal(statusOnly.design.unedited, true);
  const waiting = queryDesigns(statusOnly.catalog, { unedited: true });
  assert.equal(waiting.total, 1);

  const categoryId = imported.catalog.categories[0]?.id ?? "";
  const saved = updateDesign(statusOnly.catalog, design.id, writeInput({ categoryIds: [categoryId] }), NOW);
  assert.equal(saved.design.unedited, false);
  assert.equal(queryDesigns(saved.catalog, { unedited: true }).total, 0);

  const created = createDesign(saved.catalog, writeInput({ slug: "fresh-cat", title: "تازه" }), NOW);
  assert.equal(created.design.unedited, false);
});

test("re-import keeps mockup metadata and the editorial gallery", () => {
  const first = syncCatalog(emptyCatalog(), [entry()], {
    now: NOW,
    defaultStatus: "published",
  });
  const design = first.catalog.designs[0];
  assert.ok(design);
  design.gallery = ["/designed/extra.webp"];
  design.mockups = [
    {
      templateId: "flat-case",
      path: "/designed/mockups/space-cat/flat-case.webp",
      thumbPath: "/designed/mockups/space-cat/flat-case.thumb.webp",
      width: 80,
      height: 80,
      contentHash: "abc",
      templateVersion: "1",
      generatedAt: NOW,
      status: "ready",
      error: "",
    },
  ];
  design.title = "عنوان دستی";

  const second = syncCatalog(
    first.catalog,
    [entry({ imagePath: "/designed/space-cat-2.webp", width: 20 })],
    { now: "2026-02-01T00:00:00.000Z", defaultStatus: "draft" },
  );

  assert.equal(second.catalog.designs[0]?.title, "عنوان دستی");
  assert.deepEqual(second.catalog.designs[0]?.gallery, ["/designed/extra.webp"]);
  assert.equal(second.catalog.designs[0]?.mockups[0]?.templateId, "flat-case");
  assert.equal(second.catalog.designs[0]?.mockups[0]?.status, "ready");
  assert.equal(second.catalog.designs[0]?.imagePath, "/designed/space-cat-2.webp");
});

test("missing source files are kept and reported", () => {
  const first = syncCatalog(emptyCatalog(), [entry(), entry({
    sourceKey: "islamic/moon.eps",
    templateSlug: "moon",
    categorySlug: "islamic",
    titleHint: "ماه",
  })], { now: NOW, defaultStatus: "published" });

  const second = syncCatalog(first.catalog, [entry()], {
    now: "2026-02-01T00:00:00.000Z",
    defaultStatus: "draft",
  });

  assert.equal(second.catalog.designs.length, 2);
  assert.equal(second.report.missingAssets.length, 1);
  const missing = second.catalog.designs.find((design) => design.templateSlug === "moon");
  assert.equal(missing?.assetMissing, true);
  assert.equal(missing?.title, "ماه");
});

test("createDesign adds a numeric suffix when the slug is already taken", () => {
  const first = createDesign(emptyCatalog(), writeInput(), NOW);
  const second = createDesign(first.catalog, writeInput({ title: "دیگر" }), NOW);
  assert.equal(first.design.slug, "space-cat");
  assert.equal(second.design.slug, "space-cat-2");
  assert.equal(second.design.legacySlug, "space-cat-2");
});

test("slug changes keep a permanent redirect and reject duplicates", () => {
  const created = createDesign(emptyCatalog(), writeInput(), NOW);
  const design = created.design;
  changeDesignSlug(created.catalog, design, "space-cat-new");
  assert.equal(design.slug, "space-cat-new");
  assert.deepEqual(created.catalog.redirects, [
    { fromSlug: "space-cat", toSlug: "space-cat-new", designId: design.id },
  ]);

  const other = createDesign(created.catalog, writeInput({ slug: "other", title: "دیگر" }), NOW);
  assert.throws(
    () => changeDesignSlug(other.catalog, other.design, "space-cat-new"),
    (error: unknown) => error instanceof CatalogError && error.status === 409,
  );
});

test("category parent cycles are rejected", () => {
  let catalog = emptyCatalog();
  const parent = createCategory(catalog, {
    name: "فضا",
    slug: "space",
    parentId: null,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  catalog = parent.catalog;
  const child = createCategory(catalog, {
    name: "گربه",
    slug: "cats",
    parentId: parent.category.id,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  catalog = child.catalog;

  assert.equal(
    categoryCreatesCycle(catalog.categories, parent.category.id, child.category.id),
    true,
  );
  assert.throws(
    () =>
      updateCategory(catalog, parent.category.id, {
        name: "فضا",
        slug: "space",
        parentId: child.category.id,
        description: "",
        seoTitle: "",
        seoDescription: "",
        coverImage: "",
        status: "active",
      }),
    (error: unknown) => error instanceof CatalogError && error.status === 400,
  );
});

test("public category cards list indexable roots and their inner categories", () => {
  let catalog = emptyCatalog();
  const parent = createCategory(
    catalog,
    {
      name: "حیوانات",
      slug: "animals",
      parentId: null,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "/designed/covers/animals.webp",
      status: "active",
    },
    NOW,
  );
  catalog = parent.catalog;
  const child = createCategory(
    catalog,
    {
      name: "گربه",
      slug: "cats",
      parentId: parent.category.id,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = child.catalog;
  catalog = createCategory(
    catalog,
    {
      name: "سگ",
      slug: "dogs",
      parentId: parent.category.id,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  ).catalog;
  const created = createDesign(
    catalog,
    writeInput({
      slug: "cat-case",
      title: "قاب گربه",
      categoryIds: [child.category.id],
      imagePath: "/designed/cat.webp",
      thumbnailPath: "/designed/thumbs/cat.webp",
    }),
    NOW,
  );
  catalog = created.catalog;
  const design = catalog.designs.find((item) => item.id === created.design.id);
  assert.ok(design);
  design.mockups = [readyMockup(design.imagePath, design.thumbnailPath)];

  const roots = publicCategoryCards(catalog, null);
  assert.deepEqual(
    roots.map((card) => card.slug),
    ["animals"],
  );
  assert.equal(roots[0]?.href, "/designs/category/animals");
  assert.equal(roots[0]?.image, "/designed/covers/animals.webp");
  assert.equal(roots[0]?.count, 1);

  const children = publicCategoryCards(catalog, parent.category.id);
  assert.deepEqual(
    children.map((card) => card.slug),
    ["cats"],
  );
  assert.equal(children[0]?.image, "/designed/thumbs/cat.webp");
  assert.equal(children[0]?.count, 1);

  const sections = publicBrowseSections(catalog, 6);
  assert.equal(sections.length, 1);
  assert.equal(sections[0]?.slug, "animals");
  assert.equal(sections[0]?.title, "حیوانات");
  assert.equal(sections[0]?.href, "/designs/category/animals");
  assert.equal(sections[0]?.count, 1);
  assert.equal(sections[0]?.designs.length, 1);
  assert.equal(sections[0]?.designs[0]?.slug, "cat-case");

  const shell = publicBrowseShell(catalog);
  assert.deepEqual(
    shell.categories.map((item) => item.slug),
    ["animals"],
  );
  assert.deepEqual(
    shell.categories[0]?.children.map((item) => item.slug),
    ["cats"],
  );
});

test("browse href omits the default page and sort", () => {
  assert.equal(browseHref("/designs", { viewAll: true }), "/designs?view=all");
  const href = browseHref("/designs/category/animals", {
    q: "گربه",
    sort: "newest",
    attrs: ["black", "blue"],
    page: 1,
  });
  const url = new URL(href, "http://localhost");
  assert.equal(url.pathname, "/designs/category/animals");
  assert.equal(url.searchParams.get("q"), "گربه");
  assert.equal(url.searchParams.get("sort"), "newest");
  assert.equal(url.searchParams.get("attr"), "black,blue");
  assert.equal(url.searchParams.get("page"), null);
  assert.equal(browseHref("/designs/category/animals", { subs: ["cats"] }), "/designs/category/cats");
  assert.equal(
    browseHref("/designs", { attrs: ["black"] }, [{ id: "black", groupSlug: "colors", slug: "black" }]),
    "/designs/filter/colors/black",
  );
  assert.equal(
    browseHref(
      "/designs",
      { attrs: ["black"], sort: "newest" },
      [{ id: "black", groupSlug: "colors", slug: "black" }],
    ),
    "/designs/filter/colors/black?sort=newest",
  );
});

test("public design filters combine inner categories and attribute groups", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "رنگ", slug: "colors" }, NOW);
  const colorGroup = catalog.attributeGroups.find((group) => group.slug === "colors");
  assert.ok(colorGroup);
  catalog = createAttribute(catalog, { kind: "value", groupId: colorGroup.id, name: "مشکی" }, NOW);
  catalog = createAttribute(catalog, { kind: "value", groupId: colorGroup.id, name: "سفید" }, NOW);
  catalog = createAttribute(catalog, { kind: "group", name: "سبک", slug: "styles" }, NOW);
  const styleGroup = catalog.attributeGroups.find((group) => group.slug === "styles");
  assert.ok(styleGroup);
  catalog = createAttribute(catalog, { kind: "value", groupId: styleGroup.id, name: "مینیمال" }, NOW);
  const black = catalog.attributeValues.find((value) => value.name === "مشکی");
  const white = catalog.attributeValues.find((value) => value.name === "سفید");
  const minimal = catalog.attributeValues.find((value) => value.name === "مینیمال");
  assert.ok(black && white && minimal);

  const parent = createCategory(
    catalog,
    {
      name: "حیوانات",
      slug: "animals",
      parentId: null,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = parent.catalog;
  const cats = createCategory(
    catalog,
    {
      name: "گربه",
      slug: "cats",
      parentId: parent.category.id,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = cats.catalog;
  const dogs = createCategory(
    catalog,
    {
      name: "سگ",
      slug: "dogs",
      parentId: parent.category.id,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = dogs.catalog;

  const catDesign = createDesign(
    catalog,
    writeInput({
      slug: "black-cat",
      title: "گربه مشکی",
      categoryIds: [cats.category.id],
      attributeValueIds: [black.id],
      imagePath: "/designed/black-cat.webp",
      thumbnailPath: "/designed/thumbs/black-cat.webp",
    }),
    NOW,
  );
  catalog = catDesign.catalog;
  const dogDesign = createDesign(
    catalog,
    writeInput({
      slug: "white-dog",
      title: "سگ سفید",
      categoryIds: [dogs.category.id],
      attributeValueIds: [white.id, minimal.id],
      imagePath: "/designed/white-dog.webp",
      thumbnailPath: "/designed/thumbs/white-dog.webp",
    }),
    NOW,
  );
  catalog = dogDesign.catalog;
  for (const design of catalog.designs) {
    design.mockups = [readyMockup(design.imagePath, design.thumbnailPath)];
  }

  const eitherColor = queryPublicDesigns(catalog, { attributeValueIds: [black.id, white.id] });
  assert.deepEqual(eitherColor.items.map((design) => design.slug).sort(), ["black-cat", "white-dog"]);
  assert.deepEqual(
    queryPublicDesigns(catalog, { attributeValueIds: [white.id, minimal.id] }).items.map((design) => design.slug),
    ["white-dog"],
  );
  assert.equal(queryPublicDesigns(catalog, { attributeValueIds: [black.id, minimal.id] }).total, 0);
  assert.deepEqual(
    queryPublicDesigns(catalog, { categoryIds: [cats.category.id, dogs.category.id] }).items.map((design) => design.slug).sort(),
    ["black-cat", "white-dog"],
  );
  assert.equal(parsePublicListingQuery({ attr: `${black.id},${white.id}`, sub: "cats,dogs" }).attrs.length, 2);
  assert.deepEqual(parsePublicListingQuery({ sub: "cats,dogs" }).subs, ["cats", "dogs"]);
  assert.equal(parsePublicListingQuery({ sub: "cats,dogs" }).noIndex, true);
});

test("editor picker keeps flat artwork and the same category and filter rules", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "رنگ", slug: "colors" }, NOW);
  const colorGroup = catalog.attributeGroups.find((group) => group.slug === "colors");
  assert.ok(colorGroup);
  catalog = createAttribute(catalog, { kind: "value", groupId: colorGroup.id, name: "مشکی" }, NOW);
  catalog = createAttribute(catalog, { kind: "value", groupId: colorGroup.id, name: "سفید" }, NOW);
  catalog = createAttribute(catalog, { kind: "group", name: "سبک", slug: "styles" }, NOW);
  const styleGroup = catalog.attributeGroups.find((group) => group.slug === "styles");
  assert.ok(styleGroup);
  catalog = createAttribute(catalog, { kind: "value", groupId: styleGroup.id, name: "مینیمال" }, NOW);
  const black = catalog.attributeValues.find((value) => value.name === "مشکی");
  const white = catalog.attributeValues.find((value) => value.name === "سفید");
  const minimal = catalog.attributeValues.find((value) => value.name === "مینیمال");
  assert.ok(black && white && minimal);

  const parent = createCategory(
    catalog,
    {
      name: "حیوانات",
      slug: "animals",
      parentId: null,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = parent.catalog;
  const cats = createCategory(
    catalog,
    {
      name: "گربه",
      slug: "cats",
      parentId: parent.category.id,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = cats.catalog;
  const dogs = createCategory(
    catalog,
    {
      name: "سگ",
      slug: "dogs",
      parentId: parent.category.id,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );
  catalog = dogs.catalog;

  const catDesign = createDesign(
    catalog,
    writeInput({
      slug: "black-cat",
      title: "گربه مشکی",
      titleEn: "Black Cat",
      tags: ["گربه"],
      categoryIds: [cats.category.id],
      attributeValueIds: [black.id],
      imagePath: "/designed/black-cat.webp",
      thumbnailPath: "/designed/thumbs/black-cat.webp",
      featured: true,
      sortOrder: 2,
    }),
    NOW,
  );
  catalog = catDesign.catalog;
  catDesign.design.width = 800;
  catDesign.design.height = 1000;
  catDesign.design.mockups = [
    readyMockup("/designed/mockups/black-cat/case.webp", "/designed/mockups/black-cat/case.thumb.webp"),
  ];

  const dogDesign = createDesign(
    catalog,
    writeInput({
      slug: "white-dog",
      title: "سگ سفید",
      titleEn: "White Dog",
      tags: ["سگ"],
      categoryIds: [dogs.category.id],
      attributeValueIds: [white.id, minimal.id],
      imagePath: "/designed/white-dog.webp",
      thumbnailPath: "/designed/thumbs/white-dog.webp",
      featured: false,
      sortOrder: 1,
    }),
    "2026-03-01T00:00:00.000Z",
  );
  catalog = dogDesign.catalog;
  dogDesign.design.width = 0;
  dogDesign.design.height = 0;
  dogDesign.design.mockups = [
    readyMockup("/designed/mockups/white-dog/case.webp", "/designed/mockups/white-dog/case.thumb.webp"),
  ];

  const draft = createDesign(
    catalog,
    writeInput({
      slug: "draft-bird",
      title: "پرنده",
      categoryIds: [parent.category.id],
      imagePath: "/designed/draft-bird.webp",
      thumbnailPath: "/designed/thumbs/draft-bird.webp",
      status: "draft",
    }),
    NOW,
  );
  catalog = draft.catalog;

  const picker = editorDesignPicker(catalog);
  assert.deepEqual(
    picker.designs.map((design) => design.src),
    ["/designed/black-cat.webp", "/designed/white-dog.webp"],
  );
  assert.equal(picker.designs[0]?.thumb, "/designed/thumbs/black-cat.webp");
  assert.equal(picker.designs[0]?.width, 800);
  assert.equal(picker.designs[0]?.height, 1000);
  assert.equal(picker.designs[1]?.width, 1600);
  const animals = picker.categories.find((category) => category.slug === "animals");
  assert.ok(animals);
  assert.deepEqual(
    animals.children.map((child) => child.slug),
    ["cats", "dogs"],
  );
  assert.equal(picker.groups.find((group) => group.slug === "colors")?.label, "رنگ");

  const catId = animals.children.find((child) => child.slug === "cats")?.id;
  assert.ok(catId);
  assert.deepEqual(
    filterEditorDesigns(picker, { categoryId: animals.id, childIds: [catId] }).map((design) => design.title),
    ["گربه مشکی"],
  );
  assert.deepEqual(
    filterEditorDesigns(picker, { categoryId: animals.id }).map((design) => design.title).sort(),
    ["سگ سفید", "گربه مشکی"],
  );
  assert.deepEqual(
    filterEditorDesigns(picker, { attributeValueIds: [black.id, white.id] }).map((design) => design.title).sort(),
    ["سگ سفید", "گربه مشکی"],
  );
  assert.equal(
    filterEditorDesigns(picker, { attributeValueIds: [black.id, minimal.id] }).length,
    0,
  );
  assert.deepEqual(
    filterEditorDesigns(picker, { q: "black" }).map((design) => design.title),
    ["گربه مشکی"],
  );
  assert.deepEqual(
    filterEditorDesigns(picker, { sort: "newest" }).map((design) => design.title),
    ["سگ سفید", "گربه مشکی"],
  );
});

test("sitemap includes published designs with a product mockup and skips drafts and flat artwork", () => {
  const imported = syncCatalog(
    emptyCatalog(),
    [
      entry(),
      entry({
        sourceKey: "abstract/draft-cat.eps",
        templateSlug: "draft-cat",
        titleHint: "پیش‌نویس",
        imagePath: "/designed/draft-cat.webp",
      }),
    ],
    { now: NOW, defaultStatus: "draft" },
  );
  const published = updateDesignStatusOnly(imported.catalog, imported.catalog.designs[0]?.id ?? "");
  const flatPaths = indexableCatalogPaths(published).map((item) => item.path);

  assert.equal(flatPaths.includes("/designs/space-cat"), false);
  assert.equal(flatPaths.includes("/designs/category/abstract"), false);
  assert.equal(flatPaths.includes("/designs/draft-cat"), false);

  const design = published.designs[0];
  assert.ok(design);
  design.mockups = [readyMockup(design.imagePath, design.thumbnailPath)];
  const paths = indexableCatalogPaths(published).map((item) => item.path);

  assert.ok(paths.includes("/designs/space-cat"));
  assert.ok(paths.includes("/designs/category/abstract"));
  assert.equal(paths.includes("/designs/draft-cat"), false);
});

test("an indexable color filter gets a clean path and a sitemap entry", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "رنگ", slug: "colors" }, NOW);
  const group = catalog.attributeGroups[0];
  assert.ok(group);
  catalog = createAttribute(catalog, { kind: "value", groupId: group.id, name: "مشکی" }, NOW);
  const black = catalog.attributeValues[0];
  assert.ok(black);
  const made = createDesign(
    catalog,
    writeInput({
      slug: "black-case",
      attributeValueIds: [black.id],
      imagePath: "/designed/black-case.webp",
      thumbnailPath: "/designed/thumbs/black-case.webp",
    }),
    NOW,
  );
  made.design.mockups = [readyMockup(made.design.imagePath, made.design.thumbnailPath)];
  const path = `/designs/filter/colors/${black.slug}`;
  assert.ok(indexableCatalogPaths(made.catalog).some((item) => item.path === path));
  assert.equal(cleanAttributeRedirect(made.catalog, parsePublicListingQuery({ attr: black.id })), path);
  assert.equal(cleanAttributeRedirect(made.catalog, parsePublicListingQuery({ attr: black.id, q: "گربه" })), null);
});

test("attribute update renames a group and rejects a duplicate slug", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "رنگ", slug: "color" }, NOW);
  catalog = createAttribute(catalog, { kind: "group", name: "سبک", slug: "style" }, NOW);
  const color = catalog.attributeGroups.find((group) => group.slug === "color");
  assert.ok(color);

  catalog = updateAttribute(catalog, { kind: "group", id: color.id, name: "فام", slug: "hue" }, NOW);
  assert.equal(catalog.attributeGroups.find((group) => group.id === color.id)?.name, "فام");
  assert.equal(catalog.attributeGroups.find((group) => group.id === color.id)?.slug, "hue");

  assert.throws(
    () => updateAttribute(catalog, { kind: "group", id: color.id, name: "سبک", slug: "style" }, NOW),
    (error: unknown) => error instanceof CatalogError && error.status === 409,
  );
});

test("deleting an attribute value removes it from designs", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "رنگ", slug: "color" }, NOW);
  const group = catalog.attributeGroups[0];
  assert.ok(group);
  catalog = createAttribute(catalog, { kind: "value", groupId: group.id, name: "آبی" }, NOW);
  const value = catalog.attributeValues[0];
  assert.ok(value);
  catalog = createDesign(
    catalog,
    writeInput({ attributeValueIds: [value.id] }),
    NOW,
  ).catalog;

  catalog = deleteAttribute(catalog, { kind: "value", id: value.id });
  assert.equal(catalog.attributeValues.length, 0);
  assert.deepEqual(catalog.designs[0]?.attributeValueIds, []);
});

test("deleting an attribute group removes its values from designs", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "رنگ", slug: "color" }, NOW);
  const group = catalog.attributeGroups[0];
  assert.ok(group);
  catalog = createAttribute(catalog, { kind: "value", groupId: group.id, name: "آبی" }, NOW);
  const value = catalog.attributeValues[0];
  assert.ok(value);
  catalog = createDesign(
    catalog,
    writeInput({ attributeValueIds: [value.id] }),
    NOW,
  ).catalog;

  catalog = deleteAttribute(catalog, { kind: "group", id: group.id });
  assert.equal(catalog.attributeGroups.length, 0);
  assert.equal(catalog.attributeValues.length, 0);
  assert.deepEqual(catalog.designs[0]?.attributeValueIds, []);

  assert.throws(
    () => deleteAttribute(catalog, { kind: "group", id: group.id }),
    (error: unknown) => error instanceof CatalogError && error.status === 404,
  );
});

test("category list uses the same order as the public category page", () => {
  const created = createCategory(emptyCatalog(), {
    name: "الگو",
    slug: "patterns",
    parentId: null,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  const categoryId = created.category.id;
  let catalog = created.catalog;
  const specs = [
    { title: "آلفا", slug: "alpha", sortOrder: 30, featured: false },
    { title: "گاما", slug: "gamma", sortOrder: 10, featured: false },
    { title: "بتا", slug: "beta", sortOrder: 99, featured: true },
  ];
  for (const spec of specs) {
    const saved = createDesign(
      catalog,
      writeInput({
        title: spec.title,
        slug: spec.slug,
        sortOrder: spec.sortOrder,
        featured: spec.featured,
        categoryIds: [categoryId],
        imagePath: `/designed/${spec.slug}.webp`,
        thumbnailPath: `/designed/thumbs/${spec.slug}.webp`,
      }),
      NOW,
    );
    catalog = saved.catalog;
    const design = catalog.designs.find((item) => item.slug === spec.slug);
    assert.ok(design);
    design.mockups = [readyMockup(design.imagePath, design.thumbnailPath)];
  }

  const expected = ["beta", "gamma", "alpha"];
  assert.deepEqual(
    queryDesigns(catalog, { categoryId, pageSize: 10 }).items.map((design) => design.slug),
    expected,
  );
  assert.deepEqual(
    queryPublicDesigns(catalog, { categoryId, pageSize: 10 }).items.map((design) => design.slug),
    expected,
  );
  assert.deepEqual(
    queryDesigns(catalog, { pageSize: 10 }).items.map((design) => design.slug),
    ["alpha", "beta", "gamma"],
  );
});

test("moving a design updates category order and stops at the ends", () => {
  const created = createCategory(emptyCatalog(), {
    name: "الگو",
    slug: "patterns",
    parentId: null,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  const categoryId = created.category.id;
  let catalog = created.catalog;
  for (const spec of [
    { title: "اول", slug: "first", sortOrder: 1 },
    { title: "دوم", slug: "second", sortOrder: 2 },
    { title: "سوم", slug: "third", sortOrder: 3 },
  ]) {
    catalog = createDesign(
      catalog,
      writeInput({
        title: spec.title,
        slug: spec.slug,
        sortOrder: spec.sortOrder,
        featured: false,
        categoryIds: [categoryId],
        imagePath: `/designed/${spec.slug}.webp`,
        thumbnailPath: `/designed/thumbs/${spec.slug}.webp`,
      }),
      NOW,
    ).catalog;
  }
  for (const design of catalog.designs) {
    design.mockups = [readyMockup(design.imagePath, design.thumbnailPath)];
  }

  const blocked = createDesign(
    catalog,
    writeInput({
      title: "ویژه",
      slug: "featured",
      sortOrder: 0,
      featured: true,
      categoryIds: [categoryId],
      imagePath: "/designed/featured.webp",
      thumbnailPath: "/designed/thumbs/featured.webp",
    }),
    NOW,
  ).catalog;
  const featured = blocked.designs.find((design) => design.slug === "featured");
  const leading = blocked.designs.find((design) => design.slug === "first");
  assert.ok(featured);
  assert.ok(leading);
  const blockedOrders = blocked.designs.map((design) => design.sortOrder);
  assert.throws(
    () => moveDesign(blocked, leading.id, categoryId, -1),
    (error: unknown) => error instanceof CatalogError && error.status === 400,
  );
  assert.deepEqual(
    blocked.designs.map((design) => design.sortOrder),
    blockedOrders,
  );

  const ordersBefore = catalog.designs.map((design) => design.sortOrder);
  const first = catalog.designs.find((design) => design.slug === "first");
  const third = catalog.designs.find((design) => design.slug === "third");
  assert.ok(first);
  assert.ok(third);

  assert.throws(
    () => moveDesign(catalog, first.id, categoryId, -1),
    (error: unknown) => error instanceof CatalogError && error.status === 400,
  );
  assert.throws(
    () => moveDesign(catalog, third.id, categoryId, 1),
    (error: unknown) => error instanceof CatalogError && error.status === 400,
  );
  assert.deepEqual(
    catalog.designs.map((design) => design.sortOrder),
    ordersBefore,
  );

  const moved = moveDesign(catalog, third.id, categoryId, -1);
  assert.deepEqual(
    queryPublicDesigns(moved, { categoryId, pageSize: 10 }).items.map((design) => design.slug),
    ["first", "third", "second"],
  );
  assert.deepEqual(
    queryDesigns(moved, { categoryId, pageSize: 10 }).items.map((design) => design.slug),
    ["first", "third", "second"],
  );
  assert.equal(moved.designs.find((design) => design.slug === "second")?.sortOrder, 3);
  assert.equal(moved.designs.find((design) => design.slug === "third")?.sortOrder, 2);
});

test("moving past an equal sort order assigns a free neighboring number", () => {
  const created = createCategory(emptyCatalog(), {
    name: "الگو",
    slug: "patterns",
    parentId: null,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  const other = createCategory(created.catalog, {
    name: "دیگر",
    slug: "other",
    parentId: null,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  let catalog = createDesign(
    other.catalog,
    writeInput({
      title: "رزرو",
      slug: "taken",
      sortOrder: 4,
      featured: false,
      categoryIds: [other.category.id],
      imagePath: "/designed/taken.webp",
      thumbnailPath: "/designed/thumbs/taken.webp",
    }),
    NOW,
  ).catalog;
  catalog = createDesign(
    catalog,
    writeInput({
      title: "تازه",
      slug: "newer",
      sortOrder: 5,
      featured: false,
      categoryIds: [created.category.id],
      imagePath: "/designed/newer.webp",
      thumbnailPath: "/designed/thumbs/newer.webp",
    }),
    "2026-03-01T00:00:00.000Z",
  ).catalog;
  catalog = createDesign(
    catalog,
    writeInput({
      title: "قدیمی",
      slug: "older",
      sortOrder: 5,
      featured: false,
      categoryIds: [created.category.id],
      imagePath: "/designed/older.webp",
      thumbnailPath: "/designed/thumbs/older.webp",
    }),
    "2026-01-01T00:00:00.000Z",
  ).catalog;
  const older = catalog.designs.find((design) => design.slug === "older");
  assert.ok(older);

  const moved = moveDesign(catalog, older.id, created.category.id, -1);
  assert.equal(moved.designs.find((design) => design.slug === "older")?.sortOrder, 3);
  assert.equal(moved.designs.find((design) => design.slug === "newer")?.sortOrder, 5);
  assert.equal(moved.designs.find((design) => design.slug === "taken")?.sortOrder, 4);
});

test("fork copies taxonomy onto a new published artwork", () => {
  const category = createCategory(emptyCatalog(), {
    name: "انتزاعی",
    slug: "abstract",
    parentId: null,
    description: "",
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
  }, NOW);
  const created = createDesign(category.catalog, writeInput({
    categoryIds: [category.category.id],
    tags: ["گربه"],
    colors: ["آبی"],
    styles: ["مینیمال"],
  }), NOW);
  const forked = forkDesignFromArtwork(created.catalog, created.design.id, {
    imagePath: "/designed/edits/dsn_abc.webp",
    thumbnailPath: "/designed/edits/dsn_abc.thumb.webp",
    width: 800,
    height: 1600,
  }, NOW);

  assert.notEqual(forked.design.id, created.design.id);
  assert.equal(forked.design.title, "گربه فضایی (ویرایش)");
  assert.equal(forked.design.slug, "space-cat-edit");
  assert.equal(forked.design.status, "published");
  assert.equal(forked.design.featured, false);
  assert.deepEqual(forked.design.categoryIds, [category.category.id]);
  assert.deepEqual(forked.design.tags, ["گربه"]);
  assert.deepEqual(forked.design.colors, ["آبی"]);
  assert.deepEqual(forked.design.styles, ["مینیمال"]);
  assert.equal(forked.design.imagePath.startsWith("/designed/"), true);
  assert.equal(forked.design.templateSlug, forked.design.slug);
  assert.notEqual(forked.design.templateSlug, created.design.templateSlug);
  assert.equal(forked.design.width, 800);
  assert.equal(forked.design.height, 1600);
});

test("placement is stored on that design and a centered crop clears it", () => {
  const created = createDesign(emptyCatalog(), writeInput(), NOW);
  const mockup = readyMockup("/designed/mockups/space-cat/flat.webp", "/designed/mockups/space-cat/flat.thumb.webp");
  mockup.templateId = "flat-case";
  const saved = saveDesignPlacement(
    created.catalog,
    created.design.id,
    "flat-case",
    { focalX: 0.2, focalY: 0.8 },
    mockup,
    ["flat-case"],
    NOW,
  );
  assert.deepEqual(saved.design.placements?.["flat-case"], { focalX: 0.2, focalY: 0.8 });
  assert.equal(saved.design.mockups[0]?.templateId, "flat-case");

  const cleared = saveDesignPlacement(
    saved.catalog,
    saved.design.id,
    "flat-case",
    { focalX: 0.5, focalY: 0.5 },
    mockup,
    ["flat-case"],
    NOW,
  );
  assert.equal(cleared.design.placements, undefined);

  const zoomed = saveDesignPlacement(
    cleared.catalog,
    cleared.design.id,
    "flat-case",
    { focalX: 0.5, focalY: 0.5, zoom: 2 },
    mockup,
    ["flat-case"],
    NOW,
  );
  assert.deepEqual(zoomed.design.placements?.["flat-case"], { focalX: 0.5, focalY: 0.5, zoom: 2 });

  const reset = saveDesignPlacement(
    zoomed.catalog,
    zoomed.design.id,
    "flat-case",
    { focalX: 0.5, focalY: 0.5, zoom: 1 },
    mockup,
    ["flat-case"],
    NOW,
  );
  assert.equal(reset.design.placements, undefined);
  assert.throws(
    () => saveDesignPlacement(cleared.catalog, cleared.design.id, "other", { focalX: 0.1, focalY: 0.1 }, mockup, ["flat-case"], NOW),
    (error: unknown) => error instanceof CatalogError,
  );
});

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

function updateDesignStatusOnly(catalog: ReturnType<typeof emptyCatalog>, id: string) {
  const design = catalog.designs.find((item) => item.id === id);
  assert.ok(design);
  design.status = "published";
  design.publishedAt = NOW;
  return catalog;
}
