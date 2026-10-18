"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";

import { downscaleBitmap, EDITOR_BITMAP_MAX_EDGE } from "@/lib/design/downscale-bitmap";
import {
  applyImageLayerFilters,
  blendModeToKonva,
  serializeImageLayerEffects,
} from "@/lib/design/image-layer-filters";
import { useEditorStore } from "@/lib/design/editor-store";
import type { ImageLayer } from "@/lib/design/types";

type Props = {
  layer: ImageLayer;
  handlers?: Record<string, unknown>;
  /** Longest decoded edge. Previews pass a smaller cap than the editor export. */
  maxBitmapEdge?: number;
};

function DesignImageLayerNode({
  layer,
  handlers,
  maxBitmapEdge = EDITOR_BITMAP_MAX_EDGE,
}: Props) {
  const [image] = useImage(layer.src, "anonymous");
  const bitmap = useMemo(
    () => (image ? downscaleBitmap(image, maxBitmapEdge) : null),
    [image, maxBitmapEdge],
  );
  const imageRef = useRef<Konva.Image>(null);
  const pendingEffectPreview = useEditorStore((s) =>
    s.pendingEffectPreview?.layerId === layer.id ? s.pendingEffectPreview : null,
  );
  const effectsKey = serializeImageLayerEffects(layer, pendingEffectPreview);

  useEffect(() => {
    const node = imageRef.current;
    if (!node || !bitmap) return;

    applyImageLayerFilters(node, layer, pendingEffectPreview);
    node.getLayer()?.batchDraw();
  }, [
    bitmap,
    layer,
    pendingEffectPreview,
    effectsKey,
    layer.src,
    layer.width,
    layer.height,
    layer.scaleX,
    layer.scaleY,
  ]);

  return (
    <KonvaImage
      ref={imageRef}
      id={layer.id}
      image={bitmap ?? undefined}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      opacity={layer.opacity ?? 1}
      globalCompositeOperation={blendModeToKonva(layer.blendMode)}
      {...handlers}
    />
  );
}

export default memo(DesignImageLayerNode);
