import assert from "node:assert/strict";
import test from "node:test";

import { PHONE_MODELS } from "./brands.static";
import { GLASSBACK_CASE_BACKS } from "./glassback/case-backs.generated";
import { toCaseGeometry } from "./glassback/to-case-geometry";
import { validateModelGeometry } from "./phone-back";
import { getSeriesForBrand } from "./series";
import type { MmCircle, MmRect } from "./types";

const PRINT_SAFE = { top: 0.05, right: 0.04, bottom: 0.06, left: 0.04 } as const;

function circleInside(circle: MmCircle, rect: MmRect): boolean {
  return (
    circle.cx - circle.r >= rect.x - 0.05 &&
    circle.cy - circle.r >= rect.y - 0.05 &&
    circle.cx + circle.r <= rect.x + rect.width + 0.05 &&
    circle.cy + circle.r <= rect.y + rect.height + 0.05
  );
}

function rectInside(inner: MmRect, outer: MmRect): boolean {
  return (
    inner.x >= outer.x - 0.05 &&
    inner.y >= outer.y - 0.05 &&
    inner.x + inner.width <= outer.x + outer.width + 0.05 &&
    inner.y + inner.height <= outer.y + outer.height + 0.05
  );
}

test("fold phones are not in the catalog", () => {
  assert.equal(
    PHONE_MODELS.some((model) => /z-fold|z-flip/.test(model.slug)),
    false,
  );
  assert.equal(
    getSeriesForBrand("samsung").some((series) => /z-fold|z-flip/.test(series.slug)),
    false,
  );
});

test("measured case windows keep every camera inside one rectangle", () => {
  const slugs = Object.keys(GLASSBACK_CASE_BACKS);
  assert.ok(slugs.length >= 37);

  for (const slug of slugs) {
    const model = PHONE_MODELS.find((item) => item.slug === slug);
    assert.ok(model, slug);
    assert.equal(model.back?.chassisTemplate.startsWith("glassback:"), true);
    assert.deepEqual(validateModelGeometry(model), []);

    const back = model.back!;
    const module = back.camera.module;
    assert.ok(module.x >= -0.05 && module.y >= -0.05, slug);
    assert.ok(module.x + module.width <= model.widthMm + 0.05, slug);
    assert.ok(module.y + module.height <= model.heightMm + 0.05, slug);
    const shortSide = Math.min(module.width, module.height);
    const longSide = Math.max(module.width, module.height);
    assert.ok(module.cornerRadius! <= shortSide / 2 + 0.01, slug);
    assert.ok(
      longSide > shortSide + 1 || module.cornerRadius! < shortSide / 2 - 0.4,
      `${slug} camera window is a circle`,
    );

    for (const lens of back.camera.lenses) {
      assert.ok(circleInside(lens, module), `${slug} lens`);
    }
    if (back.camera.flash) assert.ok(rectInside(back.camera.flash, module), `${slug} flash`);
    if (back.camera.lidar) assert.ok(circleInside(back.camera.lidar, module), `${slug} lidar`);
  }
});

test("Galaxy S25 uses one tall camera rectangle, not a side-by-side pair", () => {
  const back = PHONE_MODELS.find((model) => model.slug === "galaxy-s25")!.back!;
  assert.equal(back.camera.lenses.length, 3);
  const xs = back.camera.lenses.map((lens) => lens.cx);
  assert.ok(Math.max(...xs) - Math.min(...xs) < 1);
  assert.ok(back.camera.module.height > back.camera.module.width);
});

test("a phone without a camera island becomes a rounded rectangle", () => {
  const geometry = toCaseGeometry({
    slug: "sample",
    widthMm: 70,
    heightMm: 150,
    phone: {
      id: "sample",
      panels: [{ w: 68, h: 148, r: 8 }],
      lenses: [
        { kind: "wide", d: 12, x: 12, y: 14 },
        { kind: "flash", d: 4, x: 24, y: 14 },
      ],
      rects: [],
    },
    printSafeInsetRatio: PRINT_SAFE,
  });
  const module = geometry.camera.module;
  assert.equal(geometry.camera.lenses.length, 1);
  assert.ok(geometry.camera.flash);
  assert.ok(module.cornerRadius! <= 3);
  assert.ok(module.cornerRadius! < Math.min(module.width, module.height) / 2);
  assert.ok(circleInside(geometry.camera.lenses[0]!, module));
  assert.ok(rectInside(geometry.camera.flash!, module));
});

test("a MagSafe glass panel is not used as the camera window", () => {
  const geometry = toCaseGeometry({
    slug: "bar",
    widthMm: 72,
    heightMm: 150,
    phone: {
      id: "bar",
      panels: [{ w: 71, h: 149, r: 11 }],
      lenses: [
        { kind: "wide", d: 14, x: 14, y: 16 },
        { kind: "flash", d: 6, x: 40, y: 16 },
      ],
      rects: [
        { kind: "plateau", x: 4, y: 5, w: 50, h: 30, r: 10, label: "Camera plateau" },
        {
          kind: "other",
          x: 4,
          y: 40,
          w: 50,
          h: 70,
          r: 12,
          label: "Ceramic Shield glass window (MagSafe)",
        },
      ],
    },
    printSafeInsetRatio: PRINT_SAFE,
  });
  assert.ok(geometry.camera.module.height < 40);
  assert.equal(geometry.camera.module.cornerRadius, 10);
});
