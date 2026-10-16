import { createHash, randomBytes } from "node:crypto";

export function normalizeSourceKey(sourceKey: string): string {
  return sourceKey.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+/g, "/");
}

export function stableDesignId(sourceKey: string): string {
  const normalized = normalizeSourceKey(sourceKey).toLowerCase();
  return `dsn_${createHash("sha256").update(normalized).digest("hex").slice(0, 16)}`;
}

export function stableCategoryId(slug: string): string {
  return `cat_${createHash("sha256").update(slug.trim().toLowerCase()).digest("hex").slice(0, 12)}`;
}

export function randomDesignId(): string {
  return `dsn_${randomBytes(8).toString("hex")}`;
}

export function randomCategoryId(): string {
  return `cat_${randomBytes(6).toString("hex")}`;
}

export function deriveSourceKey(category: string, sourceFile: string): string {
  const file = sourceFile.replace(/\\/g, "/").split("/").pop() ?? sourceFile;
  const folder = category.trim().toLowerCase();
  if (!folder || folder === "general") {
    return normalizeSourceKey(file);
  }
  return normalizeSourceKey(`${folder}/${file}`);
}

export function toPublicAssetPath(outputPath: string): string {
  const normalized = outputPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const withoutPublic = normalized.replace(/^public\//, "");
  return `/${withoutPublic}`;
}
