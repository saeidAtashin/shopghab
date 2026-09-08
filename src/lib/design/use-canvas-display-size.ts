"use client";

import { useMemo } from "react";
import type { RefObject } from "react";

import { useElementSize } from "@/lib/design/use-element-size";

export const DESKTOP_PHONE_WIDTH = 300;

const DEFAULT_MAX_WIDTH = 280;
const DEFAULT_MAX_HEIGHT = 480;

export type CanvasDisplayMode = "mobile" | "desktop";

type CanvasAspect = {
  width: number;
  height: number;
};

export function useCanvasDisplaySize(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  mode: CanvasDisplayMode = "mobile",
  canvasAspect?: CanvasAspect,
) {
  const { width, height } = useElementSize(containerRef);

  return useMemo(() => {
    if (!enabled) {
      return { width: DEFAULT_MAX_WIDTH, height: DEFAULT_MAX_HEIGHT };
    }

    if (mode === "desktop") {
      const aspectW = canvasAspect?.width ?? 1;
      const aspectH = canvasAspect?.height ?? 2;
      const ratio = aspectH / aspectW;

      let targetWidth = DESKTOP_PHONE_WIDTH;
      let targetHeight = Math.round(targetWidth * ratio);

      const padding = 64;
      if (height > 0) {
        const maxHeight = Math.max(240, height - padding);
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = Math.round(targetHeight / ratio);
        }
      }

      return { width: targetWidth, height: targetHeight };
    }

    if (width <= 0 || height <= 0) {
      return { width: DEFAULT_MAX_WIDTH, height: DEFAULT_MAX_HEIGHT };
    }

    const padding = 24;
    const availableWidth = Math.max(160, width - padding);
    const availableHeight = Math.max(240, height - padding);
    const isWide = width >= 500;

    return {
      width: Math.min(availableWidth, isWide ? 340 : 320),
      height: Math.min(availableHeight, 680),
    };
  }, [enabled, mode, width, height, canvasAspect?.width, canvasAspect?.height]);
}
