"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Palette, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import HomeHeroContent from "./HomeHeroContent";
import { HERO_CTAS, HERO_HEADING } from "./hero.constants";

const SLIDES = [
  {
    src: "/banner.webp",
    alt: HERO_HEADING,
    hasContent: true,
    href: HERO_CTAS.primary.href,
    linkLabel: HERO_CTAS.primary.label,
    sheetTitle: HERO_HEADING,
    sheetLabel: HERO_CTAS.primary.label,
  },
  {
    src: "/images/banner-shopghab-org.webp",
    alt: "بنر شاپ‌قاب",
    hasContent: false,
    href: "/designs",
    linkLabel: "طراحی‌های آماده",
    sheetTitle: "طرح‌های آماده",
    sheetLabel: "مشاهده طرح‌ها",
  },
  {
    src: "/images/banner-shopghab-2.webp",
    alt: "بنر طراحی آماده شاپ‌قاب",
    hasContent: false,
    href: "/designs",
    linkLabel: "طراحی‌های آماده",
    sheetTitle: "طرح‌های آماده",
    sheetLabel: "مشاهده طرح‌ها",
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
  const SheetIcon = activeSlide.hasContent ? Palette : Sparkles;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="بنرهای اصلی"
      className="relative isolate w-full"
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
        className="relative aspect-[16/10] w-full overflow-hidden md:aspect-1672/941"
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
                className="object-cover object-center md:object-right"
              />
            </div>
          );
        })}

        <Link
          href={activeSlide.href}
          className="absolute inset-0 z-1"
          aria-label={activeSlide.linkLabel}
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 hidden transition-opacity md:block",
            prefersReducedMotion ? "duration-0" : "duration-500",
            activeSlide.hasContent ? "opacity-100" : "opacity-0",
          )}
          inert={!activeSlide.hasContent}
          aria-hidden={!activeSlide.hasContent}
        >
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.38)_36%,transparent_68%)]"
            aria-hidden
          />
          <div className="relative flex h-full items-center justify-end overflow-hidden px-8 pt-20 pb-14 lg:px-16">
            <div className="pointer-events-auto w-full max-w-md">
              <HomeHeroContent variant="onDark" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goPrev}
          aria-label="اسلاید قبلی"
          className="absolute inset-s-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition active:scale-95 hover:bg-black/50 md:h-11 md:w-11"
        >
          <ChevronRight className="h-[45%] w-[45%]" aria-hidden />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="اسلاید بعدی"
          className="absolute inset-e-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition active:scale-95 hover:bg-black/50 md:h-11 md:w-11"
        >
          <ChevronLeft className="h-[45%] w-[45%]" aria-hidden />
        </button>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full border border-white/20 bg-black/40 px-1.5 py-1 backdrop-blur-md">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`رفتن به اسلاید ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="flex h-6 w-6 items-center justify-center md:h-7 md:w-7"
            >
              <span
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "h-1.5 w-5 bg-cyan-400"
                    : "h-1.5 w-1.5 bg-white/55",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-background px-4 pt-3 pb-4 md:hidden">
        <p className="line-clamp-2 min-h-14 text-right text-lg font-black leading-7 text-foreground">
          {activeSlide.sheetTitle}
        </p>
        <Link
          href={activeSlide.href}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 text-sm font-bold text-black shadow-lg shadow-cyan-500/20"
        >
          <SheetIcon className="h-4 w-4" aria-hidden />
          {activeSlide.sheetLabel}
        </Link>
      </div>
    </section>
  );
}
