import { isAbsolute, relative, resolve } from "node:path";

import { MockupError } from "./errors";

const SAFE_ID = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;

export function mockupRoot(cwd = process.cwd()): string {
  return resolve(cwd, "mockup-templates");
}

export function publicRoot(cwd = process.cwd()): string {
  return resolve(cwd, "public");
}

export function assertSafeId(value: string): string {
  if (!SAFE_ID.test(value)) {
    throw new MockupError("pathRejected");
  }
  return value;
}

export function resolveInside(root: string, candidate: string): string {
  if (!candidate || candidate.includes("\0")) throw new MockupError("pathRejected");
  const normalized = candidate.replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) {
    throw new MockupError("pathRejected");
  }
  const absRoot = resolve(root);
  const abs = resolve(absRoot, normalized);
  const rel = relative(absRoot, abs);
  if (rel.startsWith("..") || isAbsolute(rel)) throw new MockupError("pathRejected");
  return abs;
}

export function mockupPublicPaths(slug: string, templateId: string): { image: string; thumb: string } {
  const safeSlug = assertSafeId(slug);
  const safeTemplate = assertSafeId(templateId);
  return {
    image: `/designed/mockups/${safeSlug}/${safeTemplate}.webp`,
    thumb: `/designed/mockups/${safeSlug}/${safeTemplate}.thumb.webp`,
  };
}

export function mockupAbsolutePaths(
  cwd: string,
  slug: string,
  templateId: string,
): { image: string; thumb: string } {
  const pub = mockupPublicPaths(slug, templateId);
  const root = publicRoot(cwd);
  return {
    image: resolveInside(root, pub.image.slice(1)),
    thumb: resolveInside(root, pub.thumb.slice(1)),
  };
}

export function artworkAbsolutePath(cwd: string, imagePath: string): string {
  if (!imagePath.startsWith("/designed/") || imagePath.includes("..") || imagePath.includes("\0")) {
    throw new MockupError("pathRejected");
  }
  const ext = imagePath.split(".").pop()?.toLowerCase() ?? "";
  if (!["webp", "png", "jpg", "jpeg", "avif"].includes(ext)) {
    throw new MockupError("invalidArtwork");
  }
  return resolveInside(publicRoot(cwd), imagePath.slice(1));
}
