"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import HomeHeroContent from "./HomeHeroContent";
import { HERO_HEADING } from "./hero.constants";

const SLIDES = [
  {
    src: "/banner.png",
    alt: HERO_HEADING,
    hasContent: true,
  },
  {
    src: "/images/banner-shopghab-org.webp",
    alt: "بنر شاپ‌قاب",
    hasContent: false,
  },
  {
    src: "/images/banner-shopghab-2.webp",
    alt: "بنر طراحی آماده شاپ‌قاب",
    hasContent: false,
  },
] as const;

const AUTO_PLAY_MS = 5500;

export default function HomeHero() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, prefersReducedMotion]);

  const activeSlide = SLIDES[activeIndex];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="بنرهای اصلی"
      className="relative isolate w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div
        className="relative aspect-[1672/941] w-full"
        style={{ containerType: "size" }}
        aria-live="polite"
      >
        {SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.src}
              className={cn(
                "absolute inset-0 transition-opacity motion-reduce:duration-0",
                prefersReducedMotion ? "duration-0" : "duration-500",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.src}
                alt={isActive ? slide.alt : ""}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-right"
              />
            </div>
          );
        })}

        <div
          className={cn(
            "absolute inset-0 z-10 transition-opacity",
            prefersReducedMotion ? "duration-0" : "duration-500",
            activeSlide.hasContent ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          inert={!activeSlide.hasContent}
          aria-hidden={!activeSlide.hasContent}
        >
          <div
            className="absolute inset-0 bg-linear-to-r from-black/90 via-black/55 to-transparent"
            aria-hidden
          />
          <div className="relative flex h-full items-center justify-end overflow-hidden px-[2.5cqi] pb-[2.8cqi] pt-16 md:pt-20">
            <div className="w-[36rem] origin-left [zoom:clamp(0.28,min(calc(42cqi/36rem),calc(70cqh/32rem)),1)]">
              <HomeHeroContent variant="onDark" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="اسلاید قبلی"
          className="absolute start-[1.5cqi] top-1/2 z-20 flex h-[clamp(1.75rem,3.2cqi,2.75rem)] w-[clamp(1.75rem,3.2cqi,2.75rem)] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition active:scale-95 hover:bg-black/50"
        >
          <ChevronRight className="h-[45%] w-[45%]" aria-hidden />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="اسلاید بعدی"
          className="absolute end-[1.5cqi] top-1/2 z-20 flex h-[clamp(1.75rem,3.2cqi,2.75rem)] w-[clamp(1.75rem,3.2cqi,2.75rem)] -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition active:scale-95 hover:bg-black/50"
        >
          <ChevronLeft className="h-[45%] w-[45%]" aria-hidden />
        </button>

        <div className="absolute bottom-[2.2cqi] left-1/2 z-20 flex -translate-x-1/2 gap-[0.55cqi]">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`رفتن به اسلاید ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={cn(
                "rounded-full transition-all duration-300",
                index === activeIndex
                  ? "h-[0.45cqi] w-[1.6cqi] min-h-1.5 min-w-5 bg-cyan-400"
                  : "h-[0.45cqi] w-[0.45cqi] min-h-1.5 min-w-1.5 bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
