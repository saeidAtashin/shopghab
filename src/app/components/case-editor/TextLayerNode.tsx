"use client";

import { memo } from "react";
import { Group, Label, Tag, Text } from "react-konva";

import {
  getDefaultTextBoxWidth,
  getTextOffsetX,
  normalizeFontFamily,
} from "@/lib/design/editor-fonts";
import type { TextLayer } from "@/lib/design/types";

type Props = {
  layer: TextLayer;
  canvasWidth: number;
  handlers?: Record<string, unknown>;
};

function TextLayerNode({ layer, canvasWidth, handlers }: Props) {
  const boxWidth = layer.width ?? getDefaultTextBoxWidth(canvasWidth);
  const padding = layer.padding ?? 8;
  const cornerRadius = layer.cornerRadius ?? 0;

  return (
    <Group
      id={layer.id}
      x={layer.x}
      y={layer.y}
      offsetX={getTextOffsetX(layer.align, boxWidth)}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      {...handlers}
    >
      <Label x={0} y={0}>
        {layer.backgroundFill ? (
          <Tag fill={layer.backgroundFill} cornerRadius={cornerRadius} />
        ) : null}
        <Text
          text={layer.text}
          fontFamily={normalizeFontFamily(layer.fontFamily)}
          fontSize={layer.fontSize}
          fill={layer.fill}
          align={layer.align}
          width={boxWidth}
          padding={padding}
        />
      </Label>
    </Group>
  );
}

export default memo(TextLayerNode);
