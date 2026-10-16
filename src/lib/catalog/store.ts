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
};

let cache: CacheEntry | null = null;
let queue: Promise<unknown> = Promise.resolve();

export function catalogFilePath(): string {
  return join(process.cwd(), "data", "design-catalog.json");
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

export function readCatalog(): DesignCatalog {
  const file = catalogFilePath();
  if (!existsSync(file)) return emptyCatalog();

  const stat = statSync(file);
  if (cache && cache.mtimeMs === stat.mtimeMs) {
    return structuredClone(cache.catalog);
  }

  const parsed = parseCatalogDocument(JSON.parse(readFileSync(file, "utf8")));
  cache = { mtimeMs: stat.mtimeMs, catalog: parsed };
  return structuredClone(parsed);
}

function writeCatalogSync(catalog: DesignCatalog): void {
  const validated = catalogSchema.parse(catalog);
  const file = catalogFilePath();
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  renameSync(tmp, file);
  cache = null;
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
