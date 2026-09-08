"use client";

import { Circle, Group, Line, Rect } from "react-konva";
import type { PhoneModel } from "@/lib/cases/types";
import { mapGeometryToCanvas } from "@/lib/cases/phone-back";

type KonvaLayersProps = {
  model: PhoneModel;
  bodyFill?: string;
  showBody?: boolean;
  showGuides?: boolean;
  showCamera?: boolean;
  showLogo?: boolean;
};

export function PhoneBackKonvaLayers({
  model,
  bodyFill = "#0a0a0f",
  showBody = true,
  showGuides = false,
  showCamera = true,
  showLogo = true,
}: KonvaLayersProps) {
  const geo = mapGeometryToCanvas(model);

  return (
    <>
      {showBody ? (
        <Rect
          x={0}
          y={0}
          width={geo.canvasWidth}
          height={geo.canvasHeight}
          fill={bodyFill}
          cornerRadius={geo.cornerRadius}
          listening={false}
        />
      ) : null}

      {showLogo && geo.logo ? (
        <Circle
          x={geo.logo.cx}
          y={geo.logo.cy}
          radius={geo.logo.r}
          fill="rgba(255,255,255,0.06)"
          listening={false}
        />
      ) : null}

      {showGuides ? (
        <>
          <Line
            points={[geo.canvasWidth / 2, 0, geo.canvasWidth / 2, geo.canvasHeight]}
            stroke="rgba(6,182,212,0.2)"
            dash={[4, 4]}
            listening={false}
          />
          <Line
            points={[0, geo.canvasHeight / 2, geo.canvasWidth, geo.canvasHeight / 2]}
            stroke="rgba(6,182,212,0.2)"
            dash={[4, 4]}
            listening={false}
          />
          <Rect
            x={geo.printSafe.x}
            y={geo.printSafe.y}
            width={geo.printSafe.width}
            height={geo.printSafe.height}
            stroke="rgba(6,182,212,0.35)"
            strokeWidth={1}
            dash={[6, 4]}
            listening={false}
          />
          <Rect
            x={0}
            y={0}
            width={geo.canvasWidth}
            height={geo.canvasHeight}
            stroke="rgba(6,182,212,0.2)"
            strokeWidth={1}
            cornerRadius={geo.cornerRadius}
            listening={false}
          />
          <Rect
            x={geo.cameraExclusion.x}
            y={geo.cameraExclusion.y}
            width={geo.cameraExclusion.width}
            height={geo.cameraExclusion.height}
            fill="rgba(239,68,68,0.12)"
            stroke="rgba(239,68,68,0.4)"
            strokeWidth={1}
            dash={[4, 3]}
            cornerRadius={geo.cameraModule.cornerRadius ?? 0}
            listening={false}
          />
        </>
      ) : null}

      {showCamera ? (
        <Group listening={false}>
          <Rect
            x={geo.cameraModule.x}
            y={geo.cameraModule.y}
            width={geo.cameraModule.width}
            height={geo.cameraModule.height}
            fill="#1a1a22"
            stroke="#2a2a35"
            strokeWidth={1}
            cornerRadius={geo.cameraModule.cornerRadius ?? 0}
          />
          {geo.lenses.map((lens, i) => (
            <Circle
              key={`lens-${i}`}
              x={lens.cx}
              y={lens.cy}
              radius={lens.r}
              fill="#0d0d12"
              stroke="#333340"
              strokeWidth={1}
            />
          ))}
          {geo.lidar ? (
            <Circle
              x={geo.lidar.cx}
              y={geo.lidar.cy}
              radius={geo.lidar.r}
              fill="#12121a"
              stroke="#333340"
              strokeWidth={1}
            />
          ) : null}
          {geo.flash ? (
            <Rect
              x={geo.flash.x}
              y={geo.flash.y}
              width={geo.flash.width}
              height={geo.flash.height}
              fill="#f5f5dc"
              opacity={0.85}
              cornerRadius={2}
            />
          ) : null}
        </Group>
      ) : null}
    </>
  );
}
