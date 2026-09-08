"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useEditorStore } from "@/lib/design/editor-store";
import type { StickerPack } from "@/lib/cases/types";

const PAGE_SIZE = 10;

type Props = {
  packs: StickerPack[];
};

function findScrollParent(element: HTMLElement | null): HTMLElement | null {
  let el = element?.parentElement ?? null;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
    el = el.parentElement;
  }
  return null;
}

export default function StickerPanel({ packs }: Props) {
  const addImageLayer = useEditorStore((s) => s.addImageLayer);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<HTMLElement | null>(null);

  const stickers = packs.flatMap((pack) => pack.stickers);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, stickers.length));
  }, [stickers.length]);

  useEffect(() => {
    scrollRootRef.current = findScrollParent(containerRef.current);
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [stickers.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibleCount >= stickers.length) return;

    const root = scrollRootRef.current ?? findScrollParent(containerRef.current);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root, rootMargin: "120px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, stickers.length, visibleCount]);

  const visibleStickers = stickers.slice(0, visibleCount);

  const handleSelect = (src: string, width: number, height: number) => {
    addImageLayer(src, width, height, true);
  };

  if (stickers.length === 0) {
    return (
      <p className="text-center text-xs text-muted">طراحی آماده‌ای موجود نیست.</p>
    );
  }

  return (
    <div ref={containerRef}>
      <p className="text-sm font-bold text-foreground">طراحی‌های آماده</p>
      <p className="mb-4 mt-1 text-xs text-muted">برای افزودن روی قاب کلیک کنید</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        {visibleStickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => handleSelect(sticker.src, sticker.width, sticker.height)}
            className="flex flex-col rounded-xl border border-border bg-card/60 p-3 text-center transition hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:shadow-md"
            title={sticker.name}
          >
            <div className="flex aspect-square items-center justify-center rounded-lg bg-background/50 p-2">
              <Image
                src={sticker.src}
                alt={sticker.name}
                width={96}
                height={96}
                loading="lazy"
                className="h-full w-full max-h-[72px] object-contain sm:max-h-[88px]"
              />
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] text-muted sm:text-xs">{sticker.name}</p>
          </button>
        ))}
      </div>

      {visibleCount < stickers.length ? (
        <div ref={sentinelRef} className="mt-3 flex flex-col items-center gap-2 py-2">
          <p className="text-[10px] text-muted">در حال بارگذاری…</p>
          <button
            type="button"
            onClick={loadMore}
            className="rounded-lg border border-border px-3 py-1.5 text-[10px] text-muted transition hover:border-cyan-500/50 hover:text-cyan-400"
          >
            نمایش {Math.min(PAGE_SIZE, stickers.length - visibleCount)} مورد بیشتر
          </button>
        </div>
      ) : (
        <p className="mt-3 text-center text-[10px] text-muted">
          {stickers.length} طراحی
        </p>
      )}
    </div>
  );
}
