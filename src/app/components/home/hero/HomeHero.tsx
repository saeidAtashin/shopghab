"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/images/banner-shopghab-dark.webp",
    alt: "قاب‌هایی با طرح‌های خاص برای همه انواع موبایل",
  },
  {
    src: "/images/banner-shopghab-light.webp",
    alt: "قاب‌هایی با طرح‌های خاص شاپ قاب",
  },
  {
    src: "/images/banner-shopghab-org.webp",
    alt: "بنر شاپ قاب",
  },
  {
    src: "/images/banner-shopghab-2.webp",
    alt: "بنر طراحی آماده شاپ قاب",
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
        className="relative mt-24 aspect-[1024/682] w-full overflow-hidden bg-background lg:aspect-auto lg:h-[calc(100dvh-6rem)] lg:w-full"
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
                className="object-contain object-center"
              />
            </div>
          );
        })}

        <Link
          href="/designs"
          className="absolute inset-0 z-1"
          aria-label="مشاهده طرح‌ها"
        />

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
    </section>
  );
}
