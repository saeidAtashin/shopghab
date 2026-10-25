"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { Group, Label, Tag, Text, Shape } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { Context } from "konva/lib/Context";
import type { KonvaEventObject } from "konva/lib/Node";

import { downscaleBitmap, EDITOR_BITMAP_MAX_EDGE } from "@/lib/design/downscale-bitmap";
import { blendModeToKonva } from "@/lib/design/image-layer-filters";
import {
  getDefaultTextBoxWidth,
  getTextOffsetX,
  normalizeFontFamily,
} from "@/lib/design/editor-fonts";
import type { ImageLayer, TextLayer } from "@/lib/design/types";

type Props = {
  layer: TextLayer;
  canvasWidth: number;
  handlers?: Record<string, unknown>;
  textureImage?: ImageLayer | null;
};

function cacheTexture(group: Konva.Group | null) {
  if (!group) return;
  group.clearCache();
  const text = group.findOne<Konva.Text>("Text");
  if (!text || text.width() < 1 || text.height() < 1) return;
  group.cache({ pixelRatio: 2 });
  group.getLayer()?.batchDraw();
}

function TextLayerNode({
  layer,
  canvasWidth,
  handlers,
  textureImage = null,
}: Props) {
  const boxWidth = layer.width ?? getDefaultTextBoxWidth(canvasWidth);
  const padding = layer.padding ?? 8;
  const cornerRadius = layer.cornerRadius ?? 0;
  const fontFamily = normalizeFontFamily(layer.fontFamily);
  const cacheRef = useRef<Konva.Group>(null);
  const [source] = useImage(textureImage?.src ?? "", "anonymous");
  const bitmap = source ? downscaleBitmap(source, EDITOR_BITMAP_MAX_EDGE) : null;
  const textureOn = Boolean(textureImage && bitmap);
  const imageRef = useRef(textureImage);
  const bitmapRef = useRef(bitmap);
  imageRef.current = textureImage;
  bitmapRef.current = bitmap;

  const drawTexture = (context: Context, shape: Konva.Shape) => {
    const imageLayer = imageRef.current;
    const pixels = bitmapRef.current;
    const cacheGroup = shape.getParent();
    const outer = cacheGroup?.getParent();
    const caching = Boolean(
      (cacheGroup as (Konva.Group & { _isUnderCache?: boolean }) | null)?._isUnderCache,
    );
    if (!caching || !imageLayer || !pixels || !outer) return;

    const inverted = outer.getAbsoluteTransform().copy();
    inverted.invert();
    const imageTransform = new Konva.Transform();
    imageTransform.translate(imageLayer.x, imageLayer.y);
    imageTransform.rotate(Konva.getAngle(imageLayer.rotation));
    imageTransform.scale(imageLayer.scaleX, imageLayer.scaleY);
    inverted.multiply(imageTransform);
    const matrix = inverted.getMatrix();
    context.save();
    context.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    context.drawImage(pixels, 0, 0, imageLayer.width, imageLayer.height);
    context.restore();
  };

  useLayoutEffect(() => {
    const node = cacheRef.current;
    if (!textureOn) {
      node?.clearCache();
      return;
    }
    cacheTexture(node);
    return () => {
      node?.clearCache();
    };
  }, [
    textureOn,
    bitmap,
    layer.text,
    layer.fontFamily,
    layer.fontSize,
    layer.align,
    layer.width,
    layer.padding,
    layer.x,
    layer.y,
    layer.rotation,
    layer.scaleX,
    layer.scaleY,
    layer.opacity,
    layer.blendMode,
    textureImage?.id,
    textureImage?.x,
    textureImage?.y,
    textureImage?.rotation,
    textureImage?.scaleX,
    textureImage?.scaleY,
    textureImage?.width,
    textureImage?.height,
    textureImage?.src,
  ]);

  const activeHandlers = textureOn
    ? {
        ...handlers,
        onDragMove: (event: KonvaEventObject<DragEvent>) => {
          cacheTexture(cacheRef.current);
          const existing = handlers?.onDragMove;
          if (typeof existing === "function") existing(event);
        },
        onTransform: (event: KonvaEventObject<Event>) => {
          cacheTexture(cacheRef.current);
          const existing = handlers?.onTransform;
          if (typeof existing === "function") existing(event);
        },
      }
    : handlers;

  const textProps = {
    text: layer.text,
    fontFamily,
    fontSize: layer.fontSize,
    align: layer.align,
    width: boxWidth,
    padding,
  };

  return (
    <Group
      id={layer.id}
      x={layer.x}
      y={layer.y}
      offsetX={getTextOffsetX(layer.align, boxWidth)}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      opacity={textureOn ? 1 : (layer.opacity ?? 1)}
      globalCompositeOperation={
        textureOn ? "source-over" : blendModeToKonva(layer.blendMode)
      }
      {...activeHandlers}
    >
      <Label x={0} y={0}>
        {layer.backgroundFill ? (
          <Tag fill={layer.backgroundFill} cornerRadius={cornerRadius} />
        ) : null}
        <Text {...textProps} fill={layer.fill} opacity={textureOn ? 0 : 1} />
      </Label>
      {textureOn ? (
        <Group
          ref={cacheRef}
          listening={false}
          opacity={layer.opacity ?? 1}
          globalCompositeOperation={blendModeToKonva(layer.blendMode)}
        >
          <Shape listening={false} sceneFunc={drawTexture} />
          <Text
            {...textProps}
            fill="#ffffff"
            listening={false}
            globalCompositeOperation="destination-in"
          />
        </Group>
      ) : null}
    </Group>
  );
}

export default memo(TextLayerNode);
