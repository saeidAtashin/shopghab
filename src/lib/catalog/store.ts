/**
 * Mutable design catalog.
 *
 * This file is the source of truth for titles, categories, SEO, and publication
 * status. It is not served from `public/`. On the VPS, `data/` must stay
 * writable and must survive deploys; otherwise admin edits are lost on restart.
 * Image conversion still writes `public/designed` and the generated templates.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
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

function wait(ms: number): void {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    // Short pause so Windows/OneDrive can release a file handle before a rename.
  }
}

function isRetryableFsError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  const code = String((error as { code?: unknown }).code);
  return code === "EPERM" || code === "EBUSY" || code === "EACCES";
}

/** Atomic replace with Windows/OneDrive-friendly rename retry and copy fallback. */
function replaceFile(from: string, to: string): void {
  let last: unknown;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      renameSync(from, to);
      return;
    } catch (error) {
      last = error;
      try {
        copyFileSync(from, to);
        try {
          unlinkSync(from);
        } catch (unlinkError) {
          // Destination is already correct; a stuck tmp under OneDrive must not fail the write.
          if (!isRetryableFsError(unlinkError)) throw unlinkError;
        }
        return;
      } catch (copyError) {
        last = copyError;
        if (!isRetryableFsError(copyError) && !isRetryableFsError(error)) throw copyError;
        wait(40 * (attempt + 1));
      }
    }
  }
  throw last;
}

function writeJsonAtomic(file: string, contents: string): void {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, contents, "utf8");
  try {
    replaceFile(tmp, file);
  } catch (error) {
    try {
      if (existsSync(tmp)) unlinkSync(tmp);
    } catch {
      // Keep the original write error.
    }
    throw error;
  }
}

function writeCacheFile(catalog: DesignCatalog): void {
  try {
    writeJsonAtomic(catalogCacheFilePath(), `${JSON.stringify(catalog, null, 2)}\n`);
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
  writeJsonAtomic(file, `${JSON.stringify(validated, null, 2)}\n`);
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
