"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { HERO_CTAS, HERO_DESCRIPTION, HERO_HEADING } from "@/app/components/home/hero/hero.constants";
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
] as const;

const AUTO_PLAY_MS = 5500;

type Props = {
  className?: string;
};

export default function HomeHero({ className }: Props) {
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
      aria-label="بنر اصلی"
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card",
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="grid min-h-[22rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:min-h-[26rem]">
        <div className="flex flex-col justify-center gap-5 px-6 py-8 sm:px-8 lg:px-10">
          <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl">
            {HERO_HEADING}
          </h1>
          <p className="max-w-md text-sm leading-7 text-muted sm:text-base">{HERO_DESCRIPTION}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={HERO_CTAS.primary.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-l from-[#5145FF] to-[#6A5CFF] px-5 text-sm font-bold text-white shadow-[0_12px_30px_-16px_rgba(81,69,255,0.95)] transition hover:brightness-110"
            >
              {HERO_CTAS.primary.label}
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={HERO_CTAS.secondary.href}
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-bold text-foreground transition hover:border-[#5145FF]/50"
            >
              {HERO_CTAS.secondary.label}
            </Link>
          </div>
        </div>

        <div className="relative min-h-56 lg:min-h-full" aria-live="polite">
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
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D18]/35 to-transparent lg:bg-gradient-to-l" />
          <div className="absolute bottom-3 start-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="اسلاید قبلی"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="اسلاید بعدی"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-1">
              {SLIDES.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`رفتن به اسلاید ${(index + 1).toLocaleString("fa-IR")}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className="flex h-6 w-6 items-center justify-center"
                >
                  <span
                    className={cn(
                      "rounded-full transition-all",
                      index === activeIndex ? "h-1.5 w-5 bg-[#5145FF]" : "h-1.5 w-1.5 bg-white/60",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
