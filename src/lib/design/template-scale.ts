import type { DesignLayer, ImageLayer, TextLayer } from "./types";
import { DEFAULT_REFERENCE_CANVAS } from "./types";

export type CanvasSize = { width: number; height: number };
export type ScaleMode = "cover" | "contain";

export function scaleLayersToCanvas(
  layers: DesignLayer[],
  from: CanvasSize,
  to: CanvasSize,
  mode: ScaleMode = "cover",
): DesignLayer[] {
  if (from.width === to.width && from.height === to.height) {
    return structuredClone(layers);
  }

  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;
  const uniform = mode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);

  const scaledW = from.width * uniform;
  const scaledH = from.height * uniform;
  const offsetX = (to.width - scaledW) / 2;
  const offsetY = (to.height - scaledH) / 2;

  return layers.map((layer) => {
    const next = structuredClone(layer);
    next.x = layer.x * uniform + offsetX;
    next.y = layer.y * uniform + offsetY;

    if (layer.type === "text") {
      const text = next as TextLayer;
      text.fontSize = layer.fontSize * uniform;
      if (text.width != null) {
        text.width = text.width * uniform;
      }
    } else {
      const image = next as ImageLayer;
      image.width = layer.width * uniform;
      image.height = layer.height * uniform;
    }

    return next;
  });
}

export function resolveReferenceCanvas(template: {
  referenceCanvas?: { width: number; height: number };
}): CanvasSize {
  return template.referenceCanvas ?? DEFAULT_REFERENCE_CANVAS;
}
