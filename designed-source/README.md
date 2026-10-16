# Case design sources

Place **EPS** (and optional companion **JPG** fallback) files here before running conversion.

```bash
npm run convert:designed
```

## Folder layout

Organize designs into **one subfolder per category**. The folder name becomes the top-level category in the gallery (e.g. `abstract/`, `islamic/`). Any new folder you add is picked up automatically on the next conversion run.

Files placed directly in this folder (not in a subfolder) get category **general**.

## Subcategory naming

For Vecteezy-style filenames, the subcategory is taken from the first word after the `vecteezy_` prefix:

| Filename | Subcategory |
|----------|-------------|
| `vecteezy_seamless-pattern-with-tropical-...` | seamless |
| `vecteezy_modern-abstract-high-speed-...` | modern |
| `vecteezy_luxury-mandala-islamic-...` | luxury |

Files that do **not** match `vecteezy_{word}-...` go into subcategory **others** (shown as «سایر» in the UI).

## Workflow

1. Copy `.eps` files into the appropriate category subfolder (slug = filename without extension).
2. Optional: add matching `.jpg` only when EPS conversion fails (same basename, same folder).
3. Run `npm run convert:designed` — outputs go to `public/designed/` (web) and `public/designed/thumbs/` (gallery WebP).
4. The converter updates image files and registers new catalog rows in `data/design-catalog.json`. The first import publishes designs that are not in the catalog yet. Later imports add new files as drafts and keep titles, descriptions, categories, SEO, and publication status already saved in the catalog.
5. `designed.meta.json` is still read as a hint for the editor template title. Admin edits belong in the catalog, not in that file.
6. To refresh catalog rows from the current manifest without converting images again, run `npm run catalog:sync`.

**Do not commit EPS/JPG originals** — they stay local or in cloud storage. Only converted assets in `public/designed/` belong in git (or on CDN via `NEXT_PUBLIC_DESIGNED_CDN_URL`).
