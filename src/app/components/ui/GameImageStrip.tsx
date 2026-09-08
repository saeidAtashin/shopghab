"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  sizes: string;
  className?: string;
  aspectClass?: string;
  imageClassName?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
};

function StripImage({
  src,
  alt,
  sizes,
  imageClassName,
  priority,
  loading,
  fetchPriority,
  placeholder,
  blurDataURL,
}: {
  src: string;
  alt: string;
  sizes: string;
  imageClassName: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={imageClassName}
      priority={priority}
      loading={loading ?? (priority ? undefined : "lazy")}
      fetchPriority={fetchPriority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
    />
  );
}

function LazyCarousel({
  images,
  alt,
  sizes,
  aspectClass,
  className,
  imageClassName,
  priority,
  loading,
  fetchPriority,
  placeholder,
  blurDataURL,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(
    () => new Set([0]),
  );

  const updateVisibleSlides = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;
    if (slideWidth <= 0) return;

    const center = container.scrollLeft + slideWidth / 2;
    const activeIndex = Math.min(
      images.length - 1,
      Math.max(0, Math.round(center / slideWidth)),
    );

    setVisibleIndices((prev) => {
      const next = new Set(prev);
      next.add(activeIndex);
      if (activeIndex > 0) next.add(activeIndex - 1);
      if (activeIndex < images.length - 1) next.add(activeIndex + 1);
      return next.size === prev.size ? prev : next;
    });
  }, [images.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateVisibleSlides();
    container.addEventListener("scroll", updateVisibleSlides, { passive: true });
    return () => container.removeEventListener("scroll", updateVisibleSlides);
  }, [updateVisibleSlides]);

  return (
    <div className={cn("relative overflow-hidden bg-card", aspectClass, className)}>
      <div
        ref={scrollRef}
        className="absolute inset-0 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex h-full">
          {images.map((src, index) => (
            <div
              key={src}
              className="relative h-full w-full shrink-0 snap-start"
            >
              {visibleIndices.has(index) ? (
                <StripImage
                  src={src}
                  alt={index === 0 ? alt : `${alt} — تصویر ${index + 1}`}
                  sizes={sizes}
                  imageClassName={imageClassName ?? "object-cover"}
                  priority={priority && index === 0}
                  loading={index === 0 ? loading : "lazy"}
                  fetchPriority={priority && index === 0 ? fetchPriority : "low"}
                  placeholder={index === 0 ? placeholder : undefined}
                  blurDataURL={index === 0 ? blurDataURL : undefined}
                />
              ) : (
                <div className="h-full w-full bg-card" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1"
        aria-hidden
      >
        {images.map((src, index) => (
          <span
            key={src}
            className={cn(
              "h-1.5 rounded-full bg-white/40",
              index === 0 ? "w-3 bg-white/80" : "w-1.5",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function GameImageStrip({
  images,
  alt,
  sizes,
  className,
  aspectClass = "aspect-[3/4]",
  imageClassName = "object-cover",
  priority,
  loading,
  fetchPriority,
  placeholder,
  blurDataURL,
}: Props) {
  if (images.length === 0) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-card text-xs text-muted",
          aspectClass,
          className,
        )}
      >
        بدون تصویر
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={cn("relative overflow-hidden bg-card", aspectClass, className)}>
        <StripImage
          src={images[0]}
          alt={alt}
          sizes={sizes}
          imageClassName={imageClassName}
          priority={priority}
          loading={loading}
          fetchPriority={fetchPriority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      </div>
    );
  }

  return (
    <LazyCarousel
      images={images}
      alt={alt}
      sizes={sizes}
      className={className}
      aspectClass={aspectClass}
      imageClassName={imageClassName}
      priority={priority}
      loading={loading}
      fetchPriority={fetchPriority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
    />
  );
}
