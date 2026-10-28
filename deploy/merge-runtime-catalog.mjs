/**
 * Merge a newly released catalog into the live server catalog.
 * Existing rows stay as they are, except product mockup photos, which
 * are replaced from the release. Incoming rows are appended only when
 * the server does not already have that record.
 */
import { readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sameText(left, right) {
  const a = text(left);
  const b = text(right);
  return a !== "" && a === b;
}

function sameSourceKey(left, right) {
  const a = text(left).toLowerCase();
  const b = text(right).toLowerCase();
  return a !== "" && a === b;
}

function list(catalog, key) {
  const value = catalog?.[key];
  return Array.isArray(value) ? value : [];
}

function findByIdOrSlug(existing, incoming) {
  return existing.find(
    (item) => item?.id === incoming?.id || sameText(item?.slug, incoming?.slug),
  );
}

function designSlugs(design) {
  return [design?.slug, design?.templateSlug, design?.legacySlug].map(text).filter(Boolean);
}

function designMatches(existing, incoming) {
  if (existing?.id && existing.id === incoming?.id) return true;
  if (sameSourceKey(existing?.sourceKey, incoming?.sourceKey)) return true;
  const incomingSlugs = new Set(designSlugs(incoming));
  if (incomingSlugs.size === 0) return false;
  return designSlugs(existing).some((slug) => incomingSlugs.has(slug));
}

function rememberMatch(map, incoming, existing) {
  if (incoming?.id && existing?.id) map.set(incoming.id, existing.id);
}

function remap(map, id) {
  if (!id || !map.has(id)) return id;
  return map.get(id);
}

function generatedAt(mockup) {
  return text(mockup?.generatedAt);
}

function refreshMockups(existing, incoming, matches) {
  for (const item of incoming) {
    if (!item || typeof item !== "object" || !Array.isArray(item.mockups) || item.mockups.length === 0) continue;
    const found = existing.find((candidate) => matches(candidate, item));
    if (!found) continue;
    const live = Array.isArray(found.mockups) ? found.mockups : [];
    const liveByTemplate = new Map();
    for (const mockup of live) {
      const id = text(mockup?.templateId);
      if (id) liveByTemplate.set(id, mockup);
    }
    const next = [];
    const seen = new Set();
    for (const mockup of item.mockups) {
      const id = text(mockup?.templateId);
      const current = id ? liveByTemplate.get(id) : undefined;
      const liveAt = generatedAt(current);
      const releaseAt = generatedAt(mockup);
      if (current && liveAt && (!releaseAt || liveAt > releaseAt)) {
        next.push(current);
      } else {
        next.push(structuredClone(mockup));
      }
      if (id) seen.add(id);
    }
    for (const mockup of live) {
      const id = text(mockup?.templateId);
      if (!id || seen.has(id)) continue;
      next.push(mockup);
    }
    found.mockups = next;
  }
}

function appendMissing(existing, incoming, matches, map, prepare) {
  const added = [];
  for (const item of incoming) {
    if (!item || typeof item !== "object") continue;
    const found = existing.find((candidate) => matches(candidate, item));
    if (found) {
      rememberMatch(map, item, found);
      continue;
    }
    const copy = structuredClone(item);
    prepare?.(copy);
    existing.push(copy);
    added.push(copy);
    rememberMatch(map, item, copy);
  }
  return added;
}

export function mergeCatalog(live, incoming) {
  const next = structuredClone(live ?? {});
  next.version = live?.version ?? incoming?.version ?? 1;

  const categoryIds = new Map();
  const groupIds = new Map();
  const valueIds = new Map();
  const collectionIds = new Map();
  const designIds = new Map();

  next.categories = list(next, "categories");
  const addedCategories = appendMissing(
    next.categories,
    list(incoming, "categories"),
    (candidate, item) => findByIdOrSlug([candidate], item) === candidate,
    categoryIds,
  );
  for (const category of addedCategories) {
    category.parentId = remap(categoryIds, category.parentId) ?? null;
  }

  next.attributeGroups = list(next, "attributeGroups");
  appendMissing(
    next.attributeGroups,
    list(incoming, "attributeGroups"),
    (candidate, item) => findByIdOrSlug([candidate], item) === candidate,
    groupIds,
  );

  next.attributeValues = list(next, "attributeValues");
  appendMissing(
    next.attributeValues,
    list(incoming, "attributeValues"),
    (candidate, item) => candidate?.id && candidate.id === item?.id,
    valueIds,
    (copy) => {
      copy.groupId = remap(groupIds, copy.groupId);
    },
  );

  next.collections = list(next, "collections");
  appendMissing(
    next.collections,
    list(incoming, "collections"),
    (candidate, item) => findByIdOrSlug([candidate], item) === candidate,
    collectionIds,
  );

  next.designs = list(next, "designs");
  const incomingDesigns = list(incoming, "designs");
  refreshMockups(next.designs, incomingDesigns, designMatches);
  appendMissing(
    next.designs,
    incomingDesigns,
    designMatches,
    designIds,
    (copy) => {
      copy.categoryIds = (copy.categoryIds ?? []).map((id) => remap(categoryIds, id));
      copy.collectionIds = (copy.collectionIds ?? []).map((id) => remap(collectionIds, id));
      copy.attributeValueIds = (copy.attributeValueIds ?? []).map((id) => remap(valueIds, id));
    },
  );

  next.redirects = list(next, "redirects");
  appendMissing(
    next.redirects,
    list(incoming, "redirects"),
    (candidate, item) => sameText(candidate?.fromSlug, item?.fromSlug),
    new Map(),
    (copy) => {
      copy.designId = remap(designIds, copy.designId);
    },
  );

  next.categoryRedirects = list(next, "categoryRedirects");
  appendMissing(
    next.categoryRedirects,
    list(incoming, "categoryRedirects"),
    (candidate, item) => sameText(candidate?.fromSlug, item?.fromSlug),
    new Map(),
    (copy) => {
      copy.categoryId = remap(categoryIds, copy.categoryId);
    },
  );

  return next;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
}

function argument(name) {
  const index = process.argv.indexOf(name);
  const value = index === -1 ? "" : process.argv[index + 1];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function runCli() {
  const live = readJson(argument("--live"));
  const incoming = readJson(argument("--incoming"));
  writeJson(argument("--out"), mergeCatalog(live, incoming));
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(entry)).href;
  } catch {
    return false;
  }
}

if (isDirectRun()) runCli();
