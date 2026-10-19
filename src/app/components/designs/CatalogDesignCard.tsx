"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DesignArtworkStage from "@/app/components/designs/DesignArtworkStage";
import { designedAssetUrl } from "@/lib/designed-assets";
import { designImageAlt } from "@/lib/mockups/display";
import type { PublicDesign } from "@/lib/catalog/schema";

type Frame = { src: string; thumb: string; artwork: boolean };

type Props = {
  design: PublicDesign;
  categoryName?: string;
  priority?: boolean;
};

function cardFrames(design: PublicDesign): Frame[] {
  const frames = design.frames
    .filter((frame) => frame.src || frame.thumb)
    .map((frame) => ({
      src: frame.src || frame.thumb,
      thumb: frame.thumb || frame.src,
      artwork: frame.src === design.artworkPath,
    }));
  if (design.artworkPath && !frames.some((frame) => frame.src === design.artworkPath)) {
    frames.push({ src: design.artworkPath, thumb: design.artworkPath, artwork: true });
  }
  return frames;
}

export default function CatalogDesignCard({ design, categoryName, priority = false }: Props) {
  const alt = designImageAlt(design);
  const href = `/designs/${design.slug}`;
  const frames = cardFrames(design);
  const [index, setIndex] = useState(0);
  const frame = frames[index] ?? frames[0];

  function step(event: MouseEvent<HTMLButtonElement>, direction: number): void {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + direction + frames.length) % frames.length);
  }

  return (
    <article className="group/card flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 text-right shadow-[0_8px_32px_-8px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35">
      <div className="relative">
        {categoryName ? (
          <span className="pointer-events-none absolute end-2.5 top-2.5 z-20 rounded-lg border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm">
            {categoryName}
          </span>
        ) : null}
        <div className="relative h-40 overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%)] sm:h-44">
          {frame ? (
            <Link
              href={href}
              aria-label={alt}
              className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/50"
            >
              {frame.artwork ? (
                <DesignArtworkStage
                  id={design.id}
                  src={frame.src}
                  thumb={frame.thumb}
                  alt={alt}
                  priority={priority && index === 0}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="h-full bg-transparent"
                  zoomable={false}
                />
              ) : (
                <Image
                  src={designedAssetUrl(frame.thumb || frame.src)}
                  alt={alt}
                  fill
                  priority={priority && index === 0}
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain p-3"
                />
              )}
            </Link>
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">بدون تصویر</span>
          )}
          {frames.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => step(event, -1)}
                className="absolute start-2 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/85"
                aria-label="تصویر قبلی"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={(event) => step(event, 1)}
                className="absolute end-2 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/85"
                aria-label="تصویر بعدی"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      </div>
      <Link
        href={href}
        className="flex flex-1 flex-col gap-2 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      >
        <h2 className="line-clamp-2 text-sm font-bold text-foreground">{design.title}</h2>
        {design.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-6 text-muted">{design.shortDescription}</p>
        ) : null}
      </Link>
    </article>
  );
}
