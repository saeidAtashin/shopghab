import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { writePsdBuffer } from "ag-psd";
import sharp from "sharp";

import { validateMockupTemplates } from "./config";
import { buildPrintableTexture } from "./composite";
import { selectProductImages } from "./display";
import { templateForDesign } from "./generate";
import { MockupError } from "./errors";
import { artworkFullyInside, aspectPreserved, containPlacement, filledTextureSize } from "./fit";
import { inspectPsdBuffer } from "./inspect";
import { publishValidatedWebp } from "./output";
import { artworkAbsolutePath, mockupPublicPaths, resolveInside } from "./paths";
import { mergeMockupRecords, renderDesignTemplates, shouldReuseOutput } from "./render";
import { summarizeMockups } from "./status";
import type { MockupRecord, MockupTemplateConfig } from "./types";
import { warpImage } from "./warp";

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

test("each design keeps one stable mockup template", () => {
  const templates = [
    placementTemplate({ id: "cover", default: true }),
    placementTemplate({ id: "case", default: false }),
    placementTemplate({ id: "pro", default: false }),
    placementTemplate({ id: "perspective", default: false }),
  ];
  const chosen = templateForDesign("dsn_one", templates);
  assert.equal(templateForDesign("dsn_one", templates).id, chosen.id);
  const ids = new Set(
    ["dsn_one", "dsn_two", "dsn_three", "dsn_four", "dsn_five", "dsn_six", "dsn_seven", "dsn_eight"].map(
      (id) => templateForDesign(id, templates).id,
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
