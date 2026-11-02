"use client";

import { useState } from "react";

import DesignImageZoom from "@/app/components/designs/DesignImageZoom";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

export default function ZoomableImage({ src, alt, className, imgClassName }: Props) {
  const [open, setOpen] = useState(false);
  if (!src) return null;

  const label = alt || "تصویر";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
          className,
        )}
        aria-label={`بزرگ‌نمایی ${label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className={cn("object-contain", imgClassName ?? "h-full w-full")}
        />
      </button>
      <DesignImageZoom open={open} src={src} alt={label} onClose={() => setOpen(false)} />
    </>
  );
}
