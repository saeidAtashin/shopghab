"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

import { designedAssetUrl } from "@/lib/designed-assets";

type Frame = { src: string; thumb: string };

type Props = {
  href: string;
  alt: string;
  frames: Frame[];
  priority?: boolean;
};

export default function MockupFrameSwitcher({ href, alt, frames, priority = false }: Props) {
  const photos = frames.filter((frame) => frame.thumb || frame.src);
  const [index, setIndex] = useState(0);
  const frame = photos[index] ?? photos[0];
  const image = frame?.thumb || frame?.src || "";

  function step(event: MouseEvent<HTMLButtonElement>, direction: number): void {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + direction + photos.length) % photos.length);
  }

  return (
    <div className="relative h-40 overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%)] sm:h-44">
      <Link href={href} className="absolute inset-0">
        {image ? (
          <Image
            src={designedAssetUrl(image)}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain p-3"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted">بدون تصویر</span>
        )}
      </Link>
      {photos.length > 1 ? (
        <div className="absolute inset-x-2 bottom-2 z-10 flex justify-between">
          <button
            type="button"
            onClick={(event) => step(event, -1)}
            className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm"
            aria-label="تصویر قبلی"
          >
            قبلی
          </button>
          <button
            type="button"
            onClick={(event) => step(event, 1)}
            className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm"
            aria-label="تصویر بعدی"
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}
