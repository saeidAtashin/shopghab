import assert from "node:assert/strict";
import test from "node:test";

import { createAttribute, createCategory, emptyCatalog } from "./logic";
import { relatedFilterSuggestions } from "./related-filters";
import { seedCatalogTaxonomy } from "./taxonomy";

const NOW = "2026-01-01T00:00:00.000Z";

test("relatedFilterSuggestions offers typography language chips without auto-selecting", () => {
  const seeded = seedCatalogTaxonomy(emptyCatalog(), NOW).catalog;
  const typography = seeded.categories.find((category) => category.slug === "typography");
  assert.ok(typography);

  const suggestions = relatedFilterSuggestions({
    catalog: seeded,
    categoryIds: [typography.id],
    attributeValueIds: [],
  });

  const slugs = suggestions.map((item) => `${item.groupSlug}:${item.valueSlug}`);
  assert.ok(slugs.includes("language:fa"));
  assert.ok(slugs.includes("characteristics:text"));
  assert.ok(slugs.includes("image-types:typography"));
});

test("relatedFilterSuggestions skips already selected values", () => {
  const seeded = seedCatalogTaxonomy(emptyCatalog(), NOW).catalog;
  const text = seeded.attributeValues.find(
    (value) =>
      value.slug === "text" &&
      seeded.attributeGroups.find((group) => group.id === value.groupId)?.slug === "characteristics",
  );
  const typographyStyle = seeded.attributeValues.find(
    (value) =>
      value.slug === "typography" &&
      seeded.attributeGroups.find((group) => group.id === value.groupId)?.slug === "visual-styles",
  );
  assert.ok(text && typographyStyle);

  const suggestions = relatedFilterSuggestions({
    catalog: seeded,
    attributeValueIds: [typographyStyle.id, text.id],
  });

  assert.equal(
    suggestions.some((item) => item.id === text.id || item.id === typographyStyle.id),
    false,
  );
  assert.ok(suggestions.some((item) => item.groupSlug === "language"));
});

test("relatedFilterSuggestions respects availableValueIds scope", () => {
  let catalog = createAttribute(emptyCatalog(), { kind: "group", name: "سبک", slug: "visual-styles" }, NOW);
  const styleGroup = catalog.attributeGroups[0];
  assert.ok(styleGroup);
  catalog = createAttribute(catalog, { kind: "value", groupId: styleGroup.id, name: "رترو" }, NOW);
  catalog = createAttribute(catalog, { kind: "group", name: "حال", slug: "mood" }, NOW);
  const moodGroup = catalog.attributeGroups.find((group) => group.slug === "mood");
  assert.ok(moodGroup);
  catalog = createAttribute(catalog, { kind: "value", groupId: moodGroup.id, name: "نوستالژیک" }, NOW);

  const retro = catalog.attributeValues.find((value) => value.name === "رترو");
  const nostalgic = catalog.attributeValues.find((value) => value.name === "نوستالژیک");
  assert.ok(retro && nostalgic);
  retro.slug = "retro";
  nostalgic.slug = "nostalgic";

  const parent = createCategory(
    catalog,
    {
      name: "رترو",
      slug: "retro",
      parentId: null,
      description: "",
      seoTitle: "",
      seoDescription: "",
      coverImage: "",
      status: "active",
    },
    NOW,
  );

  const open = relatedFilterSuggestions({
    catalog: parent.catalog,
    categoryIds: [parent.category.id],
    attributeValueIds: [],
    availableValueIds: new Set([nostalgic.id]),
  });
  assert.deepEqual(
    open.map((item) => item.id),
    [nostalgic.id],
  );

  const closed = relatedFilterSuggestions({
    catalog: parent.catalog,
    categoryIds: [parent.category.id],
    attributeValueIds: [],
    availableValueIds: new Set(),
  });
  assert.equal(closed.length, 0);
});
