import assert from "node:assert/strict";
import test from "node:test";

import {
  autoFlagsForDesign,
  designSlugBase,
  emptyDesignAutoFlags,
  resolveDesignAutos,
  type DesignAutoSource,
} from "./design-autofill";
import { suggestedDesignSeoTitle } from "./seo-copy";

const source: DesignAutoSource = {
  title: "طرح انار",
  titleEn: "",
  slug: "anar-file",
  templateSlug: "anar-file",
  imagePath: "/designed/anar.webp",
  thumbnailPath: "/designed/anar.webp",
  description: "",
  shortDescription: "",
  seoTitle: "",
  seoDescription: "",
  alt: "",
  ogImage: "",
  tags: ["یلدا"],
};

test("slug prefers an English title, then a latin filename, then Persian transliteration", () => {
  assert.equal(designSlugBase({ title: "طرح انار", titleEn: "Space Cat" }), "space-cat");
  assert.equal(designSlugBase({ title: "space_cat.webp", titleEn: "" }), "space-cat-webp");
  assert.equal(designSlugBase({ title: "طرح انار", titleEn: "" }), "trh-anar");
  assert.equal(designSlugBase({ title: "طرح ۱۲", titleEn: "" }), "trh-12");
  assert.equal(designSlugBase({ title: "!!!", titleEn: "", templateSlug: "moon_art" }), "moon-art");
  assert.equal(designSlugBase({ title: "", titleEn: "", templateSlug: "" }), "design");
  assert.match(designSlugBase({ title: "گربه فضایی", titleEn: "" }), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

test("empty seo and description stay automatic, and a custom title does not", () => {
  const flags = autoFlagsForDesign(source, "طبیعت");
  assert.equal(flags.slug, true);
  assert.equal(flags.seoTitle, false);
  assert.equal(flags.seoDescription, false);
  assert.equal(flags.description, false);
  assert.equal(flags.shortDescription, false);
  assert.equal(flags.alt, false);
  assert.equal(flags.thumbnailPath, false);
  assert.equal(flags.ogImage, false);

  const custom = autoFlagsForDesign({ ...source, seoTitle: "عنوان خاص", alt: "متن جایگزین اختصاصی" });
  assert.equal(custom.seoTitle, true);
  assert.equal(custom.alt, true);
});

test("automatic fields follow the title until they are customized", () => {
  const flags = emptyDesignAutoFlags();
  flags.titleEn = true;
  const withEnglish = resolveDesignAutos(
    { ...source, titleEn: "Anar", slug: "", categoryName: "طبیعت" },
    flags,
  );
  assert.equal(withEnglish.slug, "anar");
  assert.equal(withEnglish.templateSlug, "anar");
  assert.equal(withEnglish.seoTitle, suggestedDesignSeoTitle("طرح انار"));
  assert.match(withEnglish.description, /^طرح انار —/);
  assert.equal(withEnglish.shortDescription, withEnglish.description);
  assert.equal(withEnglish.ogImage, "/designed/anar.webp");
  assert.match(withEnglish.seoDescription, /طبیعت/);

  const persian = resolveDesignAutos({ ...source, titleEn: "", slug: "" }, emptyDesignAutoFlags());
  assert.equal(persian.slug, "trh-anar");

  const kept = resolveDesignAutos(
    { ...source, seoTitle: "عنوان خاص" },
    { ...emptyDesignAutoFlags(), slug: true, seoTitle: true },
  );
  assert.equal(kept.slug, "anar-file");
  assert.equal(kept.seoTitle, "عنوان خاص");
});
