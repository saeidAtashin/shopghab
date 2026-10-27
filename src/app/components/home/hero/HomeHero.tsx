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

function HeroPrimaryCta({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={HERO_CTAS.primary.href}
      className={cn(
        "inline-flex w-fit items-center gap-2 bg-gradient-to-l from-[#5145FF] to-[#6A5CFF] font-bold text-white shadow-[0_12px_30px_-16px_rgba(81,69,255,0.95)] transition hover:brightness-110",
        compact ? "min-h-10 rounded-full px-4 text-xs" : "min-h-11 rounded-full px-5 text-sm",
      )}
    >
      {HERO_CTAS.primary.label}
      <ArrowLeft className="h-4 w-4" aria-hidden />
    </Link>
  );
}

function HeroCopy({ mode = "full" }: { mode?: "full" | "ctaOnly" }) {
  if (mode === "ctaOnly") {
    return (
      <>
        <h1 className="sr-only">{HERO_HEADING}</h1>
        <HeroPrimaryCta compact />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl font-black leading-tight text-white">
        قاب گوشی،
        <span className="mt-1 block text-[#C4C0FF]">به سبک خودت</span>
      </h1>
      <p className="max-w-sm text-sm leading-7 text-white/80">{HERO_DESCRIPTION}</p>
      <HeroPrimaryCta />
    </div>
  );
}

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
      className={cn("overflow-hidden rounded-3xl border border-border bg-[#0c1220]", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="relative aspect-[16/9] min-h-40 xl:hidden">
        <Image
          src={SLIDES[0].src}
          alt={SLIDES[0].alt}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 50vw"
          className="object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080D18]/95 via-[#080D18]/55 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end px-4 pb-4">
          <HeroCopy mode="ctaOnly" />
        </div>
      </div>

      <div className="relative hidden min-h-[26rem] xl:block" aria-live="polite">
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
                sizes="70vw"
                className="object-cover object-center"
              />
            </div>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080D18]/88 via-[#080D18]/45 to-[#080D18]/10" />
        <div className="absolute inset-y-0 end-0 z-10 flex w-[min(100%,28rem)] items-center px-10">
          <HeroCopy />
        </div>
        <div className="absolute bottom-4 start-4 z-10 flex items-center gap-2">
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
    </section>
  );
}
