import assert from "node:assert/strict";
import test from "node:test";

import {
  suggestedCategorySeoDescription,
  suggestedCategorySeoTitle,
  suggestedCollectionSeoDescription,
  suggestedCollectionSeoTitle,
  suggestedDesignAlt,
  suggestedDesignSeoDescription,
  suggestedDesignSeoTitle,
  suggestedFilterSeoDescription,
  suggestedFilterSeoTitle,
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

test("category and filter copy targets خرید قاب searches", () => {
  assert.equal(suggestedCategorySeoTitle("انتزاعی"), "خرید قاب موبایل طرح انتزاعی");
  assert.equal(suggestedCollectionSeoTitle("طرح‌های خاص و کمیاب", "rare"), "خرید قاب خاص");
  assert.equal(
    suggestedCollectionSeoTitle("طرح‌های اختصاصی ShopGhab", "shopghab-exclusive"),
    "طرح اختصاصی قاب موبایل",
  );
  assert.equal(suggestedFilterSeoTitle("colors", "مشکی"), "خرید قاب موبایل مشکی");
  assert.equal(suggestedFilterSeoTitle("visual-styles", "مینیمال"), "خرید قاب گوشی طرح مینیمال");
  assert.equal(suggestedFilterSeoTitle("mood", "شاد"), "قاب موبایل شاد");

  const descriptions = [
    suggestedCategorySeoDescription("مینیمال", "minimal", "انتزاعی و مینیمال"),
    suggestedFilterSeoDescription("colors", "مشکی", "black"),
    suggestedFilterSeoDescription("visual-styles", "مینیمال", "minimal"),
    suggestedFilterSeoDescription("mood", "شاد", "happy"),
  ];
  for (const description of descriptions) {
    assert.ok(description.length >= 140 && description.length <= 160, description);
    assert.equal(description.split("خرید قاب موبایل").length - 1, 1, description);
    assert.equal(description.split("قاب گوشی").length - 1, 1, description);
    assert.equal(description.split("شاپ قاب").length - 1, 1, description);
    assert.equal(description.includes("طرح طرح"), false, description);
  }
});

test("alt text names the design and the shop", () => {
  assert.equal(suggestedDesignAlt("طرح قاب اسلامی"), "طرح قاب موبایل طرح قاب اسلامی — شاپ قاب");
});
