import assert from "node:assert/strict";
import test from "node:test";

import {
  categoryPageHeading,
  suggestedCategoryIntro,
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

test("generated descriptions stay in snippet range and avoid awkward repeats", () => {
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
    assert.equal(description.split("شاپ قاب").length - 1, 1, description);
    assert.equal(description.includes("طرح طرح"), false, description);
    assert.equal(/\s\S{1,2}$/.test(description), false, description);
  }
});

test("category and filter copy targets خرید قاب searches", () => {
  assert.equal(suggestedCategorySeoTitle("انتزاعی"), "خرید قاب موبایل طرح انتزاعی");
  assert.equal(suggestedCategorySeoTitle("طرح مینیمال"), "خرید قاب موبایل طرح مینیمال");
  assert.equal(suggestedCollectionSeoTitle("طرح‌های خاص و کمیاب", "rare"), "خرید قاب خاص");
  assert.equal(
    suggestedCollectionSeoTitle("طرح‌های اختصاصی ShopGhab", "shopghab-exclusive"),
    "طرح اختصاصی قاب موبایل",
  );
  assert.equal(suggestedCollectionSeoTitle("پرفروش‌ترین‌ها", "bestsellers"), "پرفروش‌ترین قاب موبایل");
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
    assert.ok(description.includes("خرید قاب موبایل") || description.includes("قاب موبایل"), description);
    assert.equal(description.split("شاپ قاب").length - 1, 1, description);
    assert.equal(description.includes("طرح طرح"), false, description);
  }
});

test("alt text names the design and the shop without طرح قاب duplication", () => {
  assert.equal(suggestedDesignAlt("طرح قاب اسلامی"), "طرح قاب موبایل اسلامی — شاپ قاب");
  assert.equal(suggestedDesignAlt("برگ نخل"), "طرح قاب موبایل برگ نخل — شاپ قاب");
});

test("category page heading stays human while intro mentions dual offer", () => {
  assert.equal(categoryPageHeading("هنر ایرانی"), "هنر ایرانی");
  const intro = suggestedCategoryIntro("انیمه", "فانتزی");
  assert.ok(intro.includes("انیمه"));
  assert.ok(intro.includes("اختصاصی") || intro.includes("آماده"));
});
