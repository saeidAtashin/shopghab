import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = getArg("source-dir")
  ? join(ROOT, getArg("source-dir")!)
  : join(ROOT, "designed-source");
const DESIGNED_DIR = join(ROOT, "public", "designed");
const THUMBS_DIR = join(DESIGNED_DIR, "thumbs");
const META_PATH = join(DESIGNED_DIR, "designed.meta.json");
const MANIFEST_PATH = join(DESIGNED_DIR, "designed.manifest.json");
const TEMPLATES_OUT = join(ROOT, "src", "lib", "cases", "designed.templates.generated.ts");
const STICKERS_OUT = join(ROOT, "src", "lib", "cases", "designed.stickers.generated.ts");
const OG_DEFAULT_PATH = join(ROOT, "public", "cases", "og-default.jpg");

const REF_CANVAS = { width: 280, height: 560 } as const;
const SVG_SIZE_LIMIT_BYTES = 2 * 1024 * 1024;
const DEFAULT_STICKER_SIZE = 240;
const MAX_EXPORT_EDGE = 2048;
const THUMB_MAX_EDGE = 400;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

type DesignedMetaEntry = {
  title?: string;
  description?: string;
  tags?: string[];
  stickerSize?: number;
};

type DesignedMeta = Record<string, DesignedMetaEntry>;

type ManifestEntry = {
  slug: string;
  category: string;
  subcategory: string;
  sourceFile: string;
  sourceFormat: "eps" | "jpg-fallback";
  outputFormat: "svg" | "png" | "jpg" | "webp";
  outputPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  convertedAt: string;
  conversionMethod:
    | "inkscape-svg"
    | "inkscape-png"
    | "imagemagick"
    | "xmp-preview"
    | "jpg-fallback"
    | "sharp-webp";
};

type ToolPaths = {
  inkscape?: string;
  magick?: string;
  ghostscriptBin?: string;
};

type SourceCandidate = {
  slug: string;
  path: string;
  format: "eps" | "jpg";
  category: string;
  subcategory: string;
};

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg?.slice(prefix.length);
}

function slugFromFilename(filename: string): string {
  return basename(filename).replace(/\.(eps|jpe?g|jpg)$/i, "");
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function categoryFromRelativePath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  if (parts.length <= 1) return "general";
  return parts[0].toLowerCase();
}

function subcategoryFromBasename(filename: string): string {
  const base = slugFromFilename(filename);
  const match = base.match(/^vecteezy_([^_-]+)/i);
  return match ? match[1].toLowerCase() : "others";
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    abstract: "انتزاعی",
    islamic: "اسلامی",
    general: "عمومی",
  };
  return labels[category] ?? titleFromSlug(category);
}

function subcategoryLabel(subcategory: string): string {
  if (subcategory === "others") return "سایر";
  return titleFromSlug(subcategory);
}

function titleFromBasename(filename: string): string {
  let slug = slugFromFilename(filename);
  if (/^vecteezy_/i.test(slug)) {
    slug = slug.replace(/^vecteezy_/i, "");
    slug = slug.replace(/_\d+(-\d+)?$/, "");
    slug = slug.replace(/_+$/, "");
  }
  return titleFromSlug(slug);
}

function readMeta(): DesignedMeta {
  if (!existsSync(META_PATH)) return {};
  try {
    return JSON.parse(readFileSync(META_PATH, "utf8")) as DesignedMeta;
  } catch {
    console.warn(`Warning: could not parse ${META_PATH}, using defaults.`);
    return {};
  }
}

function findExecutable(
  customPath: string | undefined,
  defaults: string[],
  commandName: string,
): string | undefined {
  const candidates = [customPath, ...defaults].filter(Boolean) as string[];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [commandName], {
      stdio: "pipe",
    });
    return commandName;
  } catch {
    return undefined;
  }
}

function resolveTools(): ToolPaths {
  const inkscape = findExecutable(
    getArg("inkscape-path") ??
      (process.platform === "win32"
        ? "C:\\Program Files\\Inkscape\\bin\\inkscape.exe"
        : "inkscape"),
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Inkscape\\bin\\inkscape.exe",
          "C:\\Program Files (x86)\\Inkscape\\bin\\inkscape.exe",
        ]
      : ["/usr/bin/inkscape", "/usr/local/bin/inkscape"],
    "inkscape",
  );

  const magick = findExecutable(
    getArg("magick-path"),
    process.platform === "win32"
      ? ["C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe"]
      : ["/usr/bin/magick", "/usr/local/bin/magick"],
    "magick",
  );

  const ghostscript = findExecutable(
    getArg("ghostscript-path"),
    process.platform === "win32"
      ? (() => {
          const found: string[] = [];
          const scoopPath = join(
            process.env.USERPROFILE ?? "",
            "scoop",
            "apps",
            "ghostscript",
            "current",
            "bin",
            "gswin64c.exe",
          );
          if (existsSync(scoopPath)) found.push(scoopPath);

          const roots = ["C:\\Program Files\\gs", "C:\\Program Files (x86)\\gs"];
          for (const root of roots) {
            if (!existsSync(root)) continue;
            for (const dir of readdirSync(root)) {
              const bin = join(root, dir, "bin", "gswin64c.exe");
              if (existsSync(bin)) found.push(bin);
            }
          }
          return found;
        })()
      : ["/usr/bin/gs", "/usr/local/bin/gs"],
    process.platform === "win32" ? "gswin64c" : "gs",
  );

  return {
    inkscape,
    magick,
    ghostscriptBin: ghostscript ? dirname(ghostscript) : undefined,
  };
}

function runWithPath(
  command: string,
  args: string[],
  extraPath?: string,
): { ok: boolean; error?: string } {
  const env = { ...process.env };
  if (extraPath) {
    env.PATH = `${extraPath}${process.platform === "win32" ? ";" : ":"}${env.PATH ?? ""}`;
  }

  const result = spawnSync(command, args, { stdio: "pipe", env, encoding: "utf8" });
  if (result.status === 0) return { ok: true };
  return {
    ok: false,
    error: [result.stderr, result.stdout].filter(Boolean).join("\n").trim(),
  };
}

function parseEpsBoundingBox(epsPath: string): { width: number; height: number } | null {
  const head = readFileSync(epsPath, "utf8").slice(0, 4096);
  const match = head.match(/%%BoundingBox:\s*(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)/);
  if (!match) return null;
  const width = Number(match[3]) - Number(match[1]);
  const height = Number(match[4]) - Number(match[2]);
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

function computeExportSize(
  bbox: { width: number; height: number } | null,
): { width: number; height: number } {
  if (!bbox) {
    return { width: MAX_EXPORT_EDGE, height: MAX_EXPORT_EDGE };
  }

  const longest = Math.max(bbox.width, bbox.height);
  if (longest <= MAX_EXPORT_EDGE) {
    return { width: Math.round(bbox.width), height: Math.round(bbox.height) };
  }

  const scale = MAX_EXPORT_EDGE / longest;
  return {
    width: Math.round(bbox.width * scale),
    height: Math.round(bbox.height * scale),
  };
}

function parseSvgDimensions(svgPath: string): { width: number; height: number } {
  const content = readFileSync(svgPath, "utf8");
  const viewBoxMatch = content.match(/viewBox=["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { width: parts[2], height: parts[3] };
    }
  }

  const widthMatch = content.match(/\bwidth=["']([\d.]+)/i);
  const heightMatch = content.match(/\bheight=["']([\d.]+)/i);
  if (widthMatch && heightMatch) {
    return { width: Number(widthMatch[1]), height: Number(heightMatch[1]) };
  }

  return { width: REF_CANVAS.width, height: REF_CANVAS.height };
}

async function getImageDimensions(
  imagePath: string,
): Promise<{ width: number; height: number }> {
  const meta = await sharp(imagePath).metadata();
  return {
    width: meta.width ?? REF_CANVAS.width,
    height: meta.height ?? REF_CANVAS.height,
  };
}

function extractXmpPreview(
  epsPath: string,
  slug: string,
): { outputPath: string; dimensions: { width: number; height: number } } | null {
  const content = readFileSync(epsPath, "utf8");
  const imageMatch = content.match(/<xmpGImg:image>([\s\S]*?)<\/xmpGImg:image>/);
  const formatMatch = content.match(/<xmpGImg:format>([\s\S]*?)<\/xmpGImg:format>/);
  if (!imageMatch) return null;

  const format = formatMatch?.[1]?.trim().toUpperCase() ?? "JPEG";
  const encoded = imageMatch[1]
    .replace(/&#xA;/g, "")
    .replace(/\s+/g, "")
    .trim();
  const binary = Buffer.from(encoded, "base64");

  const ext = format === "JPEG" || format === "JPG" ? ".jpg" : ".png";
  const outputPath = join(DESIGNED_DIR, `${slug}${ext}`);
  writeFileSync(outputPath, binary);

  return { outputPath, dimensions: { width: REF_CANVAS.width, height: REF_CANVAS.height } };
}

function tryInkscapeExport(
  tools: ToolPaths,
  inputPath: string,
  outputPath: string,
  type: "svg" | "png",
  exportSize: { width: number; height: number },
): boolean {
  if (!tools.inkscape) return false;

  const args =
    type === "svg"
      ? [inputPath, "--export-type=svg", `--export-filename=${outputPath}`]
      : [
          inputPath,
          "--export-type=png",
          `--export-filename=${outputPath}`,
          `--export-width=${exportSize.width}`,
          `--export-height=${exportSize.height}`,
        ];

  const result = runWithPath(tools.inkscape, args, tools.ghostscriptBin);
  return result.ok && existsSync(outputPath);
}

function tryMagickExport(
  tools: ToolPaths,
  inputPath: string,
  outputPath: string,
  exportSize: { width: number; height: number },
): boolean {
  if (!tools.magick) return false;

  const result = runWithPath(
    tools.magick,
    [
      "-density",
      "300",
      inputPath,
      "-background",
      "none",
      "-resize",
      `${exportSize.width}x${exportSize.height}`,
      outputPath,
    ],
    tools.ghostscriptBin,
  );
  return result.ok && existsSync(outputPath);
}

async function convertEpsFile(
  tools: ToolPaths,
  inputPath: string,
  slug: string,
): Promise<{
  outputFormat: ManifestEntry["outputFormat"];
  outputPath: string;
  dimensions: { width: number; height: number };
  conversionMethod: ManifestEntry["conversionMethod"];
}> {
  const svgPath = join(DESIGNED_DIR, `${slug}.svg`);
  const pngPath = join(DESIGNED_DIR, `${slug}.png`);
  const bbox = parseEpsBoundingBox(inputPath);
  const exportSize = computeExportSize(bbox);

  if (tryInkscapeExport(tools, inputPath, svgPath, "svg", exportSize)) {
    const svgSize = statSync(svgPath).size;
    if (svgSize <= SVG_SIZE_LIMIT_BYTES) {
      return {
        outputFormat: "svg",
        outputPath: svgPath,
        dimensions: parseSvgDimensions(svgPath),
        conversionMethod: "inkscape-svg",
      };
    }
    console.log(
      `  SVG is ${(svgSize / 1024 / 1024).toFixed(1)} MB — trying PNG export instead.`,
    );
  } else {
    console.log("  Inkscape SVG export unavailable or failed.");
  }

  if (tryInkscapeExport(tools, inputPath, pngPath, "png", exportSize)) {
    const dimensions = await getImageDimensions(pngPath);
    return {
      outputFormat: "png",
      outputPath: pngPath,
      dimensions,
      conversionMethod: "inkscape-png",
    };
  }

  if (tryMagickExport(tools, inputPath, pngPath, exportSize)) {
    const dimensions = await getImageDimensions(pngPath);
    return {
      outputFormat: "png",
      outputPath: pngPath,
      dimensions,
      conversionMethod: "imagemagick",
    };
  }

  if (!hasFlag("allow-preview-fallback")) {
    throw new Error(
      `Could not convert ${basename(inputPath)} at full quality. Ghostscript is required for EPS.\n` +
        `Run: npm run setup:ghostscript && npm run convert:designed\n` +
        `Or pass --allow-preview-fallback to use low-quality embedded previews (not recommended).`,
    );
  }

  console.warn(
    "  LOW QUALITY: using embedded XMP preview — install Ghostscript for full export.",
  );
  const preview = extractXmpPreview(inputPath, slug);
  if (!preview) {
    throw new Error(
      `Could not convert ${basename(inputPath)}. Install Ghostscript or add a JPG fallback in designed-source/.`,
    );
  }

  const dimensions = await getImageDimensions(preview.outputPath);
  return {
    outputFormat: preview.outputPath.endsWith(".jpg") ? "jpg" : "png",
    outputPath: preview.outputPath,
    dimensions,
    conversionMethod: "xmp-preview",
  };
}

async function convertJpgFallback(
  inputPath: string,
  slug: string,
): Promise<{
  outputFormat: ManifestEntry["outputFormat"];
  outputPath: string;
  dimensions: { width: number; height: number };
  conversionMethod: ManifestEntry["conversionMethod"];
}> {
  const webpPath = join(DESIGNED_DIR, `${slug}.webp`);
  const meta = await sharp(inputPath).metadata();
  const width = meta.width ?? MAX_EXPORT_EDGE;
  const height = meta.height ?? MAX_EXPORT_EDGE;
  const longest = Math.max(width, height);
  const resize =
    longest > MAX_EXPORT_EDGE
      ? {
          width: width >= height ? MAX_EXPORT_EDGE : undefined,
          height: height > width ? MAX_EXPORT_EDGE : undefined,
        }
      : undefined;

  await sharp(inputPath)
    .resize(resize)
    .webp({ quality: 85 })
    .toFile(webpPath);

  const dimensions = await getImageDimensions(webpPath);
  return {
    outputFormat: "webp",
    outputPath: webpPath,
    dimensions,
    conversionMethod: "jpg-fallback",
  };
}

async function generateThumbnail(
  sourcePath: string,
  slug: string,
): Promise<{ thumbnailPath: string; width: number; height: number }> {
  mkdirSync(THUMBS_DIR, { recursive: true });
  const thumbPath = join(THUMBS_DIR, `${slug}.webp`);
  await sharp(sourcePath)
    .resize({
      width: THUMB_MAX_EDGE,
      height: THUMB_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  const dimensions = await getImageDimensions(thumbPath);
  return {
    thumbnailPath: thumbPath,
    width: dimensions.width,
    height: dimensions.height,
  };
}

function walkSourceFiles(
  dir: string,
  relativeDir = "",
): Array<{ relativePath: string; absPath: string }> {
  const files: Array<{ relativePath: string; absPath: string }> = [];

  for (const name of readdirSync(dir)) {
    if (name === "README.md") continue;
    const absPath = join(dir, name);
    const relativePath = relativeDir ? join(relativeDir, name) : name;

    if (statSync(absPath).isDirectory()) {
      files.push(...walkSourceFiles(absPath, relativePath));
      continue;
    }

    if (/\.(eps|jpe?g)$/i.test(name)) {
      files.push({
        relativePath: relativePath.replace(/\\/g, "/"),
        absPath,
      });
    }
  }

  return files;
}

function discoverSources(): SourceCandidate[] {
  if (!existsSync(SOURCE_DIR)) {
    return [];
  }

  const allFiles = walkSourceFiles(SOURCE_DIR);
  const byKey = new Map<
    string,
    { slug: string; path: string; format: "eps" | "jpg"; category: string; subcategory: string }
  >();

  for (const file of allFiles) {
    const filename = basename(file.relativePath);
    const lower = filename.toLowerCase();
    const format: "eps" | "jpg" = lower.endsWith(".eps") ? "eps" : "jpg";
    const category = categoryFromRelativePath(file.relativePath);
    const subcategory = subcategoryFromBasename(filename);
    const baseSlug = slugFromFilename(filename);
    const key = `${category}/${baseSlug}`;

    const existing = byKey.get(key);
    if (!existing || (existing.format === "jpg" && format === "eps")) {
      byKey.set(key, {
        slug: baseSlug,
        path: file.absPath,
        format,
        category,
        subcategory,
      });
    }
  }

  const slugCategories = new Map<string, Set<string>>();
  for (const entry of byKey.values()) {
    const categories = slugCategories.get(entry.slug) ?? new Set<string>();
    categories.add(entry.category);
    slugCategories.set(entry.slug, categories);
  }

  const candidates: SourceCandidate[] = [];
  for (const entry of byKey.values()) {
    const hasCollision = (slugCategories.get(entry.slug)?.size ?? 0) > 1;
    candidates.push({
      slug: hasCollision ? `${entry.category}-${entry.slug}` : entry.slug,
      path: entry.path,
      format: entry.format,
      category: entry.category,
      subcategory: entry.subcategory,
    });
  }

  return candidates.sort((a, b) => a.slug.localeCompare(b.slug));
}

function coverLayerPlacement(
  assetWidth: number,
  assetHeight: number,
): { x: number; y: number; width: number; height: number } {
  const scaleX = REF_CANVAS.width / assetWidth;
  const scaleY = REF_CANVAS.height / assetHeight;
  const uniform = Math.max(scaleX, scaleY);
  const width = assetWidth * uniform;
  const height = assetHeight * uniform;
  return {
    x: (REF_CANVAS.width - width) / 2,
    y: (REF_CANVAS.height - height) / 2,
    width,
    height,
  };
}

function stickerDimensions(
  assetWidth: number,
  assetHeight: number,
  stickerSize: number,
): { width: number; height: number } {
  const aspect = assetWidth / assetHeight;
  if (aspect >= 1) {
    return { width: stickerSize, height: Math.round(stickerSize / aspect) };
  }
  return { width: Math.round(stickerSize * aspect), height: stickerSize };
}

function escapeString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toPublicPath(absolutePath: string): string {
  return `/${absolutePath
    .replace(/\\/g, "/")
    .replace(/^public\//, "")
    .replace(/^.*?\/public\//, "")}`;
}

function writeGeneratedFiles(entries: ManifestEntry[], meta: DesignedMeta): void {
  const templates = entries.map((entry) => {
    const metaEntry = meta[entry.slug] ?? {};
    const title = metaEntry.title ?? titleFromBasename(entry.sourceFile);
    const description =
      metaEntry.description ?? `طرح آماده ${title} — مناسب کاور گوشی`;
    const tags = metaEntry.tags ?? [
      categoryLabel(entry.category),
      subcategoryLabel(entry.subcategory),
      "طراحی آماده",
    ];
    const placement = coverLayerPlacement(entry.width, entry.height);
    const publicSrc = toPublicPath(join("public", entry.outputPath));
    const thumbnail = toPublicPath(join("public", entry.thumbnailPath));

    return {
      id: `designed-${entry.slug}`,
      slug: entry.slug,
      title,
      description,
      thumbnail,
      tags,
      category: entry.category,
      subcategory: entry.subcategory,
      publicSrc,
      placement,
    };
  });

  const templateTs = `// AUTO-GENERATED by scripts/convert-designed-eps.ts — do not edit manually.
import { DEFAULT_REFERENCE_CANVAS, type CaseTemplate } from "@/lib/design/types";

export const DESIGNED_TEMPLATES: CaseTemplate[] = [
${templates
  .map(
    (t) => `  {
    id: "${escapeString(t.id)}",
    slug: "${escapeString(t.slug)}",
    title: "${escapeString(t.title)}",
    description: "${escapeString(t.description)}",
    thumbnail: "${escapeString(t.thumbnail)}",
    tags: [${t.tags.map((tag) => `"${escapeString(tag)}"`).join(", ")}],
    category: "${escapeString(t.category)}",
    subcategory: "${escapeString(t.subcategory)}",
    referenceCanvas: DEFAULT_REFERENCE_CANVAS,
    layers: [
      {
        id: "designed-layer-${escapeString(t.slug)}",
        type: "image",
        src: "${escapeString(t.publicSrc)}",
        width: ${t.placement.width},
        height: ${t.placement.height},
        isSticker: false,
        name: "${escapeString(t.title)}",
        visible: true,
        x: ${t.placement.x},
        y: ${t.placement.y},
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
    ],
  }`,
  )
  .join(",\n")}
];
`;

  const stickerItems = entries.map((entry) => {
    const metaEntry = meta[entry.slug] ?? {};
    const title = metaEntry.title ?? titleFromBasename(entry.sourceFile);
    const stickerSize = metaEntry.stickerSize ?? DEFAULT_STICKER_SIZE;
    const dims = stickerDimensions(entry.width, entry.height, stickerSize);
    const publicSrc = toPublicPath(join("public", entry.outputPath));

    return {
      id: `designed-${entry.slug}`,
      name: title,
      src: publicSrc,
      width: dims.width,
      height: dims.height,
    };
  });

  const stickersTs = `// AUTO-GENERATED by scripts/convert-designed-eps.ts — do not edit manually.
import type { StickerPack } from "./types";

export const DESIGNED_STICKER_PACK: StickerPack = {
  id: "designed",
  category: "طراحی آماده",
  name: "طراحی‌های آماده",
  stickers: [
${stickerItems
  .map(
    (s) => `    {
      id: "${escapeString(s.id)}",
      name: "${escapeString(s.name)}",
      src: "${escapeString(s.src)}",
      width: ${s.width},
      height: ${s.height},
    }`,
  )
  .join(",\n")}
  ],
};
`;

  writeFileSync(TEMPLATES_OUT, templateTs, "utf8");
  writeFileSync(STICKERS_OUT, stickersTs, "utf8");
}

function writeEmptyGeneratedFiles(): void {
  writeFileSync(
    TEMPLATES_OUT,
    `// AUTO-GENERATED by scripts/convert-designed-eps.ts — do not edit manually.
import type { CaseTemplate } from "@/lib/design/types";

export const DESIGNED_TEMPLATES: CaseTemplate[] = [];
`,
    "utf8",
  );

  writeFileSync(
    STICKERS_OUT,
    `// AUTO-GENERATED by scripts/convert-designed-eps.ts — do not edit manually.
import type { StickerPack } from "./types";

export const DESIGNED_STICKER_PACK: StickerPack = {
  id: "designed",
  category: "طراحی آماده",
  name: "طراحی‌های آماده",
  stickers: [],
};
`,
    "utf8",
  );
}

async function ensureOgDefaultImage(): Promise<void> {
  if (existsSync(OG_DEFAULT_PATH)) return;

  mkdirSync(dirname(OG_DEFAULT_PATH), { recursive: true });

  const candidates = [
    join(ROOT, "public", "designed", "palm-tree-leaves.png"),
    join(ROOT, "public", "designed", "thumbs", "palm-tree-leaves.webp"),
  ];

  const source = candidates.find((path) => existsSync(path));
  if (!source) {
    await sharp({
      create: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        channels: 3,
        background: { r: 10, g: 10, b: 15 },
      },
    })
      .jpeg({ quality: 85 })
      .toFile(OG_DEFAULT_PATH);
    console.log(`Created placeholder OG image at ${OG_DEFAULT_PATH}`);
    return;
  }

  await sharp(source)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 85 })
    .toFile(OG_DEFAULT_PATH);
  console.log(`Created OG default image from ${basename(source)}`);
}

async function main(): Promise<void> {
  const tools = resolveTools();
  const meta = readMeta();
  mkdirSync(DESIGNED_DIR, { recursive: true });
  mkdirSync(THUMBS_DIR, { recursive: true });

  const sources = discoverSources();

  if (sources.length === 0) {
    console.log(`No source files found in ${SOURCE_DIR}. Writing empty catalogs.`);
    writeEmptyGeneratedFiles();
    writeFileSync(MANIFEST_PATH, JSON.stringify({ entries: [] }, null, 2), "utf8");
    await ensureOgDefaultImage();
    return;
  }

  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Found ${sources.length} design source(s).`);
  console.log("Conversion tools:");
  console.log(`  Inkscape: ${tools.inkscape ?? "not found"}`);
  console.log(`  ImageMagick: ${tools.magick ?? "not found"}`);
  console.log(`  Ghostscript: ${tools.ghostscriptBin ?? "not found"}`);

  const manifest: ManifestEntry[] = [];
  let skipped = 0;

  for (const source of sources) {
    console.log(`\nConverting ${basename(source.path)} (${source.format})...`);

    try {
      let converted: {
        outputFormat: ManifestEntry["outputFormat"];
        outputPath: string;
        dimensions: { width: number; height: number };
        conversionMethod: ManifestEntry["conversionMethod"];
      };

      if (source.format === "eps") {
        try {
          converted = await convertEpsFile(tools, source.path, source.slug);
        } catch (error) {
          const sourceDir = dirname(source.path);
          const baseSlug = basename(source.path).replace(/\.eps$/i, "");
          const jpgFallback = join(sourceDir, `${baseSlug}.jpg`);
          const jpegFallback = join(sourceDir, `${baseSlug}.jpeg`);
          const fallbackPath = [jpgFallback, jpegFallback].find((p) => existsSync(p));
          if (!fallbackPath) throw error;
          console.log(`  EPS failed — using JPG fallback: ${basename(fallbackPath)}`);
          converted = await convertJpgFallback(fallbackPath, source.slug);
        }
      } else {
        converted = await convertJpgFallback(source.path, source.slug);
      }

      const thumb = await generateThumbnail(converted.outputPath, source.slug);

      manifest.push({
        slug: source.slug,
        category: source.category,
        subcategory: source.subcategory,
        sourceFile: basename(source.path),
        sourceFormat: source.format === "eps" ? "eps" : "jpg-fallback",
        outputFormat: converted.outputFormat,
        outputPath: `designed/${basename(converted.outputPath)}`,
        thumbnailPath: `designed/thumbs/${source.slug}.webp`,
        width: converted.dimensions.width,
        height: converted.dimensions.height,
        convertedAt: new Date().toISOString(),
        conversionMethod: converted.conversionMethod,
      });

      console.log(
        `  → ${basename(converted.outputPath)} (${converted.dimensions.width}×${converted.dimensions.height}, ${converted.conversionMethod})`,
      );
      console.log(`  → thumb: ${basename(thumb.thumbnailPath)} (${thumb.width}×${thumb.height})`);
    } catch (error) {
      skipped += 1;
      console.warn(
        `  Skipped ${basename(source.path)}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  if (manifest.length === 0) {
    throw new Error("No designs were converted successfully.");
  }

  if (skipped > 0) {
    console.warn(`\nWarning: skipped ${skipped} source file(s) due to conversion errors.`);
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify({ entries: manifest }, null, 2), "utf8");
  writeGeneratedFiles(manifest, meta);
  await ensureOgDefaultImage();

  const totalBytes = manifest.reduce((sum, entry) => {
    const main = join(ROOT, "public", entry.outputPath);
    const thumb = join(ROOT, "public", entry.thumbnailPath);
    return (
      sum +
      (existsSync(main) ? statSync(main).size : 0) +
      (existsSync(thumb) ? statSync(thumb).size : 0)
    );
  }, 0);

  console.log(`\nWrote ${manifest.length} design(s) to:`);
  console.log(`  ${TEMPLATES_OUT}`);
  console.log(`  ${STICKERS_OUT}`);
  console.log(`  ${MANIFEST_PATH}`);
  console.log(`  Optimized catalog size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  if (totalBytes > 200 * 1024 * 1024) {
    console.log(
      "\nNote: catalog exceeds 200 MB — consider uploading public/designed/ to CDN and setting NEXT_PUBLIC_DESIGNED_CDN_URL.",
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
