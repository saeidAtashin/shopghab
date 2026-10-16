# Phone-case mockup templates

These files are master templates for product photos. They are never requested by the storefront.

```bash
npm run mockups:inspect
npm run mockups:generate -- --design=your-slug
npm run mockups:generate -- --all
npm run mockups:status
```

`npm run convert:designed` also generates mockups for designs it just imported, and only when at least one template is enabled. With none enabled it prints a warning and still finishes the artwork import.

## Layout

- `psd/` — original PSD files. Do not edit them. The shop repo ignores these bytes. The same files are stored with Git LFS in the private repo `shopghab-mockup-psds`.
- `prepared/{template-id}/` — one-time exports used by the portable renderer: `base.png`, `mask.png`, optional `shade.png`, `highlight.png`, and `displacement.png`.
- `inspection/` — structure reports from `mockups:inspect`. Not a proof that a Smart Object can be replaced.
- `templates.config.ts` — one entry per template.

## Register a template

1. Copy the PSD into `psd/`.
2. Run `npm run mockups:inspect`. Read the layer names, bounds, masks, and Smart Object list. If no printable region or Smart Object is identified, leave `enabled: false`. The generator will not invent coordinates.
3. Choose a renderer:
   - `prepared` (default): in Photoshop, export the case with the printable area transparent as `base.png`, a silhouette mask as `mask.png`, and optional multiply shade, screen highlight, and displacement maps. Set `printable.width` and `printable.height` to the flat print texture size. Set `origin` for a straight placement or `quad` (top-left, top-right, bottom-right, bottom-left) for perspective. Sharp fits the artwork with `contain`. Perspective and displacement run in the generator; ImageMagick is not required for that step.
   - `photoshop`: set `PHOTOSHOP_EXE` and `printable.smartObjectName` to a name found by the inspector. The script replaces that Smart Object and exports a PNG without saving the PSD. Do not enable this until a real file has been inspected and one output has been checked by eye.
4. Set `fill` to `solid` (with a hex color), `edge-extend`, or `blur`. The fill covers only the bars around the artwork. The artwork itself is never cropped or stretched.
5. Set `version` to a new value whenever the prepared files or geometry change. That makes existing outputs outdated.
6. Enable the template. Exactly one enabled template must have `default: true`. That one becomes the main product image. The others become gallery images. The original design file stays the printable artwork.

Outputs go to `public/designed/mockups/{slug}/{template-id}.webp` plus a thumbnail. A failed template does not cancel the other templates, and a failed rerun does not delete the last valid file.

No PSD is opened during a page request. Admin status is read-only and does not show file-system paths.
