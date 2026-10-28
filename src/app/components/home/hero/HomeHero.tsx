"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { designedAssetUrl } from "@/lib/designed-assets";
import { cn } from "@/lib/utils";
import { HERO_HEADING } from "./hero.constants";

const FRAME = { width: 1600, height: 1200 };
const PRINT = { x: 543, y: 89, width: 514, height: 1034 };
const OUTER_SCALE = 0.46;
const INNER_COPIES = 2;
const OUTER_COPIES = 3;
const AUTO_MS = 3000;
const DRAG_PX = 8;
const PHONE_CENTER = (PRINT.x + PRINT.width / 2) / FRAME.width;

const PRINT_STYLE = {
  left: `${(PRINT.x / FRAME.width) * 100}%`,
  top: `${(PRINT.y / FRAME.height) * 100}%`,
  width: `${(PRINT.width / FRAME.width) * 100}%`,
  height: `${(PRINT.height / FRAME.height) * 100}%`,
} as const;

const RIBBON_CENTER = `${((PRINT.y + PRINT.height / 2) / FRAME.height) * 100}%`;

const OVERLAYS = [
  { file: "overlay-0.png", blend: "multiply" },
  { file: "overlay-1.png", blend: "screen" },
  { file: "overlay-2.png", blend: "normal" },
  { file: "overlay-3.png", blend: "multiply" },
  { file: "overlay-4.png", blend: "screen" },
  { file: "overlay-5.png", blend: "normal" },
] as const;

export type HeroFilmDesign = {
  id: string;
  title: string;
  href: string;
  artwork: string;
  thumb: string;
};

type Metrics = {
  innerCell: number;
  outerCell: number;
  outerHeight: number;
  phoneCenter: number;
  count: number;
};

type Drag = {
  id: number;
  startX: number;
  startProgress: number;
  cell: number;
  moved: boolean;
};

type Props = {
  designs: HeroFilmDesign[];
  className?: string;
};

function mod(value: number, count: number) {
  if (count <= 0) return 0;
  return ((value % count) + count) % count;
}

export default function HomeHero({ designs, className }: Props) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const count = designs.length;
  const frameRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<Metrics | null>(null);
  const progressRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerRef = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const designsRef = useRef(designs);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  designsRef.current = designs;

  const paint = useCallback((progress: number) => {
    const current = metricsRef.current;
    if (!current || current.count < 1 || !innerRef.current || !outerRef.current) return;
    const looped = mod(progress, current.count);
    progressRef.current = looped;
    innerRef.current.style.transform = `translate3d(${-looped * current.innerCell}px,0,0)`;
    const x = current.phoneCenter - (looped + current.count + 0.5) * current.outerCell;
    outerRef.current.style.transform = `translate3d(${x}px,0,0)`;
  }, []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const print = printRef.current;
    if (!frame || !print) return;

    const applyMetrics = () => {
      const frameWidth = frame.clientWidth;
      const innerCell = print.clientWidth;
      if (frameWidth < 1 || innerCell < 1) return;
      const next: Metrics = {
        innerCell,
        outerCell: innerCell * OUTER_SCALE,
        outerHeight: frameWidth * (FRAME.height / FRAME.width) * (PRINT.height / FRAME.height) * OUTER_SCALE,
        phoneCenter: frameWidth * PHONE_CENTER,
        count,
      };
      const prev = metricsRef.current;
      if (
        prev &&
        prev.innerCell === next.innerCell &&
        prev.outerCell === next.outerCell &&
        prev.outerHeight === next.outerHeight &&
        prev.phoneCenter === next.phoneCenter &&
        prev.count === next.count
      ) {
        return;
      }
      metricsRef.current = next;
      setMetrics(next);
    };

    applyMetrics();
    const observer = new ResizeObserver(applyMetrics);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [count]);

  useLayoutEffect(() => {
    paint(progressRef.current);
  }, [metrics, paint]);

  useEffect(() => {
    if (prefersReducedMotion || count < 1) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!draggingRef.current && !document.hidden) {
        const dt = Math.min(48, now - last);
        paint(progressRef.current + dt / AUTO_MS);
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, paint, prefersReducedMotion]);

  const localPoint = (clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    return { rect, x: clientX - rect.left, y: clientY - rect.top };
  };

  const insidePrint = (clientX: number, clientY: number) => {
    const point = localPoint(clientX, clientY);
    if (!point) return false;
    const left = point.rect.width * (PRINT.x / FRAME.width);
    const top = point.rect.height * (PRINT.y / FRAME.height);
    const width = point.rect.width * (PRINT.width / FRAME.width);
    const height = point.rect.height * (PRINT.height / FRAME.height);
    return point.x >= left && point.x <= left + width && point.y >= top && point.y <= top + height;
  };

  const designAt = (clientX: number, clientY: number) => {
    const current = metricsRef.current;
    const point = localPoint(clientX, clientY);
    const list = designsRef.current;
    if (!current || !point || list.length === 0) return null;
    if (point.x < 0 || point.y < 0 || point.x > point.rect.width || point.y > point.rect.height) return null;
    const progress = progressRef.current;
    const index = insidePrint(clientX, clientY)
      ? Math.floor(progress + (point.x - point.rect.width * (PRINT.x / FRAME.width)) / current.innerCell)
      : Math.floor(
          (point.x - (current.phoneCenter - (progress + current.count + 0.5) * current.outerCell)) /
            current.outerCell -
            current.count,
        );
    return list[mod(index, list.length)] ?? null;
  };

  const endDrag = (pointerId: number) => {
    const drag = pointerRef.current;
    if (!drag || drag.id !== pointerId) return null;
    pointerRef.current = null;
    draggingRef.current = false;
    if (drag.moved) suppressClick.current = true;
    const frame = frameRef.current;
    if (frame?.hasPointerCapture(pointerId)) frame.releasePointerCapture(pointerId);
    return drag;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="طرح‌های قاب"
      className={cn("relative w-full min-w-0", className)}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        const current = metricsRef.current;
        const frame = frameRef.current;
        if (!current || current.innerCell < 1 || !frame) return;
        draggingRef.current = true;
        pointerRef.current = {
          id: event.pointerId,
          startX: event.clientX,
          startProgress: progressRef.current,
          cell: insidePrint(event.clientX, event.clientY)
            ? (printRef.current?.clientWidth ?? current.innerCell)
            : current.outerCell,
          moved: false,
        };
        frame.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = pointerRef.current;
        if (!drag || drag.id !== event.pointerId || drag.cell < 1) return;
        const delta = event.clientX - drag.startX;
        if (Math.abs(delta) >= DRAG_PX) drag.moved = true;
        if (drag.moved) paint(drag.startProgress - delta / drag.cell);
      }}
      onPointerUp={(event) => {
        const drag = endDrag(event.pointerId);
        if (!drag || drag.moved) return;
        const design = designAt(event.clientX, event.clientY);
        if (!design) return;
        suppressClick.current = true;
        router.push(design.href);
      }}
      onPointerCancel={(event) => {
        endDrag(event.pointerId);
      }}
      onPointerLeave={(event) => {
        if (event.buttons !== 0) return;
        endDrag(event.pointerId);
      }}
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }}
    >
      <h1 className="sr-only">{HERO_HEADING}</h1>
      <div className="flex w-full min-w-0 justify-center overflow-hidden">
        <div
          ref={frameRef}
          dir="ltr"
          className="relative aspect-[4/3] w-[min(220%,68rem)] shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          <div
            className="absolute inset-x-0 overflow-hidden"
            style={{
              top: RIBBON_CENTER,
              height: metrics?.outerHeight ?? `${(PRINT.height / FRAME.height) * OUTER_SCALE * 100}%`,
              transform: "translateY(-50%)",
            }}
          >
            <div ref={outerRef} className="flex h-full w-max flex-row will-change-transform">
              {metrics
                ? Array.from({ length: OUTER_COPIES }, (_, copy) =>
                    designs.map((design) => (
                      <Link
                        key={`${copy}-${design.id}`}
                        href={design.href}
                        tabIndex={copy === 1 ? 0 : -1}
                        aria-hidden={copy === 1 ? undefined : true}
                        className="relative h-full shrink-0"
                        style={{ width: metrics.outerCell }}
                      >
                        <Image
                          src={designedAssetUrl(design.thumb)}
                          alt={copy === 1 ? design.title : ""}
                          fill
                          sizes="180px"
                          draggable={false}
                          className="object-cover"
                        />
                      </Link>
                    )),
                  )
                : null}
            </div>
          </div>

          <img
            src="/images/hero-phone/base.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-fill"
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: "url(/images/hero-phone/mask.png)",
              WebkitMaskImage: "url(/images/hero-phone/mask.png)",
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskMode: "alpha",
            }}
          >
            <div ref={printRef} className="absolute overflow-hidden" style={PRINT_STYLE}>
              <div ref={innerRef} className="flex h-full w-max flex-row will-change-transform" aria-hidden>
                {metrics
                  ? Array.from({ length: INNER_COPIES }, (_, copy) =>
                      designs.map((design, index) => (
                        <div
                          key={`${copy}-${design.id}`}
                          className="relative h-full shrink-0"
                          style={{ width: metrics.innerCell }}
                        >
                          <Image
                            src={designedAssetUrl(design.artwork)}
                            alt=""
                            fill
                            priority={copy === 0 && index === 0}
                            sizes="420px"
                            draggable={false}
                            className="object-cover"
                          />
                        </div>
                      )),
                    )
                  : null}
              </div>
            </div>
          </div>

          {OVERLAYS.map((overlay) => (
            <img
              key={overlay.file}
              src={`/images/hero-phone/${overlay.file}`}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-fill"
              style={{ mixBlendMode: overlay.blend }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
