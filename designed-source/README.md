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
4. Edit metadata in `public/designed/designed.meta.json` for titles, descriptions, and tags.

**Do not commit EPS/JPG originals** — they stay local or in cloud storage. Only converted assets in `public/designed/` belong in git (or on CDN via `NEXT_PUBLIC_DESIGNED_CDN_URL`).
