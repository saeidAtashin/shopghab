"use client";

import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import PhoneVerificationModal from "@/app/components/auth/PhoneVerificationModal";
import { HERO_CTAS, HERO_HEADING } from "@/app/components/home/hero/hero.constants";
import { useAuth } from "@/app/context/AuthContext";
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
    src: "/images/phonecase-design-banner.webp",
    alt: "قاب‌ موبایل با طرح اختصاصی شاپ قاب",
  },
] as const;

const AUTO_PLAY_MS = 5500;
const SWIPE_THRESHOLD_PX = 48;

type Props = {
  className?: string;
};

export default function HomeHero({ className }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const navigateToDesigns = useCallback(() => {
    router.push(HERO_CTAS.primary.href);
  }, [router]);

  const handleBannerActivate = useCallback(() => {
    if (authLoading) return;
    if (!user) {
      setLoginOpen(true);
      return;
    }
    navigateToDesigns();
  }, [authLoading, navigateToDesigns, user]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;
    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, prefersReducedMotion]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    didSwipe.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const startX = touchStartX.current;
      touchStartX.current = null;
      if (startX == null) return;

      const endX = event.changedTouches[0]?.clientX;
      if (endX == null) return;

      const delta = endX - startX;
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;

      didSwipe.current = true;
      if (delta > 0) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev],
  );

  const handleBannerClick = useCallback(() => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    handleBannerActivate();
  }, [handleBannerActivate]);

  return (
    <>
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
        <h1 className="sr-only">{HERO_HEADING}</h1>

        <div
          className="relative aspect-[16/9] min-h-40 xl:aspect-auto xl:min-h-[26rem]"
          aria-live="polite"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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
                  sizes="(max-width: 1280px) 100vw, 70vw"
                  className="object-cover object-center"
                />
              </div>
            );
          })}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#080D18]/88 via-[#080D18]/5 to-[#080D18]/10"
            aria-hidden
          />

          <button
            type="button"
            onClick={handleBannerClick}
            aria-label={HERO_CTAS.primary.label}
            className="absolute inset-0 z-[1] cursor-pointer border-0 bg-transparent p-0"
          />

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

      <PhoneVerificationModal
        open={loginOpen}
        phone=""
        description="برای ویرایش و استفاده از طرح‌ها، شماره موبایل خود را تأیید کنید."
        onClose={() => setLoginOpen(false)}
        onVerified={() => {
          setLoginOpen(false);
          navigateToDesigns();
        }}
      />
    </>
  );
}
