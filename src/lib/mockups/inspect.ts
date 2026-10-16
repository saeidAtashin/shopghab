import { readFileSync } from "node:fs";

import { readPsd, type Layer } from "ag-psd";

export type InspectedLayer = {
  name: string;
  bounds: { left: number; top: number; right: number; bottom: number } | null;
  hidden: boolean;
  hasMask: boolean;
  hasEffects: boolean;
  smartObject: {
    id: string;
    type: string;
    width: number | null;
    height: number | null;
    transform: number[];
    hasWarp: boolean;
  } | null;
  children: InspectedLayer[];
};

export type PsdInspection = {
  width: number;
  height: number;
  layerCount: number;
  smartObjectCount: number;
  layers: InspectedLayer[];
  printableCandidates: string[];
};

function walk(layer: Layer): InspectedLayer {
  const hasBounds =
    typeof layer.left === "number" &&
    typeof layer.top === "number" &&
    typeof layer.right === "number" &&
    typeof layer.bottom === "number";
  const placed = layer.placedLayer;
  const children = (layer.children ?? []).map(walk);
  return {
    name: layer.name ?? "",
    bounds: hasBounds
      ? { left: layer.left ?? 0, top: layer.top ?? 0, right: layer.right ?? 0, bottom: layer.bottom ?? 0 }
      : null,
    hidden: Boolean(layer.hidden),
    hasMask: Boolean(layer.mask),
    hasEffects: Boolean(layer.effects),
    smartObject: placed
      ? {
          id: placed.id,
          type: placed.type,
          width: placed.width ?? null,
          height: placed.height ?? null,
          transform: placed.transform ?? [],
          hasWarp: Boolean(placed.warp),
        }
      : null,
    children,
  };
}

function countLayers(layers: InspectedLayer[]): { layers: number; smartObjects: number; names: string[] } {
  let layerCount = 0;
  let smartObjectCount = 0;
  const names: string[] = [];
  for (const layer of layers) {
    layerCount += 1;
    if (layer.smartObject) {
      smartObjectCount += 1;
      if (layer.name) names.push(layer.name);
    }
    const nested = countLayers(layer.children);
    layerCount += nested.layers;
    smartObjectCount += nested.smartObjects;
    names.push(...nested.names);
  }
  return { layers: layerCount, smartObjects: smartObjectCount, names };
}

export function inspectPsdBuffer(buffer: Buffer): PsdInspection {
  const psd = readPsd(buffer, {
    skipLayerImageData: true,
    skipCompositeImageData: true,
    skipThumbnail: true,
    skipLinkedFilesData: true,
    useImageData: true,
    logMissingFeatures: false,
  });
  const layers = (psd.children ?? []).map(walk);
  const counts = countLayers(layers);
  return {
    width: psd.width,
    height: psd.height,
    layerCount: counts.layers,
    smartObjectCount: counts.smartObjects,
    layers,
    printableCandidates: counts.names,
  };
}

export function inspectPsdFile(filePath: string): PsdInspection {
  return inspectPsdBuffer(readFileSync(filePath));
}
