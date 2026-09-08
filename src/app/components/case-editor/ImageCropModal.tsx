"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

import type { CropRect } from "@/lib/design/image-tools/types";
import { createRafResizeHandler } from "@/lib/design/throttle-raf";
import { clamp, loadImageElement } from "@/lib/design/image-tools/utils";

type Props = {
  open: boolean;
  src: string;
  onClose: () => void;
  onConfirm: (rect: CropRect) => Promise<void>;
};

type NormalizedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function ImageCropModal({ open, src, onClose, onConfirm }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<NormalizedRect>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef<{ px: number; py: number; rect: NormalizedRect } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void loadImageElement(src)
      .then((img) => {
        if (cancelled) return;
        setNaturalSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
      })
      .catch(() => {
        if (!cancelled) onClose();
      });
    return () => {
      cancelled = true;
    };
  }, [open, src, onClose]);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const el = containerRef.current;
    const updateSize = () => {
      setDisplaySize({ width: el.clientWidth, height: el.clientHeight });
    };

    updateSize();
    const { handler, cancel } = createRafResizeHandler(updateSize);
    const observer = new ResizeObserver(handler);
    observer.observe(el);
    window.addEventListener("resize", handler);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handler);
      cancel();
    };
  }, [open, naturalSize.width, naturalSize.height]);

  const toPixels = useCallback(
    (rect: NormalizedRect) => ({
      x: rect.x * displaySize.width,
      y: rect.y * displaySize.height,
      width: rect.width * displaySize.width,
      height: rect.height * displaySize.height,
    }),
    [displaySize.height, displaySize.width],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = {
      px: e.clientX,
      py: e.clientY,
      rect: crop,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.current.px) / bounds.width;
    const dy = (e.clientY - dragStart.current.py) / bounds.height;
    const start = dragStart.current.rect;

    setCrop({
      x: clamp(start.x + dx, 0, 1 - start.width),
      y: clamp(start.y + dy, 0, 1 - start.height),
      width: start.width,
      height: start.height,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    dragStart.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleConfirm = async () => {
    if (!naturalSize.width || !naturalSize.height) return;
    setSaving(true);
    try {
      const rect: CropRect = {
        x: crop.x * naturalSize.width,
        y: crop.y * naturalSize.height,
        width: crop.width * naturalSize.width,
        height: crop.height * naturalSize.height,
      };
      await onConfirm(rect);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const cropPx = toPixels(crop);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-bold text-foreground">برش تصویر / Crop</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-background hover:text-foreground"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-auto p-4">
          <div
            ref={containerRef}
            className="relative mx-auto aspect-square max-h-[50vh] w-full overflow-hidden rounded-xl bg-black/40"
            style={
              naturalSize.width && naturalSize.height
                ? { aspectRatio: `${naturalSize.width}/${naturalSize.height}` }
                : undefined
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
            <div className="pointer-events-none absolute inset-0 bg-black/45" />
            <div
              className="absolute cursor-move border-2 border-cyan-400 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
              style={{
                left: cropPx.x,
                top: cropPx.y,
                width: cropPx.width,
                height: cropPx.height,
                pointerEvents: "auto",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </div>
          <p className="mt-2 text-[10px] text-muted">
            کادر را بکشید تا ناحیه برش را تنظیم کنید.
          </p>
        </div>

        <div className="flex gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-border px-4 py-2 text-xs text-muted hover:border-cyan-500/40"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={saving || !naturalSize.width}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            تأیید برش
          </button>
        </div>
      </div>
    </div>
  );
}
