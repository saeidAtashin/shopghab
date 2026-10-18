"use client";

import { useState } from "react";
import Image from "next/image";

import { designedAssetUrl } from "@/lib/designed-assets";
import { cn } from "@/lib/utils";
import DesignImageZoom from "./DesignImageZoom";
import DesignSamplePhoneHover from "./DesignSamplePhoneHover";

type Props = {
  id: string;
  src: string;
  alt: string;
  thumb?: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  imageClassName?: string;
};

export default function DesignArtworkStage({
  id,
  src,
  alt,
  thumb,
  priority = false,
  sizes,
  className,
  imageClassName = "object-contain p-3",
}: Props) {
  const [active, setActive] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!src) {
    return (
      <div className={cn("flex items-center justify-center text-xs text-muted", className)}>
        بدون تصویر
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%)]",
        className,
      )}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) setActive(false);
      }}
    >
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/50"
        aria-label={`بزرگ‌نمایی ${alt}`}
      >
        <Image
          src={designedAssetUrl(src)}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            imageClassName,
            "transition-opacity duration-300 motion-reduce:transition-none",
            active && "opacity-0",
          )}
        />
      </button>

      {active ? (
        <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden>
          <DesignSamplePhoneHover id={id} imageSrc={thumb || src} active />
        </div>
      ) : null}

      <DesignImageZoom open={zoomOpen} src={src} alt={alt} onClose={() => setZoomOpen(false)} />
    </div>
  );
}
