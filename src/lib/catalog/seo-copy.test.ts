import assert from "node:assert/strict";
import test from "node:test";

import {
  suggestedCategorySeoDescription,
  suggestedCategorySeoTitle,
  suggestedCollectionSeoDescription,
  suggestedDesignAlt,
  suggestedDesignSeoDescription,
  suggestedDesignSeoTitle,
} from "./seo-copy";

test("design SEO title stays within the snippet length and names the product", () => {
  const title = suggestedDesignSeoTitle("طرح قاب انتزاعی 1164");
  assert.ok(title.includes("قاب"));
  assert.ok(title.length <= 60);
  assert.equal(title, "طرح قاب انتزاعی 1164 برای قاب موبایل");
});

test("long design titles keep the قاب موبایل ending", () => {
  const title = suggestedDesignSeoTitle(
    "طرح قاب انتزاعی Abstract Background Of Overlapping Geometric Triangle Pattern",
  );
  assert.ok(title.endsWith("برای قاب موبایل"));
  assert.ok(title.length <= 60);
});

test("generated descriptions mention the shop and the query once each", () => {
  const samples = [
    suggestedDesignSeoDescription({
      title: "طرح قاب انتزاعی 1164",
      slug: "1164",
      categoryName: "انتزاعی",
      tags: ["انتزاعی", "سایر"],
    }),
    suggestedCategorySeoDescription("مینیمال", "minimal", "انتزاعی و مینیمال"),
    suggestedCollectionSeoDescription("یلدا", "yalda"),
  ];
  for (const description of samples) {
    assert.ok(description.length >= 140 && description.length <= 160, description);
    assert.equal(description.split("فروش قاب موبایل").length - 1, 1, description);
    assert.equal(description.split("شاپ قاب").length - 1, 1, description);
    assert.equal(description.includes("طرح طرح"), false, description);
    assert.equal(/\s\S{1,2}$/.test(description), false, description);
  }
});

test("category titles use the قاب موبایل طرح pattern", () => {
  assert.equal(suggestedCategorySeoTitle("انتزاعی"), "قاب موبایل طرح انتزاعی");
});

test("alt text names the design and the shop", () => {
  assert.equal(suggestedDesignAlt("طرح قاب اسلامی"), "طرح قاب موبایل طرح قاب اسلامی — شاپ قاب");
});
