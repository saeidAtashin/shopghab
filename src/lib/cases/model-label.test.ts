import assert from "node:assert/strict";
import test from "node:test";

import { modelPickerName } from "./model-label";

test("picker names drop the parent brand and keep the line", () => {
  assert.deepEqual(
    modelPickerName({ brandSlug: "apple", name: "آیفون ۱۷ پرو", nameEn: "iPhone 17 Pro" }),
    { name: "۱۷ پرو", nameEn: "17 Pro" },
  );
  assert.deepEqual(
    modelPickerName({ brandSlug: "samsung", name: "گلکسی S25 Ultra", nameEn: "Galaxy S25 Ultra" }),
    { name: "S25 Ultra", nameEn: "S25 Ultra" },
  );
  assert.deepEqual(
    modelPickerName({ brandSlug: "xiaomi", name: "شیائومی ۱۵", nameEn: "Xiaomi 15" }),
    { name: "۱۵", nameEn: "15" },
  );
  assert.deepEqual(
    modelPickerName({ brandSlug: "xiaomi", name: "ردمی نوت ۱۴", nameEn: "Redmi Note 14" }),
    { name: "ردمی نوت ۱۴", nameEn: "Redmi Note 14" },
  );
  assert.deepEqual(
    modelPickerName({ brandSlug: "huawei", name: "پورا ۷۰", nameEn: "Pura 70" }),
    { name: "پورا ۷۰", nameEn: "Pura 70" },
  );
});
