"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";

import { designedAssetUrl } from "@/lib/designed-assets";

type Props = {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
};

type Offset = { x: number; y: number };

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampOffset(offset: Offset, scale: number): Offset {
  const limit = Math.round((scale - 1) * 280);
  return {
    x: clamp(offset.x, -limit, limit),
    y: clamp(offset.y, -limit, limit),
  };
}

export default function DesignImageZoom({ open, src, alt, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  function applyScale(next: number): void {
    const clamped = clamp(next, MIN_SCALE, MAX_SCALE);
    setScale(clamped);
    setOffset((current) => (clamped === MIN_SCALE ? { x: 0, y: 0 } : clampOffset(current, clamped)));
  }

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setScale(MIN_SCALE);
      setOffset({ x: 0, y: 0 });
      if (!node.open) node.showModal();
      return;
    }
    if (node.open) node.close();
  }, [open]);

  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  useEffect(() => {
    const node = stageRef.current;
    if (!open || !node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      const next = clamp(scaleRef.current + direction * SCALE_STEP, MIN_SCALE, MAX_SCALE);
      setScale(next);
      setOffset((current) => (next === MIN_SCALE ? { x: 0, y: 0 } : clampOffset(current, next)));
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [open]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    if (scale <= MIN_SCALE) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>): void {
    const origin = dragOrigin.current;
    if (!origin) return;
    setOffset(
      clampOffset(
        {
          x: origin.ox + event.clientX - origin.x,
          y: origin.oy + event.clientY - origin.y,
        },
        scale,
      ),
    );
  }

  function endDrag(): void {
    dragOrigin.current = null;
    setDragging(false);
  }

  const label = alt || "طرح قاب";

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className="fixed inset-0 z-[400] m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-black/80"
      onClose={onClose}
    >
      <div
        className="relative flex h-full w-full items-center justify-center p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyScale(scale - SCALE_STEP)}
            disabled={scale <= MIN_SCALE}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm disabled:opacity-40"
            aria-label="کوچک‌نمایی"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => applyScale(scale + SCALE_STEP)}
            disabled={scale >= MAX_SCALE}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-sm disabled:opacity-40"
            aria-label="بزرگ‌نمایی"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {src ? (
        <div
          ref={stageRef}
          className="relative h-[85vh] w-[min(90vw,1100px)]"
          style={{ cursor: scale > MIN_SCALE ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={() => applyScale(scale > MIN_SCALE ? MIN_SCALE : 2)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: dragging ? "none" : "transform 150ms ease-out",
            }}
          >
            <Image
              src={designedAssetUrl(src)}
              alt={label}
              fill
              priority
              draggable={false}
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
      </div>
    </dialog>
  );
}
