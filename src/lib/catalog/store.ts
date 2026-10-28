/**
 * Mutable design catalog.
 *
 * This file is the source of truth for titles, categories, SEO, and publication
 * status. It is not served from `public/`. On the VPS, `data/` must stay
 * writable and must survive deploys; otherwise admin edits are lost on restart.
 * Image conversion still writes `public/designed` and the generated templates.
 */
import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { emptyCatalog } from "./logic";
import { catalogSchema, parseCatalogDocument, type DesignCatalog } from "./schema";

type CacheEntry = {
  mtimeMs: number;
  catalog: DesignCatalog;
  source: "main" | "cache";
};

let cache: CacheEntry | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function catalogFilePath(): string {
  return join(process.cwd(), "data", "design-catalog.json");
}

export function catalogCacheFilePath(): string {
  return join(process.cwd(), "data", "design-catalog.cache.json");
}

export function catalogFileExists(): boolean {
  return existsSync(catalogFilePath());
}

function withLock<T>(fn: () => T): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function writeCacheFile(catalog: DesignCatalog): void {
  try {
    const file = catalogCacheFilePath();
    mkdirSync(dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
    renameSync(tmp, file);
  } catch (error) {
    console.error("Could not write the catalog cache.");
    console.error(error instanceof Error ? error.message : error);
  }
}

function readCachedCatalog(): DesignCatalog {
  const file = catalogCacheFilePath();
  if (!existsSync(file)) return emptyCatalog();

  try {
    const stat = statSync(file);
    if (cache && cache.source === "cache" && cache.mtimeMs === stat.mtimeMs) {
      return structuredClone(cache.catalog);
    }

    const parsed = parseCatalogDocument(JSON.parse(readFileSync(file, "utf8")));
    cache = { mtimeMs: stat.mtimeMs, catalog: parsed, source: "cache" };
    return structuredClone(parsed);
  } catch (error) {
    console.error("Cached catalog is unreadable.");
    console.error(error instanceof Error ? error.message : error);
    return emptyCatalog();
  }
}

export function readCatalog(): DesignCatalog {
  const file = catalogFilePath();
  if (existsSync(file)) {
    try {
      const stat = statSync(file);
      if (cache && cache.source === "main" && cache.mtimeMs === stat.mtimeMs) {
        return structuredClone(cache.catalog);
      }

      const parsed = parseCatalogDocument(JSON.parse(readFileSync(file, "utf8")));
      cache = { mtimeMs: stat.mtimeMs, catalog: parsed, source: "main" };
      writeCacheFile(parsed);
      return structuredClone(parsed);
    } catch (error) {
      console.error("Catalog file is unreadable. Using the cached catalog.");
      console.error(error instanceof Error ? error.message : error);
    }
  }

  return readCachedCatalog();
}

function writeCatalogSync(catalog: DesignCatalog): void {
  const validated = catalogSchema.parse(catalog);
  const file = catalogFilePath();
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
  const stat = statSync(file);
  cache = { mtimeMs: stat.mtimeMs, catalog: validated, source: "main" };
  writeCacheFile(validated);
}

export function writeCatalog(catalog: DesignCatalog): Promise<void> {
  return withLock(() => {
    writeCatalogSync(catalog);
  });
}

export function mutateCatalog<T>(
  fn: (catalog: DesignCatalog) => { catalog: DesignCatalog; result: T },
): Promise<T> {
  return withLock(() => {
    const current = readCatalog();
    const { catalog, result } = fn(current);
    writeCatalogSync(catalog);
    return result;
  });
}
