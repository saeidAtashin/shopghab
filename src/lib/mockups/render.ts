import { existsSync } from "node:fs";

import { compositePrepared } from "./composite";
import { safeMockupMessage, MockupError } from "./errors";
import type { MockupPlacement } from "./focal";
import { hashFile, mockupContentHash } from "./hash";
import { assertValidWebp } from "./output";
import {
  artworkAbsolutePath,
  mockupAbsolutePaths,
  mockupPublicPaths,
  mockupRoot,
  publicRoot,
  resolveInside,
} from "./paths";
import { renderPhotoshopMockup } from "./photoshop";
import type { MockupRecord, MockupTemplateConfig } from "./types";

export function shouldReuseOutput(input: {
  previous: MockupRecord | undefined;
  contentHash: string;
  templateVersion: string;
  outputValid: boolean;
}): boolean {
  const previous = input.previous;
  if (!previous || previous.status !== "ready" || previous.error.trim() !== "") return false;
  if (previous.contentHash !== input.contentHash || previous.templateVersion !== input.templateVersion) return false;
  return input.outputValid && previous.path.startsWith("/designed/") && previous.thumbPath.startsWith("/designed/");
}

export function mergeMockupRecords(previous: MockupRecord[], updates: MockupRecord[]): MockupRecord[] {
  const byId = new Map(previous.map((item) => [item.templateId, item]));
  for (const update of updates) byId.set(update.templateId, update);
  const updateIds = updates.map((item) => item.templateId);
  const rest = previous.map((item) => item.templateId).filter((id) => !updateIds.includes(id));
  return [...updateIds, ...rest].map((id) => {
    const record = byId.get(id);
    if (!record) throw new MockupError("unsupported");
    return record;
  });
}

async function outputIsValid(cwd: string, record: MockupRecord | undefined): Promise<boolean> {
  if (!record || !record.path.startsWith("/designed/") || !record.thumbPath.startsWith("/designed/")) return false;
  try {
    const root = publicRoot(cwd);
    await assertValidWebp(resolveInside(root, record.path.slice(1)));
    await assertValidWebp(resolveInside(root, record.thumbPath.slice(1)));
    return true;
  } catch {
    return false;
  }
}

function emptyError(template: MockupTemplateConfig, message: string, now: string): MockupRecord {
  return {
    templateId: template.id,
    path: "",
    thumbPath: "",
    width: 0,
    height: 0,
    contentHash: "",
    templateVersion: template.version,
    generatedAt: now,
    status: "error",
    error: message,
  };
}

export async function renderDesignTemplates(options: {
  cwd: string;
  slug: string;
  artworkPublicPath: string;
  templates: MockupTemplateConfig[];
  previous: MockupRecord[];
  placements?: Record<string, MockupPlacement>;
  now?: string;
  /** Placement edits must fail the request instead of rewriting the saved photo. */
  strict?: boolean;
}): Promise<MockupRecord[]> {
  const now = options.now ?? new Date().toISOString();
  const records: MockupRecord[] = [];

  let artworkPath = "";
  let artworkHash = "";
  let artworkError: MockupError | null = null;
  try {
    artworkPath = artworkAbsolutePath(options.cwd, options.artworkPublicPath);
    if (!existsSync(artworkPath)) throw new MockupError("missingArtwork");
    artworkHash = await hashFile(artworkPath);
  } catch (error) {
    artworkError = error instanceof MockupError ? error : new MockupError("invalidArtwork");
  }

  for (const template of options.templates) {
    const previous = options.previous.find((item) => item.templateId === template.id);
    if (artworkError || !artworkPath) {
      if (options.strict) throw artworkError ?? new MockupError("missingArtwork");
      records.push(await unchangedOrError(options.cwd, previous, safeMockupMessage(artworkError), template, now));
      continue;
    }

    const placement = options.placements?.[template.id];
    const contentHash = mockupContentHash(artworkHash, template, placement);
    const reusable = shouldReuseOutput({
      previous,
      contentHash,
      templateVersion: template.version,
      outputValid: previous ? await outputIsValid(options.cwd, previous) : false,
    });
    if (reusable && previous) {
      records.push(previous);
      continue;
    }

    try {
      const paths = mockupPublicPathsSafe(options.cwd, options.slug, template.id, contentHash);
      const size = await renderOne({
        cwd: options.cwd,
        artworkPath,
        template,
        imagePath: paths.image,
        thumbPath: paths.thumb,
        placement,
      });
      const written = await outputIsValid(options.cwd, {
        templateId: template.id,
        path: paths.publicImage,
        thumbPath: paths.publicThumb,
        width: size.width,
        height: size.height,
        contentHash,
        templateVersion: template.version,
        generatedAt: now,
        status: "ready",
        error: "",
      });
      if (!written || size.width < 1 || size.height < 1) throw new MockupError("invalidOutput");
      records.push({
        templateId: template.id,
        path: paths.publicImage,
        thumbPath: paths.publicThumb,
        width: size.width,
        height: size.height,
        contentHash,
        templateVersion: template.version,
        generatedAt: now,
        status: "ready",
        error: "",
      });
    } catch (error) {
      if (options.strict) {
        if (error instanceof MockupError) throw error;
        console.error(error);
        throw new MockupError("unsupported");
      }
      records.push(await unchangedOrError(options.cwd, previous, safeMockupMessage(error), template, now));
    }
  }

  return records;
}

/** A failed rerun leaves a ready photo as it was. Only a missing photo becomes an error record. */
async function unchangedOrError(
  cwd: string,
  previous: MockupRecord | undefined,
  message: string,
  template: MockupTemplateConfig,
  now: string,
): Promise<MockupRecord> {
  if (previous && previous.status === "ready" && (await outputIsValid(cwd, previous))) {
    return previous;
  }
  return emptyError(template, message, now);
}

function mockupPublicPathsSafe(
  cwd: string,
  slug: string,
  templateId: string,
  contentHash: string,
): {
  image: string;
  thumb: string;
  publicImage: string;
  publicThumb: string;
} {
  const pub = mockupPublicPaths(slug, templateId, contentHash);
  const absolute = mockupAbsolutePaths(cwd, slug, templateId, contentHash);
  return { image: absolute.image, thumb: absolute.thumb, publicImage: pub.image, publicThumb: pub.thumb };
}

async function renderOne(options: {
  cwd: string;
  artworkPath: string;
  template: MockupTemplateConfig;
  imagePath: string;
  thumbPath: string;
  placement?: MockupPlacement;
}): Promise<{ width: number; height: number }> {
  if (options.template.renderer === "photoshop") {
    const psdPath = resolveInside(mockupRoot(options.cwd), options.template.psdPath);
    if (!existsSync(psdPath)) throw new MockupError("unsupported");
    return renderPhotoshopMockup({
      psdPath,
      artworkPath: options.artworkPath,
      outputPath: options.imagePath,
      thumbPath: options.thumbPath,
      smartObjectName: options.template.printable.smartObjectName ?? "",
      quality: options.template.output.quality,
      thumbEdge: options.template.output.thumbEdge,
    });
  }

  return compositePrepared({
    artworkPath: options.artworkPath,
    template: options.template,
    templateRoot: mockupRoot(options.cwd),
    outputPath: options.imagePath,
    thumbPath: options.thumbPath,
    placement: options.placement,
  });
}
