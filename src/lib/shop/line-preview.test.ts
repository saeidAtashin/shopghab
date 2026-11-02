import assert from "node:assert/strict";
import test from "node:test";

import { linePreview, linePreviews } from "./line-preview";

test("ready cases use the catalog image", () => {
  const preview = linePreview({ kind: "ready", productId: "ready-001", qty: 1 });
  assert.equal(preview?.src, "/cases/ready/nebula.jpg");
  assert.match(preview?.alt ?? "", /کهکشان/);
});

test("stored responses omit data-url previews", () => {
  const item = {
    kind: "custom" as const,
    designId: "d1",
    previewUrl: "data:image/png;base64,aaaa",
    qty: 1,
    unitPrice: 1,
    title: "قاب من",
    brandSlug: "apple",
    modelSlug: "iphone-15",
    caseTypeSlug: "clear",
  };
  assert.equal(linePreview(item), null);
  assert.equal(linePreviews([item]).length, 0);
  assert.equal(linePreview(item, { allowData: true })?.src, item.previewUrl);
});

test("catalog paths stay zoomable", () => {
  const preview = linePreview({
    kind: "catalog",
    templateSlug: "nebula",
    previewUrl: "/designed/nebula.png",
    qty: 1,
    unitPrice: 1,
    title: "سحابی",
    brandSlug: "apple",
    modelSlug: "iphone-15",
    caseTypeSlug: "clear",
  });
  assert.equal(preview?.src, "/designed/nebula.png");
  assert.equal(preview?.alt, "سحابی");
});
