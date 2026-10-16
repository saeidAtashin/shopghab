import { categoryLabel, subcategoryLabel } from "@/lib/designed-categories";
import {
  designPublicDescription,
  designPublicTitle,
} from "@/lib/seo/design-copy";

import {
  deriveSourceKey,
  normalizeSourceKey,
  randomCategoryId,
  randomDesignId,
  stableCategoryId,
  stableDesignId,
  toPublicAssetPath,
} from "./ids";
import type {
  CategoryRecord,
  CategoryWriteInput,
  DesignCatalog,
  DesignRecord,
  DesignWriteInput,
  PublicDesign,
} from "./schema";
import { toPublicDesign } from "./schema";

export class CatalogError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CatalogError";
    this.status = status;
  }
}

export type CatalogSort = "featured" | "newest" | "title";

export function parsePublicListingQuery(params: {
  q?: string;
  sort?: string;
  page?: string;
}): { q: string; sort: CatalogSort; page: number; noIndex: boolean } {
  const q = (params.q ?? "").trim().slice(0, 80);
  const sort: CatalogSort =
    params.sort === "newest" || params.sort === "title" || params.sort === "featured"
      ? params.sort
      : "featured";
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const noIndex = q.length > 0 || (typeof params.sort === "string" && params.sort !== "" && params.sort !== "featured");
  return { q, sort, page, noIndex };
}

export type SyncReport = {
  created: string[];
  assetsUpdated: string[];
  editorialPreserved: string[];
  missingAssets: string[];
  duplicateSourceKeys: string[];
};

export type CatalogImportEntry = {
  sourceKey: string;
  templateSlug: string;
  categorySlug: string;
  subcategory: string;
  titleHint: string;
  descriptionHint: string;
  tagsHint: string[];
  imagePath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  convertedAt?: string;
};

export type ManifestLikeEntry = {
  slug: string;
  category: string;
  subcategory: string;
  sourceFile: string;
  sourceKey?: string;
  outputPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  convertedAt?: string;
};

export type DesignedMetaLike = Record<
  string,
  { title?: string; description?: string; tags?: string[] }
>;

export function emptyCatalog(): DesignCatalog {
  return { version: 1, categories: [], designs: [], redirects: [] };
}

export function emptySyncReport(): SyncReport {
  return {
    created: [],
    assetsUpdated: [],
    editorialPreserved: [],
    missingAssets: [],
    duplicateSourceKeys: [],
  };
}

function cloneCatalog(catalog: DesignCatalog): DesignCatalog {
  return structuredClone(catalog);
}

export function titleFromBasename(filename: string): string {
  let slug = filename.replace(/\.(eps|jpe?g|png|webp|svg)$/i, "");
  slug = slug.split("/").pop() ?? slug;
  if (/^vecteezy_/i.test(slug)) {
    slug = slug.replace(/^vecteezy_/i, "");
    slug = slug.replace(/_\d+(-\d+)?$/, "");
    slug = slug.replace(/_+$/, "");
  }
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function manifestEntryToImport(
  entry: ManifestLikeEntry,
  meta: DesignedMetaLike,
): CatalogImportEntry {
  const metaEntry = meta[entry.slug] ?? {};
  const sourceKey = entry.sourceKey
    ? normalizeSourceKey(entry.sourceKey)
    : deriveSourceKey(entry.category, entry.sourceFile);
  const rawTitle = metaEntry.title?.trim() || titleFromBasename(entry.sourceFile);
  const tags =
    metaEntry.tags && metaEntry.tags.length > 0
      ? metaEntry.tags
      : [
          categoryLabel(entry.category),
          subcategoryLabel(entry.subcategory),
          "طراحی آماده",
        ];
  const title = designPublicTitle({
    title: rawTitle,
    slug: entry.slug,
    category: entry.category,
    tags,
    description: metaEntry.description ?? "",
  });
  const descriptionHint = metaEntry.description?.trim() || "";
  const shortDescription =
    descriptionHint && /[\u0600-\u06FF]/.test(descriptionHint)
      ? descriptionHint
      : designPublicDescription({
          title: rawTitle,
          slug: entry.slug,
          category: entry.category,
          tags,
          description: descriptionHint,
        });

  return {
    sourceKey,
    templateSlug: entry.slug,
    categorySlug: entry.category.trim().toLowerCase() || "general",
    subcategory: entry.subcategory,
    titleHint: title,
    descriptionHint: shortDescription,
    tagsHint: tags,
    imagePath: toPublicAssetPath(entry.outputPath),
    thumbnailPath: toPublicAssetPath(entry.thumbnailPath),
    width: entry.width,
    height: entry.height,
    convertedAt: entry.convertedAt,
  };
}

function findCategoryBySlug(catalog: DesignCatalog, slug: string): CategoryRecord | undefined {
  return catalog.categories.find((category) => category.slug === slug);
}

function ensureFolderCategory(
  catalog: DesignCatalog,
  slug: string,
  now: string,
): CategoryRecord {
  const existing = findCategoryBySlug(catalog, slug);
  if (existing) return existing;

  const name = categoryLabel(slug);
  const category: CategoryRecord = {
    id: stableCategoryId(slug),
    name,
    slug,
    parentId: null,
    description: `مجموعه طرح‌های ${name} برای چاپ روی قاب موبایل.`,
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  catalog.categories.push(category);
  return category;
}

function slugTaken(
  catalog: DesignCatalog,
  slug: string,
  ignoreDesignId?: string,
): boolean {
  if (catalog.designs.some((design) => design.slug === slug && design.id !== ignoreDesignId)) {
    return true;
  }
  return catalog.redirects.some(
    (redirect) => redirect.fromSlug === slug && redirect.designId !== ignoreDesignId,
  );
}

function availableSlug(catalog: DesignCatalog, base: string, ignoreDesignId?: string): string {
  const root = base || "design";
  let candidate = root;
  let suffix = 2;
  while (slugTaken(catalog, candidate, ignoreDesignId)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function findDesignForImport(
  catalog: DesignCatalog,
  entry: CatalogImportEntry,
): DesignRecord | undefined {
  const sourceKey = normalizeSourceKey(entry.sourceKey).toLowerCase();
  const bySource = catalog.designs.find(
    (design) => normalizeSourceKey(design.sourceKey).toLowerCase() === sourceKey && sourceKey !== "",
  );
  if (bySource) return bySource;

  return catalog.designs.find(
    (design) =>
      design.templateSlug === entry.templateSlug ||
      design.legacySlug === entry.templateSlug ||
      design.slug === entry.templateSlug,
  );
}

function applyAssetFields(design: DesignRecord, entry: CatalogImportEntry, now: string): boolean {
  const next = {
    sourceKey: normalizeSourceKey(entry.sourceKey),
    templateSlug: entry.templateSlug,
    imagePath: entry.imagePath,
    thumbnailPath: entry.thumbnailPath,
    width: entry.width,
    height: entry.height,
    assetMissing: false,
  };
  const changed =
    design.sourceKey !== next.sourceKey ||
    design.templateSlug !== next.templateSlug ||
    design.imagePath !== next.imagePath ||
    design.thumbnailPath !== next.thumbnailPath ||
    design.width !== next.width ||
    design.height !== next.height ||
    design.assetMissing !== false;

  design.sourceKey = next.sourceKey;
  design.templateSlug = next.templateSlug;
  design.imagePath = next.imagePath;
  design.thumbnailPath = next.thumbnailPath;
  design.width = next.width;
  design.height = next.height;
  design.assetMissing = false;
  if (changed) design.updatedAt = now;
  return changed;
}

export function syncCatalog(
  catalog: DesignCatalog,
  entries: CatalogImportEntry[],
  options: { now?: string; defaultStatus?: "draft" | "published" } = {},
): { catalog: DesignCatalog; report: SyncReport } {
  const next = cloneCatalog(catalog);
  const report = emptySyncReport();
  if (entries.length === 0) {
    return { catalog: next, report };
  }

  const now = options.now ?? new Date().toISOString();
  const defaultStatus = options.defaultStatus ?? "draft";
  const seen = new Set<string>();
  const unique: CatalogImportEntry[] = [];

  for (const entry of entries) {
    const key = normalizeSourceKey(entry.sourceKey).toLowerCase();
    if (seen.has(key)) {
      report.duplicateSourceKeys.push(entry.sourceKey);
      continue;
    }
    seen.add(key);
    unique.push(entry);
  }

  for (const entry of unique) {
    const category = ensureFolderCategory(next, entry.categorySlug, now);
    const existing = findDesignForImport(next, entry);
    if (existing) {
      const changed = applyAssetFields(existing, entry, now);
      if (changed) report.assetsUpdated.push(existing.id);
      report.editorialPreserved.push(existing.id);
      continue;
    }

    const slug = availableSlug(next, entry.templateSlug);
    const createdAt = entry.convertedAt ?? now;
    const design: DesignRecord = {
      id: stableDesignId(entry.sourceKey),
      sourceKey: normalizeSourceKey(entry.sourceKey),
      legacySlug: entry.templateSlug,
      templateSlug: entry.templateSlug,
      imagePath: entry.imagePath,
      thumbnailPath: entry.thumbnailPath,
      width: entry.width,
      height: entry.height,
      title: entry.titleHint || entry.templateSlug,
      titleEn: "",
      slug,
      shortDescription: entry.descriptionHint,
      description: entry.descriptionHint,
      categoryIds: [category.id],
      tags: entry.tagsHint,
      colors: [],
      styles: [],
      alt: entry.titleHint,
      gallery: [],
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      status: defaultStatus,
      featured: false,
      sortOrder: next.designs.length,
      assetMissing: false,
      createdAt,
      updatedAt: now,
      publishedAt: defaultStatus === "published" ? createdAt : null,
    };
    next.designs.push(design);
    report.created.push(design.id);
  }

  for (const design of next.designs) {
    if (!design.sourceKey) continue;
    const key = normalizeSourceKey(design.sourceKey).toLowerCase();
    if (seen.has(key)) continue;
    if (!design.assetMissing) {
      design.assetMissing = true;
      design.updatedAt = now;
    }
    report.missingAssets.push(design.id);
  }

  return { catalog: next, report };
}

function assertCategoryIds(catalog: DesignCatalog, categoryIds: string[]): string[] {
  const unique = [...new Set(categoryIds)];
  for (const id of unique) {
    if (!catalog.categories.some((category) => category.id === id)) {
      throw new CatalogError("یکی از دسته‌های انتخاب‌شده وجود ندارد", 400);
    }
  }
  return unique;
}

function assertDesignSlug(catalog: DesignCatalog, slug: string, ignoreDesignId?: string): void {
  if (slugTaken(catalog, slug, ignoreDesignId)) {
    throw new CatalogError("این اسلاگ قبلاً استفاده شده است", 409);
  }
}

export function changeDesignSlug(
  catalog: DesignCatalog,
  design: DesignRecord,
  nextSlug: string,
): void {
  if (nextSlug === design.slug) return;
  assertDesignSlug(catalog, nextSlug, design.id);

  catalog.redirects = catalog.redirects.filter(
    (redirect) => !(redirect.designId === design.id && redirect.fromSlug === nextSlug),
  );

  for (const redirect of catalog.redirects) {
    if (redirect.designId === design.id && redirect.toSlug === design.slug) {
      redirect.toSlug = nextSlug;
    }
  }

  const alreadyTracked = catalog.redirects.some(
    (redirect) => redirect.designId === design.id && redirect.fromSlug === design.slug,
  );
  if (!alreadyTracked) {
    catalog.redirects.push({
      fromSlug: design.slug,
      toSlug: nextSlug,
      designId: design.id,
    });
  }

  design.slug = nextSlug;
}

function applyStatus(design: DesignRecord, status: DesignRecord["status"], now: string): void {
  design.status = status;
  if (status === "published" && !design.publishedAt) {
    design.publishedAt = now;
  }
  design.updatedAt = now;
}

export function createDesign(
  catalog: DesignCatalog,
  input: DesignWriteInput,
  now = new Date().toISOString(),
): { catalog: DesignCatalog; design: DesignRecord } {
  const next = cloneCatalog(catalog);
  assertDesignSlug(next, input.slug);
  const categoryIds = assertCategoryIds(next, input.categoryIds);
  const design: DesignRecord = {
    id: randomDesignId(),
    sourceKey: "",
    legacySlug: input.slug,
    templateSlug: input.templateSlug || input.slug,
    imagePath: input.imagePath,
    thumbnailPath: input.thumbnailPath || input.imagePath,
    width: 0,
    height: 0,
    title: input.title,
    titleEn: input.titleEn,
    slug: input.slug,
    shortDescription: input.shortDescription,
    description: input.description,
    categoryIds,
    tags: input.tags,
    colors: input.colors,
    styles: input.styles,
    alt: input.alt || input.title,
    gallery: input.gallery.filter(Boolean),
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    ogImage: input.ogImage,
    status: input.status,
    featured: input.featured,
    sortOrder: input.sortOrder,
    assetMissing: input.imagePath === "",
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === "published" ? now : null,
  };
  next.designs.push(design);
  return { catalog: next, design };
}

export function updateDesign(
  catalog: DesignCatalog,
  id: string,
  input: DesignWriteInput,
  now = new Date().toISOString(),
): { catalog: DesignCatalog; design: DesignRecord } {
  const next = cloneCatalog(catalog);
  const design = next.designs.find((item) => item.id === id);
  if (!design) throw new CatalogError("طرح پیدا نشد", 404);

  changeDesignSlug(next, design, input.slug);
  design.title = input.title;
  design.titleEn = input.titleEn;
  design.shortDescription = input.shortDescription;
  design.description = input.description;
  design.categoryIds = assertCategoryIds(next, input.categoryIds);
  design.tags = input.tags;
  design.colors = input.colors;
  design.styles = input.styles;
  design.alt = input.alt;
  design.imagePath = input.imagePath;
  design.thumbnailPath = input.thumbnailPath || input.imagePath;
  design.gallery = input.gallery.filter(Boolean);
  design.seoTitle = input.seoTitle;
  design.seoDescription = input.seoDescription;
  design.ogImage = input.ogImage;
  design.featured = input.featured;
  design.sortOrder = input.sortOrder;
  design.templateSlug = input.templateSlug || design.templateSlug;
  design.assetMissing = input.imagePath === "";
  applyStatus(design, input.status, now);
  return { catalog: next, design };
}

export function updateDesignStatus(
  catalog: DesignCatalog,
  id: string,
  status: DesignRecord["status"],
  now = new Date().toISOString(),
): { catalog: DesignCatalog; design: DesignRecord } {
  const next = cloneCatalog(catalog);
  const design = next.designs.find((item) => item.id === id);
  if (!design) throw new CatalogError("طرح پیدا نشد", 404);
  applyStatus(design, status, now);
  return { catalog: next, design };
}

export function categoryCreatesCycle(
  categories: CategoryRecord[],
  categoryId: string,
  parentId: string | null,
): boolean {
  if (!parentId) return false;
  let current: string | null = parentId;
  const seen = new Set<string>();
  while (current) {
    if (current === categoryId) return true;
    if (seen.has(current)) return true;
    seen.add(current);
    const parent: CategoryRecord | undefined = categories.find((category) => category.id === current);
    current = parent?.parentId ?? null;
  }
  return false;
}

function assertParent(
  catalog: DesignCatalog,
  categoryId: string | null,
  parentId: string | null,
): void {
  if (!parentId) return;
  if (categoryId && parentId === categoryId) {
    throw new CatalogError("دسته نمی‌تواند والد خودش باشد", 400);
  }
  if (!catalog.categories.some((category) => category.id === parentId)) {
    throw new CatalogError("دسته والد پیدا نشد", 400);
  }
  if (categoryId && categoryCreatesCycle(catalog.categories, categoryId, parentId)) {
    throw new CatalogError("رابطه والد باعث حلقه در دسته‌ها می‌شود", 400);
  }
}

function assertCategorySlug(catalog: DesignCatalog, slug: string, ignoreId?: string): void {
  if (catalog.categories.some((category) => category.slug === slug && category.id !== ignoreId)) {
    throw new CatalogError("این اسلاگ دسته قبلاً استفاده شده است", 409);
  }
}

export function createCategory(
  catalog: DesignCatalog,
  input: CategoryWriteInput,
  now = new Date().toISOString(),
): { catalog: DesignCatalog; category: CategoryRecord } {
  const next = cloneCatalog(catalog);
  assertCategorySlug(next, input.slug);
  assertParent(next, null, input.parentId);
  const category: CategoryRecord = {
    id: randomCategoryId(),
    name: input.name,
    slug: input.slug,
    parentId: input.parentId,
    description: input.description,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    coverImage: input.coverImage,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
  next.categories.push(category);
  return { catalog: next, category };
}

export function updateCategory(
  catalog: DesignCatalog,
  id: string,
  input: CategoryWriteInput,
  now = new Date().toISOString(),
): { catalog: DesignCatalog; category: CategoryRecord } {
  const next = cloneCatalog(catalog);
  const category = next.categories.find((item) => item.id === id);
  if (!category) throw new CatalogError("دسته پیدا نشد", 404);
  assertCategorySlug(next, input.slug, id);
  assertParent(next, id, input.parentId);
  category.name = input.name;
  category.slug = input.slug;
  category.parentId = input.parentId;
  category.description = input.description;
  category.seoTitle = input.seoTitle;
  category.seoDescription = input.seoDescription;
  category.coverImage = input.coverImage;
  category.status = input.status;
  category.updatedAt = now;
  return { catalog: next, category };
}

export function descendantCategoryIds(catalog: DesignCatalog, rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of catalog.categories) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        grew = true;
      }
    }
  }
  return ids;
}

export function isPublishedDesign(design: DesignRecord): boolean {
  return design.status === "published";
}

export function designHasImage(design: DesignRecord): boolean {
  return !design.assetMissing && design.imagePath.trim() !== "";
}

export function designMissingSeo(design: DesignRecord): boolean {
  return design.seoTitle.trim() === "" || design.seoDescription.trim() === "";
}

export type DesignQuery = {
  q?: string;
  categoryId?: string;
  status?: DesignRecord["status"] | "all";
  missingSeo?: boolean;
  missingImage?: boolean;
  page?: number;
  pageSize?: number;
};

export function queryDesigns(catalog: DesignCatalog, query: DesignQuery = {}) {
  const q = query.q?.trim().toLowerCase() ?? "";
  const pageSize = query.pageSize ?? 20;
  const page = Math.max(1, query.page ?? 1);

  const filtered = catalog.designs.filter((design) => {
    if (query.status && query.status !== "all" && design.status !== query.status) return false;
    if (query.categoryId && !design.categoryIds.includes(query.categoryId)) return false;
    if (query.missingSeo && !designMissingSeo(design)) return false;
    if (query.missingImage && designHasImage(design)) return false;
    if (!q) return true;
    return (
      design.title.toLowerCase().includes(q) ||
      design.titleEn.toLowerCase().includes(q) ||
      design.slug.toLowerCase().includes(q) ||
      design.id.toLowerCase().includes(q)
    );
  });

  filtered.sort((a, b) => a.title.localeCompare(b.title, "fa"));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type PublicDesignQuery = {
  categoryId?: string;
  includeDescendants?: boolean;
  q?: string;
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
};

function sortDesigns(designs: DesignRecord[], sort: CatalogSort): DesignRecord[] {
  const items = [...designs];
  if (sort === "title") {
    items.sort((a, b) => a.title.localeCompare(b.title, "fa"));
    return items;
  }
  if (sort === "newest") {
    items.sort((a, b) => {
      const aTime = a.publishedAt ?? a.createdAt;
      const bTime = b.publishedAt ?? b.createdAt;
      return bTime.localeCompare(aTime);
    });
    return items;
  }
  items.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const aTime = a.publishedAt ?? a.createdAt;
    const bTime = b.publishedAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  });
  return items;
}

export function queryPublicDesigns(catalog: DesignCatalog, query: PublicDesignQuery = {}) {
  const pageSize = query.pageSize ?? 24;
  const page = Math.max(1, query.page ?? 1);
  const q = query.q?.trim().toLowerCase() ?? "";
  const categoryIds = query.categoryId
    ? query.includeDescendants === false
      ? new Set([query.categoryId])
      : descendantCategoryIds(catalog, query.categoryId)
    : null;

  const filtered = catalog.designs.filter((design) => {
    if (!isPublishedDesign(design)) return false;
    if (categoryIds && !design.categoryIds.some((id) => categoryIds.has(id))) return false;
    if (!q) return true;
    return (
      design.title.toLowerCase().includes(q) ||
      design.titleEn.toLowerCase().includes(q) ||
      design.slug.toLowerCase().includes(q) ||
      design.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const sorted = sortDesigns(filtered, query.sort ?? "featured");
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: sorted.slice(start, start + pageSize).map(toPublicDesign),
    total,
    page,
    pageSize,
    pageCount,
  };
}

export function findPublishedDesign(catalog: DesignCatalog, slug: string): DesignRecord | undefined {
  return catalog.designs.find((design) => design.slug === slug && design.status === "published");
}

export function findDesignBySlug(catalog: DesignCatalog, slug: string): DesignRecord | undefined {
  return catalog.designs.find((design) => design.slug === slug);
}

export function findRedirectTarget(catalog: DesignCatalog, slug: string): DesignRecord | undefined {
  const redirect = catalog.redirects.find((item) => item.fromSlug === slug);
  if (!redirect) return undefined;
  const design = catalog.designs.find((item) => item.id === redirect.designId);
  if (!design || design.status !== "published") return undefined;
  if (design.slug === slug) return undefined;
  return design;
}

export function activeCategories(catalog: DesignCatalog): CategoryRecord[] {
  return catalog.categories
    .filter((category) => category.status === "active")
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

export function childCategories(catalog: DesignCatalog, parentId: string): CategoryRecord[] {
  return activeCategories(catalog).filter((category) => category.parentId === parentId);
}

export function categoryChain(catalog: DesignCatalog, category: CategoryRecord): CategoryRecord[] {
  const chain: CategoryRecord[] = [category];
  const seen = new Set<string>([category.id]);
  let current = category;
  while (current.parentId) {
    const parent = catalog.categories.find((item) => item.id === current.parentId);
    if (!parent || seen.has(parent.id)) break;
    seen.add(parent.id);
    chain.unshift(parent);
    current = parent;
  }
  return chain;
}

export function publishedCountForCategory(catalog: DesignCatalog, categoryId: string): number {
  const ids = descendantCategoryIds(catalog, categoryId);
  return catalog.designs.filter(
    (design) =>
      design.status === "published" && design.categoryIds.some((id) => ids.has(id)),
  ).length;
}

export function isCategoryIndexable(catalog: DesignCatalog, category: CategoryRecord): boolean {
  return category.status === "active" && publishedCountForCategory(catalog, category.id) > 0;
}

export function relatedDesigns(
  catalog: DesignCatalog,
  design: DesignRecord,
  limit = 8,
): PublicDesign[] {
  const shared = new Set(design.categoryIds);
  const tagSet = new Set(design.tags.filter((tag) => tag !== "طراحی آماده"));
  const candidates = catalog.designs.filter(
    (item) => item.id !== design.id && item.status === "published",
  );
  candidates.sort((a, b) => {
    const aScore =
      a.categoryIds.filter((id) => shared.has(id)).length * 2 +
      a.tags.filter((tag) => tagSet.has(tag)).length;
    const bScore =
      b.categoryIds.filter((id) => shared.has(id)).length * 2 +
      b.tags.filter((tag) => tagSet.has(tag)).length;
    if (aScore !== bScore) return bScore - aScore;
    return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
  });
  return candidates
    .filter((item) => {
      const sharesCategory = item.categoryIds.some((id) => shared.has(id));
      const sharesTag = item.tags.some((tag) => tagSet.has(tag));
      return sharesCategory || sharesTag;
    })
    .slice(0, limit)
    .map(toPublicDesign);
}

export type CatalogSitemapEntry = {
  path: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

export function indexableCatalogPaths(catalog: DesignCatalog): CatalogSitemapEntry[] {
  const paths: CatalogSitemapEntry[] = [];
  for (const category of catalog.categories) {
    if (!isCategoryIndexable(catalog, category)) continue;
    paths.push({
      path: `/designs/category/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const design of catalog.designs) {
    if (design.status !== "published" || !designHasImage(design)) continue;
    paths.push({
      path: `/designs/${design.slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return paths;
}

export function designSeoTitle(design: Pick<DesignRecord, "seoTitle" | "title">): string {
  const custom = design.seoTitle.trim();
  if (custom) return custom;
  const title = design.title.trim();
  return title || "طرح قاب";
}

export function designSeoDescription(
  design: Pick<DesignRecord, "seoTitle" | "seoDescription" | "title" | "shortDescription" | "description">,
): string {
  const custom = design.seoDescription.trim();
  if (custom) return custom;
  const short = design.shortDescription.trim();
  if (short) return short;
  const full = design.description.trim();
  if (full) return full.slice(0, 300);
  return `${designSeoTitle(design)} — طرح آماده برای چاپ روی قاب موبایل.`;
}

export function designOgImage(
  design: Pick<DesignRecord, "ogImage" | "thumbnailPath" | "imagePath">,
): string | undefined {
  const candidate = design.ogImage.trim() || design.thumbnailPath.trim() || design.imagePath.trim();
  return candidate || undefined;
}

export function categorySeoTitle(category: CategoryRecord): string {
  return category.seoTitle.trim() || category.name;
}

export function categorySeoDescription(category: CategoryRecord): string {
  const custom = category.seoDescription.trim();
  if (custom) return custom;
  const description = category.description.trim();
  if (description) return description;
  return `طرح‌های ${category.name} برای چاپ روی قاب موبایل.`;
}

export function primaryCategory(
  catalog: DesignCatalog,
  design: Pick<DesignRecord, "categoryIds">,
): CategoryRecord | undefined {
  for (const id of design.categoryIds) {
    const category = catalog.categories.find((item) => item.id === id && item.status === "active");
    if (category) return category;
  }
  return undefined;
}
