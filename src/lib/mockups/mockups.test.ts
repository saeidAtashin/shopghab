import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { writePsdBuffer } from "ag-psd";
import sharp from "sharp";

import { validateMockupTemplates } from "./config";
import { applyLinearBurn, buildPrintableTexture, compositePrepared } from "./composite";
import { selectProductImages } from "./display";
import { templatesForDesign } from "./generate";
import { MockupError } from "./errors";
import { artworkFullyInside, aspectPreserved, containPlacement, filledTextureSize } from "./fit";
import { inspectPsdBuffer } from "./inspect";
import { opaqueBoundsFillRectangle, placementCorners, quadIsAxisAligned } from "./placement";
import { publishValidatedWebp } from "./output";
import { artworkAbsolutePath, mockupPublicPaths, resolveInside } from "./paths";
import { mergeMockupRecords, renderDesignTemplates, shouldReuseOutput } from "./render";
import { splitPrintStack, envelopeMesh } from "./stack";
import { summarizeMockups } from "./status";
import type { MockupRecord, MockupTemplateConfig } from "./types";
import { warpImage, warpMesh } from "./warp";

function removeTemp(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
  } catch {
    // Windows can keep a freshly written image locked for a moment.
  }
}

const NOW = "2026-03-01T00:00:00.000Z";

function placementTemplate(overrides: Partial<MockupTemplateConfig> = {}): MockupTemplateConfig {
  return {
    id: "flat-case",
    name: "Flat case",
    psdPath: "psd/flat.psd",
    enabled: true,
    renderer: "prepared",
    version: "1",
    default: true,
    output: { width: 80, height: 80, quality: 80, thumbEdge: 32 },
    printable: { width: 40, height: 40, origin: { x: 0, y: 0 } },
    maskPath: null,
    basePath: "prepared/flat/base.png",
    shadePath: null,
    highlightPath: null,
    displacementPath: null,
    displacementScale: 0,
    fit: "contain",
    listing: true,
    fill: { strategy: "solid", color: "#ffffff" },
    cornerRadius: 0,
    ...overrides,
  };
}

async function pixel(buffer: Buffer, x: number, y: number): Promise<[number, number, number, number]> {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const index = (y * info.width + x) * info.channels;
  return [data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0, data[index + 3] ?? 0];
}

async function artworkPng(): Promise<Buffer> {
  const width = 20;
  const height = 40;
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      data[index] = 0;
      data[index + 1] = 180;
      data[index + 2] = 0;
      data[index + 3] = 255;
    }
  }
  data[0] = 255;
  data[1] = 0;
  data[2] = 0;
  data[3] = 255;
  const last = ((height - 1) * width + (width - 1)) * 4;
  data[last] = 0;
  data[last + 1] = 0;
  data[last + 2] = 255;
  data[last + 3] = 255;
  const hole = (20 * width + 10) * 4;
  data[hole + 3] = 0;
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

test("contain fit keeps the full artwork and its aspect ratio", () => {
  const wide = containPlacement(200, 100, 100, 100);
  const tall = containPlacement(20, 40, 40, 40);
  assert.equal(aspectPreserved(wide), true);
  assert.equal(aspectPreserved(tall), true);
  assert.equal(artworkFullyInside(wide), true);
  assert.equal(artworkFullyInside(tall), true);
  assert.equal(wide.scale, 0.5);
  assert.equal(tall.scale, 1);
  assert.deepEqual(filledTextureSize(wide), { width: 100, height: 100 });
  assert.deepEqual(filledTextureSize(tall), { width: 40, height: 40 });
  assert.equal(wide.placedWidth, 100);
  assert.equal(wide.placedHeight, 50);
  assert.equal(tall.placedWidth, 20);
  assert.equal(tall.placedHeight, 40);
});

test("different templates keep their own printable regions", () => {
  const studio = containPlacement(100, 100, 300, 150);
  const angled = containPlacement(100, 100, 80, 200);
  assert.equal(studio.regionWidth, 300);
  assert.equal(angled.regionHeight, 200);
  assert.equal(studio.placedWidth, 150);
  assert.equal(studio.placedHeight, 150);
  assert.equal(angled.placedWidth, 80);
  assert.equal(angled.placedHeight, 80);
});

test("template paths cannot escape the mockup or public directories", () => {
  const root = join(tmpdir(), "mockup-root");
  assert.throws(() => resolveInside(root, "../secret.png"), MockupError);
  assert.throws(() => resolveInside(root, "prepared/../../secret.png"), MockupError);
  assert.throws(() => mockupPublicPaths("../slug", "flat-case"), MockupError);
  assert.throws(() => mockupPublicPaths("space-cat", "../flat"), MockupError);
  assert.throws(() => artworkAbsolutePath(root, "/designed/../../secret.webp"), MockupError);
  assert.throws(() => artworkAbsolutePath(root, "/tmp/secret.webp"), MockupError);
});

test("enabled templates need exactly one default", () => {
  const root = join(tmpdir(), "templates");
  assert.doesNotThrow(() => validateMockupTemplates([], root));
  assert.throws(() =>
    validateMockupTemplates(
      [placementTemplate({ id: "a", default: true }), placementTemplate({ id: "b", default: true })],
      root,
    ),
  );
  assert.doesNotThrow(() =>
    validateMockupTemplates([placementTemplate({ enabled: false, printable: { width: 0, height: 0 } })], root),
  );
});

test("solid fill covers the printable bars without cropping or stretching the artwork", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mockup-fit-"));
  try {
    const artPath = join(dir, "art.png");
    writeFileSync(artPath, await artworkPng());
    const texture = await buildPrintableTexture(artPath, 40, 40, { strategy: "solid", color: "#ffffff" });
    const meta = await sharp(texture).metadata();
    assert.equal(meta.width, 40);
    assert.equal(meta.height, 40);
    const topLeft = await pixel(texture, 10, 0);
    const bottomRight = await pixel(texture, 29, 39);
    const bar = await pixel(texture, 2, 20);
    const hole = await pixel(texture, 20, 20);
    assert.deepEqual(topLeft.slice(0, 3), [255, 0, 0]);
    assert.deepEqual(bottomRight.slice(0, 3), [0, 0, 255]);
    assert.ok(bar[0] > 240 && bar[1] > 240 && bar[2] > 240);
    assert.equal(hole[3], 0);
  } finally {
    removeTemp(dir);
  }
});

test("edge extension fills empty bars and blur keeps both artwork corners", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mockup-fill-"));
  try {
    const artPath = join(dir, "art.png");
    writeFileSync(artPath, await artworkPng());
    const extended = await buildPrintableTexture(artPath, 40, 40, { strategy: "edge-extend" });
    const edge = await pixel(extended, 2, 10);
    assert.ok(edge[3] > 200);
    assert.deepEqual((await pixel(extended, 10, 0)).slice(0, 3), [255, 0, 0]);
    assert.deepEqual((await pixel(extended, 29, 39)).slice(0, 3), [0, 0, 255]);

    const blurred = await buildPrintableTexture(artPath, 40, 40, { strategy: "blur", sigma: 1 });
    const blurBar = await pixel(blurred, 2, 20);
    assert.ok(blurBar[3] > 200);
    assert.deepEqual((await pixel(blurred, 10, 0)).slice(0, 3), [255, 0, 0]);
    assert.deepEqual((await pixel(blurred, 29, 39)).slice(0, 3), [0, 0, 255]);
  } finally {
    removeTemp(dir);
  }
});

test("cover fit fills the print height and crops a wide artwork", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mockup-cover-"));
  try {
    const width = 80;
    const height = 20;
    const data = Buffer.alloc(width * height * 4, 255);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        data[index] = x < width / 2 ? 255 : 0;
        data[index + 1] = y === 0 ? 40 : y === height - 1 ? 200 : 0;
        data[index + 2] = x < width / 2 ? 0 : 255;
      }
    }
    const artPath = join(dir, "wide.png");
    writeFileSync(artPath, await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer());

    const regionWidth = 40;
    const regionHeight = 40;
    const scale = Math.max(regionWidth / width, regionHeight / height);
    assert.equal(height * scale, regionHeight);
    assert.ok(width * scale > regionWidth);

    const texture = await buildPrintableTexture(artPath, regionWidth, regionHeight, { strategy: "solid", color: "#ffffff" }, "cover");
    const meta = await sharp(texture).metadata();
    assert.equal(meta.width, regionWidth);
    assert.equal(meta.height, regionHeight);
    const top = await pixel(texture, 20, 0);
    const bottom = await pixel(texture, 20, regionHeight - 1);
    assert.equal(top[3], 255);
    assert.equal(bottom[3], 255);
    assert.ok(top[1] > 20 && top[1] < 80);
    assert.ok(bottom[1] > 150);
  } finally {
    removeTemp(dir);
  }
});

test("the print mask keeps the artwork inside the case and hides it outside", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mockup-mask-"));
  try {
    const { mkdirSync } = await import("node:fs");
    const root = join(dir, "templates");
    mkdirSync(join(root, "prepared"), { recursive: true });
    const size = 80;
    const mask = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const inside = x >= 20 && x < 60 && y >= 20 && y < 60;
        const index = (y * size + x) * 4;
        mask[index] = inside ? 255 : 0;
        mask[index + 1] = inside ? 255 : 0;
        mask[index + 2] = inside ? 255 : 0;
        mask[index + 3] = inside ? 255 : 0;
      }
    }
    await sharp(mask, { raw: { width: size, height: size, channels: 4 } }).png().toFile(join(root, "prepared", "mask.png"));
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 1 } },
    })
      .png()
      .toFile(join(root, "prepared", "base.png"));
    const art = Buffer.alloc(40 * 40 * 4, 255);
    for (let pixelIndex = 0; pixelIndex < 40 * 40; pixelIndex += 1) {
      art[pixelIndex * 4] = 220;
      art[pixelIndex * 4 + 1] = 10;
      art[pixelIndex * 4 + 2] = 10;
    }
    const artPath = join(dir, "art.png");
    await sharp(art, { raw: { width: 40, height: 40, channels: 4 } }).png().toFile(artPath);

    const template = placementTemplate({
      maskPath: "prepared/mask.png",
      basePath: "prepared/base.png",
      printable: { width: 40, height: 40, origin: { x: 20, y: 20 } },
      fit: "cover",
    });
    const outputPath = join(dir, "out.webp");
    await compositePrepared({
      artworkPath: artPath,
      template,
      templateRoot: root,
      outputPath,
      thumbPath: join(dir, "thumb.webp"),
    });

    const output = readFileSync(outputPath);
    const inside = await pixel(output, 40, 40);
    const outside = await pixel(output, 4, 4);
    assert.ok(inside[3] > 200);
    assert.ok(inside[0] > 180);
    assert.ok(inside[2] < 40);
    assert.ok(outside[3] > 200);
    assert.ok(outside[2] > 180);
    assert.ok(outside[0] < 40);
  } finally {
    removeTemp(dir);
  }
});

test("a failed template does not block a valid one, and success requires a real WebP", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "mockup-render-"));
  try {
    const artDir = join(cwd, "public", "designed");
    const baseDir = join(cwd, "mockup-templates", "prepared", "flat");
    const { mkdirSync } = await import("node:fs");
    mkdirSync(artDir, { recursive: true });
    mkdirSync(baseDir, { recursive: true });
    await sharp(await artworkPng()).webp().toFile(join(artDir, "art.webp"));
    await sharp({
      create: { width: 80, height: 80, channels: 3, background: { r: 30, g: 30, b: 30 } },
    })
      .png()
      .toFile(join(baseDir, "base.png"));

    const good = placementTemplate();
    const broken = placementTemplate({
      id: "broken-case",
      name: "Broken",
      default: false,
      printable: { width: 30, height: 50, origin: { x: 4, y: 4 } },
      maskPath: "prepared/missing/mask.png",
      fill: { strategy: "solid", color: "#112233" },
    });
    const records = await renderDesignTemplates({
      cwd,
      slug: "space-cat",
      artworkPublicPath: "/designed/art.webp",
      templates: [good, broken],
      previous: [],
      now: NOW,
    });
    assert.equal(records[0]?.status, "ready", records[0]?.error);
    assert.equal(records[0]?.width, 80);
    assert.equal(records[0]?.height, 80);
    assert.equal(records[0]?.error, "");
    assert.equal(records[1]?.status, "error");
    assert.equal(records[1]?.path, "");
    const output = join(cwd, "public", "designed", "mockups", "space-cat", "flat-case.webp");
    const meta = await sharp(output).metadata();
    assert.equal(meta.format, "webp");
    assert.equal(meta.width, 80);
    assert.ok(!readFileSync(output).equals(Buffer.alloc(0)));

    const again = await renderDesignTemplates({
      cwd,
      slug: "space-cat",
      artworkPublicPath: "/designed/art.webp",
      templates: [good],
      previous: records,
      now: "2026-04-01T00:00:00.000Z",
    });
    assert.equal(again[0]?.generatedAt, NOW);
    assert.equal(again[0]?.contentHash, records[0]?.contentHash);
    assert.equal(shouldReuseOutput({
      previous: records[0],
      contentHash: records[0]?.contentHash ?? "",
      templateVersion: "1",
      outputValid: true,
    }), true);
  } finally {
    removeTemp(cwd);
  }
});

test("an invalid new file does not replace a valid WebP", async () => {
  const dir = mkdtempSync(join(tmpdir(), "mockup-publish-"));
  try {
    const finalPath = join(dir, "final.webp");
    const tempPath = join(dir, "temp.webp");
    await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .webp()
      .toFile(finalPath);
    const before = readFileSync(finalPath);
    writeFileSync(tempPath, "not an image");
    await assert.rejects(() => publishValidatedWebp(tempPath, finalPath), MockupError);
    assert.deepEqual(readFileSync(finalPath), before);
  } finally {
    removeTemp(dir);
  }
});

test("placement uses the non-affine corners when Photoshop stored a rotated quad", () => {
  const upright = [0, 0, 10, 0, 10, 20, 0, 20];
  const rotated = [4, 1, 12, 6, 7, 18, 0, 13];
  assert.deepEqual(placementCorners({ transform: upright, nonAffineTransform: rotated }), rotated);
  assert.deepEqual(placementCorners({ transform: upright }), upright);
  assert.equal(
    quadIsAxisAligned([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
      { x: 0, y: 20 },
    ]),
    true,
  );
  assert.equal(
    quadIsAxisAligned([
      { x: rotated[0] ?? 0, y: rotated[1] ?? 0 },
      { x: rotated[2] ?? 0, y: rotated[3] ?? 0 },
      { x: rotated[4] ?? 0, y: rotated[5] ?? 0 },
      { x: rotated[6] ?? 0, y: rotated[7] ?? 0 },
    ]),
    false,
  );
});

test("a straight mask fills its rectangle and a tilted silhouette does not", () => {
  const straight = Buffer.alloc(6 * 6 * 4, 0);
  for (let y = 1; y <= 4; y += 1) {
    for (let x = 1; x <= 3; x += 1) straight[(y * 6 + x) * 4 + 3] = 255;
  }
  assert.equal(opaqueBoundsFillRectangle(straight, 6, 6), true);
  straight[(4 * 6 + 1) * 4 + 3] = 40;
  assert.equal(opaqueBoundsFillRectangle(straight, 6, 6), true);

  const tilted = Buffer.alloc(7 * 7 * 4, 0);
  for (const [x, y] of [
    [3, 1],
    [4, 2],
    [5, 3],
    [4, 4],
    [3, 5],
    [2, 4],
    [1, 3],
    [2, 2],
    [3, 3],
  ]) {
    tilted[(y * 7 + x) * 4 + 3] = 255;
  }
  assert.equal(opaqueBoundsFillRectangle(tilted, 7, 7), false);
});

test("rotated quad maps the artwork top-left onto the first corner", () => {
  const data = Buffer.alloc(8 * 8 * 4, 0);
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const index = (y * 8 + x) * 4;
      const topLeft = x < 3 && y < 3;
      data[index] = topLeft ? 255 : 0;
      data[index + 1] = topLeft ? 0 : 180;
      data[index + 3] = 255;
    }
  }
  const quad: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
    { x: 8, y: 2 },
    { x: 11, y: 5 },
    { x: 6, y: 10 },
    { x: 3, y: 7 },
  ];
  const warped = warpImage({ data, width: 8, height: 8 }, quad, 12, 12);
  assert.equal(warped.data[3], 0);
  const inside = (3 * 12 + 7) * 4;
  assert.ok((warped.data[inside + 3] ?? 0) > 200);
  assert.ok((warped.data[inside] ?? 0) > (warped.data[inside + 1] ?? 0));
});

test("perspective warp keeps source color inside the quad and transparency outside it", () => {
  const data = Buffer.alloc(4 * 4 * 4, 0);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 255;
    data[index + 3] = 255;
  }
  const warped = warpImage(
    { data, width: 4, height: 4 },
    [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 6 },
      { x: 2, y: 6 },
    ],
    8,
    8,
  );
  assert.equal(warped.data[3], 0);
  const inside = (4 * 8 + 4) * 4;
  assert.ok((warped.data[inside + 3] ?? 0) > 200);
  assert.ok((warped.data[inside] ?? 0) > 200);
});

test("each design keeps three stable phone mockups", () => {
  const templates = [
    placementTemplate({ id: "cover", default: true, listing: true }),
    placementTemplate({ id: "case", default: false, listing: true }),
    placementTemplate({ id: "pro", default: false, listing: true }),
    placementTemplate({ id: "perspective", default: false, listing: false }),
    placementTemplate({ id: "hand", default: false, listing: true }),
  ];
  const chosen = templatesForDesign("dsn_one", templates, "case");
  assert.deepEqual(
    templatesForDesign("dsn_one", templates, "case").map((template) => template.id),
    chosen.map((template) => template.id),
  );
  assert.equal(chosen[0]?.id, "case");
  assert.equal(chosen.length, 3);
  assert.equal(new Set(chosen.map((template) => template.id)).size, 3);
  assert.ok(chosen.every((template) => template.id !== "perspective"));

  const replaced = templatesForDesign("dsn_two", templates, "perspective");
  assert.notEqual(replaced[0]?.id, "perspective");
  assert.deepEqual(
    replaced.map((template) => template.id),
    templatesForDesign("dsn_two", templates).map((template) => template.id),
  );
  const ids = new Set(
    ["dsn_one", "dsn_two", "dsn_three", "dsn_four", "dsn_five", "dsn_six", "dsn_seven", "dsn_eight"].map(
      (id) => templatesForDesign(id, templates)[0]?.id,
    ),
  );
  assert.ok(ids.size > 1);
});

test("storefront uses the first ready mockup and keeps editorial gallery frames", () => {
  const images = selectProductImages({
    imagePath: "/designed/art.webp",
    thumbnailPath: "/designed/thumbs/art.webp",
    gallery: ["/designed/extra.webp"],
    width: 100,
    height: 200,
    alt: "",
    title: "space-cat",
    mockups: [
      {
        templateId: "flat-case",
        path: "/designed/mockups/space-cat/flat-case.webp",
        thumbPath: "/designed/mockups/space-cat/flat-case.thumb.webp",
        width: 80,
        height: 80,
        contentHash: "a",
        templateVersion: "1",
        generatedAt: NOW,
        status: "ready",
        error: "",
      },
      {
        templateId: "broken-case",
        path: "",
        thumbPath: "",
        width: 0,
        height: 0,
        contentHash: "",
        templateVersion: "1",
        generatedAt: NOW,
        status: "error",
        error: "ماسک قالب آماده نیست",
      },
    ],
  });
  assert.equal(images.hero, "/designed/mockups/space-cat/flat-case.webp");
  assert.equal(images.thumb, "/designed/mockups/space-cat/flat-case.thumb.webp");
  assert.deepEqual(images.frames, [
    {
      src: "/designed/mockups/space-cat/flat-case.webp",
      thumb: "/designed/mockups/space-cat/flat-case.thumb.webp",
    },
  ]);
  assert.deepEqual(images.gallery, ["/designed/extra.webp"]);
  assert.equal(images.alt, "طرح قاب space-cat");
  assert.equal(images.width, 80);
});

test("mockup records merge without dropping an untouched template", () => {
  const previous: MockupRecord[] = [
    {
      templateId: "old-case",
      path: "/designed/mockups/space-cat/old-case.webp",
      thumbPath: "/designed/mockups/space-cat/old-case.thumb.webp",
      width: 10,
      height: 10,
      contentHash: "old",
      templateVersion: "1",
      generatedAt: NOW,
      status: "ready",
      error: "",
    },
  ];
  const merged = mergeMockupRecords(previous, [
    {
      templateId: "flat-case",
      path: "/designed/mockups/space-cat/flat-case.webp",
      thumbPath: "/designed/mockups/space-cat/flat-case.thumb.webp",
      width: 80,
      height: 80,
      contentHash: "new",
      templateVersion: "1",
      generatedAt: NOW,
      status: "ready",
      error: "",
    },
  ]);
  assert.deepEqual(
    merged.map((item) => item.templateId),
    ["flat-case", "old-case"],
  );
});

test("status reports missing, outdated, and failed templates without file paths", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "mockup-status-"));
  try {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(join(cwd, "public", "designed", "mockups", "space-cat"), { recursive: true });
    await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .webp()
      .toFile(join(cwd, "public", "designed", "art.webp"));
    await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 9, g: 9, b: 9 } },
    })
      .webp()
      .toFile(join(cwd, "public", "designed", "mockups", "space-cat", "flat-case.webp"));
    await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 9, g: 9, b: 9 } },
    })
      .webp()
      .toFile(join(cwd, "public", "designed", "mockups", "space-cat", "flat-case.thumb.webp"));
    const report = await summarizeMockups({
      cwd,
      templates: [placementTemplate(), placementTemplate({ id: "second-case", default: false })],
      designs: [
        {
          slug: "space-cat",
          imagePath: "/designed/art.webp",
          assetMissing: false,
          mockups: [
            {
              templateId: "flat-case",
              path: "/designed/mockups/space-cat/flat-case.webp",
              thumbPath: "/designed/mockups/space-cat/flat-case.thumb.webp",
              width: 80,
              height: 80,
              contentHash: "stale",
              templateVersion: "1",
              generatedAt: NOW,
              status: "ready",
              error: "",
            },
          ],
        },
      ],
    });
    assert.equal(report.summary.outdated, 1);
    assert.equal(report.summary.missing, 1);
    assert.equal(report.issues.some((issue) => issue.kind === "outdated" && issue.templateId === "flat-case"), true);
    assert.equal(JSON.stringify(report).includes(cwd), false);
  } finally {
    removeTemp(cwd);
  }
});

test("PSD inspection does not invent a Smart Object", () => {
  const buffer = writePsdBuffer({
    width: 8,
    height: 8,
    children: [{ name: "Background" }, { name: "Print" }],
  });
  const report = inspectPsdBuffer(buffer);
  assert.equal(report.smartObjectCount, 0);
  assert.equal(report.printableCandidates.length, 0);
  assert.equal(report.layers.some((layer) => layer.name === "Print"), true);
});

test("photoshop renderer stays unsuccessful when Photoshop is not configured", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "mockup-ps-"));
  const previous = process.env.PHOTOSHOP_EXE;
  delete process.env.PHOTOSHOP_EXE;
  try {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(join(cwd, "public", "designed"), { recursive: true });
    mkdirSync(join(cwd, "mockup-templates", "psd"), { recursive: true });
    await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 1, g: 2, b: 3 } },
    })
      .webp()
      .toFile(join(cwd, "public", "designed", "art.webp"));
    writeFileSync(join(cwd, "mockup-templates", "psd", "flat.psd"), "not-a-real-render");
    const records = await renderDesignTemplates({
      cwd,
      slug: "space-cat",
      artworkPublicPath: "/designed/art.webp",
      templates: [
        placementTemplate({
          renderer: "photoshop",
          printable: { width: 10, height: 20, smartObjectName: "Print" },
          basePath: null,
        }),
      ],
      previous: [],
      now: NOW,
    });
    assert.equal(records[0]?.status, "error");
    assert.match(records[0]?.error ?? "", /فتوشاپ/);
    assert.equal(records[0]?.path, "");
  } finally {
    if (previous === undefined) delete process.env.PHOTOSHOP_EXE;
    else process.env.PHOTOSHOP_EXE = previous;
    removeTemp(cwd);
  }
});

function solidPixels(width: number, height: number, rgba: [number, number, number, number]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) data.set(rgba, pixelIndex * 4);
  return { width, height, data };
}

function maskPixels(width: number, height: number, on: (x: number, y: number) => boolean) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      data[index] = on(x, y) ? 255 : 0;
      data[index + 3] = 255;
    }
  }
  return { width, height, data };
}

function smartObject(id: string) {
  return {
    id,
    type: "raster" as const,
    transform: [0, 0, 4, 0, 4, 4, 0, 4],
    width: 10,
    height: 20,
    warp: { style: "none" as const },
  };
}

test("a hidden Print smart object is the design slot and its twin is left out of the base", async () => {
  const stack = await splitPrintStack({
    width: 4,
    height: 4,
    smartObjectName: "[YOUR IMAGE HERE] - Print",
    layers: [
      { name: "Photo", left: 0, top: 0, imageData: solidPixels(4, 4, [210, 0, 0, 255]) },
      {
        name: "[YOUR IMAGE HERE] - Embossed",
        left: 0,
        top: 0,
        placedLayer: smartObject("shared"),
        imageData: solidPixels(4, 4, [0, 0, 220, 255]),
      },
      {
        name: "[YOUR IMAGE HERE] - Print",
        hidden: true,
        placedLayer: smartObject("shared"),
        mask: { left: 0, top: 0, defaultColor: 0, imageData: maskPixels(4, 4, (x, y) => x === 0 && y === 0) },
      },
      {
        name: "Shadow",
        blendMode: "linear burn",
        left: 2,
        top: 2,
        imageData: solidPixels(1, 1, [0, 0, 0, 255]),
      },
    ],
  });
  assert.ok(stack);
  assert.equal(stack.name, "[YOUR IMAGE HERE] - Print");
  assert.equal(stack.width, 10);
  assert.equal(stack.height, 20);
  const base = await pixel(stack.base, 0, 0);
  assert.ok(base[0] > 180);
  assert.ok(base[2] < 40);
  const hole = await pixel(stack.mask, 0, 0);
  const outside = await pixel(stack.mask, 1, 0);
  assert.ok(hole[3] > 200);
  assert.ok(outside[3] < 20);
  assert.equal(stack.overlays.length, 1);
  assert.equal(stack.overlays[0]?.name, "Shadow");
  assert.equal(stack.overlays[0]?.blend, "linear-burn");
  const shadow = await pixel(stack.overlays[0]?.png ?? Buffer.alloc(0), 2, 2);
  assert.ok(shadow[3] > 200);
});

test("the parent group mask clips the case color and the Print mask", async () => {
  const stack = await splitPrintStack({
    width: 4,
    height: 4,
    smartObjectName: "Print",
    layers: [
      { name: "Photo", left: 0, top: 0, imageData: solidPixels(4, 4, [210, 0, 0, 255]) },
      {
        name: "Phone Case",
        blendMode: "pass through",
        mask: { left: 0, top: 0, defaultColor: 0, imageData: maskPixels(4, 4, (x) => x >= 2) },
        children: [
          { name: "Change Case Color", left: 0, top: 0, imageData: solidPixels(4, 4, [0, 170, 0, 255]) },
          {
            name: "Print",
            hidden: true,
            placedLayer: smartObject("case"),
            mask: { left: 0, top: 0, defaultColor: 0, imageData: maskPixels(4, 4, () => true) },
          },
        ],
      },
    ],
  });
  assert.ok(stack);
  const open = await pixel(stack.base, 0, 0);
  const covered = await pixel(stack.base, 3, 0);
  assert.ok(open[0] > 180);
  assert.ok(open[1] < 40);
  assert.ok(covered[1] > 140);
  assert.ok(covered[0] < 40);
  const maskedOut = await pixel(stack.mask, 0, 0);
  const maskedIn = await pixel(stack.mask, 3, 0);
  assert.ok(maskedOut[3] < 20);
  assert.ok(maskedIn[3] > 200);
});

test("a clipping layer above the print is clipped to the layer under it", async () => {
  const stack = await splitPrintStack({
    width: 2,
    height: 2,
    smartObjectName: "Print",
    layers: [
      { name: "Paper", left: 0, top: 0, imageData: solidPixels(2, 2, [180, 0, 0, 255]) },
      {
        name: "Print",
        hidden: true,
        placedLayer: {
          id: "print",
          type: "raster",
          transform: [0, 0, 2, 0, 2, 2, 0, 2],
          width: 4,
          height: 8,
          warp: { style: "none" },
        },
        mask: { left: 0, top: 0, defaultColor: 0, imageData: maskPixels(2, 2, () => true) },
      },
      {
        name: "Cameras Ring",
        left: 0,
        top: 0,
        imageData: (() => {
          const data = new Uint8ClampedArray(2 * 2 * 4);
          data[3] = 255;
          data[0] = 255;
          data[1] = 255;
          data[2] = 255;
          return { width: 2, height: 2, data };
        })(),
      },
      { name: "Change Ring Color", clipping: true, left: 0, top: 0, imageData: solidPixels(2, 2, [0, 0, 200, 255]) },
    ],
  });
  assert.ok(stack);
  assert.equal(stack.overlays.map((overlay) => overlay.name).join(","), "Cameras Ring,Change Ring Color");
  const tint = stack.overlays[1]?.png ?? Buffer.alloc(0);
  const inside = await pixel(tint, 0, 0);
  const outside = await pixel(tint, 1, 0);
  assert.ok(inside[2] > 150);
  assert.ok(inside[3] > 200);
  assert.ok(outside[3] < 20);
});

test("a styled warp is not a placement and a custom grid is", () => {
  assert.equal(envelopeMesh({ style: "arc", value: 30 }), null);
  const grid = envelopeMesh({
    style: "custom",
    deformNumCols: 2,
    deformNumRows: 2,
    customEnvelopeWarp: {
      meshPoints: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
    },
  });
  assert.equal(grid?.columns, 2);
  assert.equal(grid?.rows, 2);
  assert.equal(grid?.points.length, 4);
});

test("the Web Tag is left out and the shadow and highlight stay above the design", async () => {
  const stack = await splitPrintStack({
    width: 2,
    height: 2,
    smartObjectName: "Design",
    layers: [
      { name: "Background", left: 0, top: 0, imageData: solidPixels(2, 2, [40, 40, 40, 255]) },
      {
        name: "Design",
        placedLayer: {
          id: "design",
          type: "raster",
          transform: [0, 0, 2, 0, 2, 2, 0, 2],
          width: 4,
          height: 8,
          warp: { style: "none" },
        },
        mask: { left: 0, top: 0, defaultColor: 0, imageData: maskPixels(2, 2, () => true) },
      },
      { name: "Shadows", blendMode: "multiply", left: 0, top: 0, imageData: solidPixels(2, 2, [0, 0, 0, 255]) },
      { name: "Highlights", blendMode: "screen", left: 0, top: 0, imageData: solidPixels(2, 2, [255, 255, 255, 255]) },
      { name: "Web Tag", left: 0, top: 0, imageData: solidPixels(2, 2, [255, 0, 0, 255]) },
    ],
  });
  assert.ok(stack);
  assert.equal(stack.name, "Design");
  assert.deepEqual(
    stack.overlays.map((overlay) => overlay.blend),
    ["multiply", "screen"],
  );
  assert.equal(stack.overlays.some((overlay) => overlay.name === "Web Tag"), false);
});

test("a 2x2 mesh moves the artwork corner with that grid point", () => {
  const data = Buffer.alloc(4 * 4 * 4, 255);
  for (let pixelIndex = 0; pixelIndex < 16; pixelIndex += 1) data[pixelIndex * 4] = 220;
  const moved = warpMesh(
    { data, width: 4, height: 4 },
    2,
    2,
    [
      { x: 0, y: 2 },
      { x: 3, y: 0 },
      { x: 0, y: 3 },
      { x: 3, y: 3 },
    ],
    4,
    4,
  );
  assert.equal(moved.data[3], 0);
  const lower = (2 * 4 + 1) * 4;
  assert.ok((moved.data[lower] ?? 0) > 180);
  assert.ok((moved.data[lower + 3] ?? 0) > 200);
});

test("a complete custom envelope stays the print slot with the light above it", async () => {
  const stack = await splitPrintStack({
    width: 2,
    height: 2,
    smartObjectName: "YOUR DESIGN HERE",
    layers: [
      { name: "Photo", left: 0, top: 0, imageData: solidPixels(2, 2, [10, 10, 10, 255]) },
      {
        name: "YOUR DESIGN HERE",
        placedLayer: {
          id: "path",
          type: "raster",
          transform: [0, 0, 2, 0, 2, 2, 0, 2],
          width: 4,
          height: 8,
          warp: {
            style: "custom",
            deformNumCols: 2,
            deformNumRows: 2,
            customEnvelopeWarp: {
              meshPoints: [
                { x: 0, y: 0 },
                { x: 4, y: 0 },
                { x: 0, y: 8 },
                { x: 4, y: 8 },
              ],
            },
          },
        },
        mask: { left: 0, top: 0, defaultColor: 0, imageData: maskPixels(2, 2, () => true) },
      },
      { name: "Light", blendMode: "screen", left: 0, top: 0, imageData: solidPixels(1, 1, [255, 255, 255, 255]) },
    ],
  });
  assert.ok(stack);
  assert.equal(stack.name, "YOUR DESIGN HERE");
  assert.equal(stack.mesh?.columns, 2);
  assert.equal(stack.mesh?.points.length, 4);
  assert.equal(stack.overlays[0]?.name, "Light");
  assert.equal(stack.overlays[0]?.blend, "screen");
});

test("a mesh warp is not treated as a four-corner print slot", async () => {
  const stack = await splitPrintStack({
    width: 2,
    height: 2,
    smartObjectName: "Print",
    layers: [
      {
        name: "Print",
        placedLayer: {
          id: "mesh",
          type: "raster",
          transform: [0, 0, 2, 0, 2, 2, 0, 2],
          width: 4,
          height: 4,
          warp: { style: "arc", value: 30 },
        },
      },
    ],
  });
  assert.equal(stack, null);
});

test("linear burn darkens the artwork and stays above it", async () => {
  const burned = await applyLinearBurn(
    await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: 200, g: 200, b: 200, alpha: 1 } } }).png().toBuffer(),
    await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: 100, g: 100, b: 100, alpha: 1 } } }).png().toBuffer(),
  );
  const burnPixel = await pixel(burned, 0, 0);
  assert.ok(burnPixel[0] < 80);
  assert.ok(burnPixel[0] > 20);

  const dir = mkdtempSync(join(tmpdir(), "mockup-overlay-"));
  try {
    const { mkdirSync } = await import("node:fs");
    const root = join(dir, "templates");
    mkdirSync(join(root, "prepared"), { recursive: true });
    await sharp({ create: { width: 8, height: 8, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
      .png()
      .toFile(join(root, "prepared", "base.png"));
    await sharp({ create: { width: 8, height: 8, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
      .png()
      .toFile(join(root, "prepared", "shadow.png"));
    const artPath = join(dir, "art.png");
    await sharp({
      create: { width: 8, height: 8, channels: 4, background: { r: 220, g: 20, b: 20, alpha: 1 } },
    })
      .png()
      .toFile(artPath);
    await compositePrepared({
      artworkPath: artPath,
      template: placementTemplate({
        output: { width: 8, height: 8, quality: 90, thumbEdge: 4 },
        printable: { width: 8, height: 8, origin: { x: 0, y: 0 } },
        basePath: "prepared/base.png",
        fit: "cover",
        overlays: [{ path: "prepared/shadow.png", blend: "linear-burn" }],
      }),
      templateRoot: root,
      outputPath: join(dir, "out.webp"),
      thumbPath: join(dir, "thumb.webp"),
    });
    const output = await pixel(readFileSync(join(dir, "out.webp")), 4, 4);
    assert.ok(output[0] < 40);
  } finally {
    removeTemp(dir);
  }
});

test("an unknown overlay blend is rejected", () => {
  const root = mkdtempSync(join(tmpdir(), "mockup-overlay-config-"));
  assert.throws(
    () =>
      validateMockupTemplates(
        [placementTemplate({ overlays: [{ path: "prepared/shadow.png", blend: "hue" as "normal" }] })],
        root,
      ),
    /unknown overlay blend/,
  );
  removeTemp(root);
});
