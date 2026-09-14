"use client";

import { useMemo } from "react";
import type { RefObject } from "react";

import { useElementSize } from "@/lib/design/use-element-size";

export const DESKTOP_PHONE_WIDTH = 300;

const DEFAULT_MAX_WIDTH = 280;
const DEFAULT_MAX_HEIGHT = 480;
const MOBILE_FALLBACK_WIDTH = 200;
const MOBILE_FALLBACK_HEIGHT = 360;

export type CanvasDisplayMode = "mobile" | "desktop";

type CanvasAspect = {
  width: number;
  height: number;
};

function fitAspect(
  availableWidth: number,
  availableHeight: number,
  aspectW: number,
  aspectH: number,
) {
  const ratio = aspectH / aspectW;
  let width = availableWidth;
  let height = width * ratio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height / ratio;
  }
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

export function useCanvasDisplaySize(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  mode: CanvasDisplayMode = "mobile",
  canvasAspect?: CanvasAspect,
) {
  const { width, height } = useElementSize(containerRef, mode);

  return useMemo(() => {
    if (!enabled) {
      return { width: DEFAULT_MAX_WIDTH, height: DEFAULT_MAX_HEIGHT };
    }

    const aspectW = canvasAspect?.width ?? 1;
    const aspectH = canvasAspect?.height ?? 2;

    if (mode === "desktop") {
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
      return fitAspect(
        MOBILE_FALLBACK_WIDTH,
        MOBILE_FALLBACK_HEIGHT,
        aspectW,
        aspectH,
      );
    }

    const padding = 16;
    return fitAspect(
      Math.max(120, width - padding),
      Math.max(160, height - padding),
      aspectW,
      aspectH,
    );
  }, [enabled, mode, width, height, canvasAspect?.width, canvasAspect?.height]);
}
