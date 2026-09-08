"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cheatHubPath } from "@/lib/blog-cheats-paths";
import { cn } from "@/lib/utils";

type BannerAlign = "right" | "center" | "left";

type BannerSlide = {
  image: string;
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  chips: string[];
  href: string;
  label: string;
  mobileLabel: string;
  align: BannerAlign;
  accent: string;
  glow: string;
  icon: LucideIcon;
};

const BANNER_SLIDES: BannerSlide[] = [
  {
    image: "/cases/og-default.jpg",
    tag: "خدمات تخصصی",
    title: "تعمیرات",
    highlight: "تخصصی",
    subtitle: "PS5، PS4 و Xbox با عیب‌یابی دقیق و ضمانت واقعی",
    chips: ["تحویل سریع", "قطعات اصلی", "گارانتی خدمات"],
    href: "/repair",
    label: "ثبت درخواست تعمیر",
    mobileLabel: "ثبت درخواست",
    align: "right",
    accent: "from-cyan-300 via-sky-400 to-blue-500",
    glow: "bg-cyan-400/20",
    icon: Gamepad2,
  },
  {
    image: "/cases/og-default.jpg",
    tag: "ارسال فوری",
    title: "تحویل کالا",
    highlight: "در منزل",
    subtitle: "سریع‌ترین زمان ممکن — بدون دردسر، مستقیم تا درب منزل",
    chips: ["پیک اختصاصی", "پیگیری لحظه‌ای", "بسته‌بندی امن"],
    href: "/repair",
    label: "همین حالا سفارش بده",
    mobileLabel: "سفارش دهید",
    align: "right",
    accent: "from-violet-300 via-fuchsia-400 to-cyan-400",
    glow: "bg-violet-400/20",
    icon: Truck,
  },
  {
    image: "/cases/og-default.jpg",
    tag: "فروشگاه آنلاین",
    title: "کنسول و",
    highlight: "لوازم جانبی",
    subtitle: "خرید مطمئن با مشاوره رایگان و ارسال به سراسر کشور",
    chips: ["PS5 / PS4", "دسته بازی", "لوازم جانبی"],
    href: "/shop",
    label: "رفتن به فروشگاه",
    mobileLabel: "فروشگاه",
    align: "center",
    accent: "from-amber-200 via-orange-300 to-cyan-400",
    glow: "bg-amber-400/20",
    icon: ShoppingBag,
  },
  {
    image: "/cases/og-default.jpg",
    tag: "راهنمای گیمر",
    title: "رمز و چیت",
    highlight: "بازی‌ها",
    subtitle: "۴۰ بازی برتر PS5 و Xbox — کدهای تقلب و ترفند با راهنمای فارسی",
    chips: ["GTA V", "Minecraft", "Sims 4"],
    href: cheatHubPath(),
    label: "مشاهده چیت‌ها",
    mobileLabel: "چیت‌ها",
    align: "right",
    accent: "from-emerald-300 via-green-400 to-lime-400",
    glow: "bg-emerald-400/20",
    icon: Zap,
  },
];

const AUTO_PLAY_MS = 5500;
const EASE = [0.22, 1, 0.36, 1] as const;

function makeVariants(
  prefersReducedMotion: boolean | null,
  hidden: Record<string, number | string>,
  visible: Record<string, number | string>,
  delay = 0,
): Variants | undefined {
  if (prefersReducedMotion) return undefined;
  return {
    hidden,
    visible: {
      ...visible,
      transition: { duration: 0.65, delay, ease: EASE },
    },
  };
}

function BannerMobileContent({
  slide,
  prefersReducedMotion,
}: {
  slide: BannerSlide;
  prefersReducedMotion: boolean | null;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background/95 via-background/70 to-transparent px-3 pb-2.5 pt-10 sm:hidden">
      <motion.div
        key={slide.image}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-2"
      >
        <p className="min-w-0 text-[13px] font-bold leading-tight text-foreground">
          {slide.title}{" "}
          <span className={cn("bg-gradient-to-l bg-clip-text text-transparent", slide.accent)}>
            {slide.highlight}
          </span>
        </p>
        <Link
          href={slide.href}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-cyan-400/35 bg-blue-600/90 px-2.5 py-1.5 text-[11px] font-bold text-white"
        >
          {slide.mobileLabel}
          <ArrowLeft className="h-3 w-3" aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}

function alignJustify(align: BannerAlign): string {
  if (align === "center") return "justify-center";
  if (align === "left") return "justify-start";
  return "justify-end";
}

function alignText(align: BannerAlign): string {
  if (align === "center") return "text-center";
  if (align === "left") return "text-left";
  return "text-right";
}

function alignEnterX(align: BannerAlign, magnitude: number): number {
  if (align === "center") return 0;
  if (align === "left") return -magnitude;
  return magnitude;
}

function BannerDesktopContent({
  slide,
  prefersReducedMotion,
}: {
  slide: BannerSlide;
  prefersReducedMotion: boolean | null;
}) {
  const { align } = slide;
  const isCentered = align === "center";
  const Icon = slide.icon;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 hidden px-8 md:px-12 lg:px-16 sm:flex",
        "items-center",
        alignJustify(align),
      )}
    >
      <motion.div
        key={slide.image}
        variants={makeVariants(
          prefersReducedMotion,
          { opacity: 0, scale: 0.94, y: 20 },
          { opacity: 1, scale: 1, y: 0 },
          0,
        )}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        className={cn("relative w-full max-w-md", isCentered && "mx-auto")}
      >
        <motion.div
          className={cn("relative", !prefersReducedMotion && "animate-float")}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
            className={cn(
              "pointer-events-none absolute -inset-4 rounded-[32px] blur-3xl",
              slide.glow,
            )}
            aria-hidden
          />

          <div className="relative overflow-hidden rounded-[28px] border border-border bg-background/45 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-7">
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent_40%,rgba(34,211,238,0.07))]"
              aria-hidden
            />

            <motion.div
              variants={makeVariants(
                prefersReducedMotion,
                {
                  opacity: 0,
                  x: alignEnterX(align, 36),
                  y: isCentered ? -16 : 0,
                },
                { opacity: 1, x: 0, y: 0 },
                0.08,
              )}
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              className={cn(
                "mb-3 flex items-center gap-2.5",
                alignJustify(align),
              )}
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface shadow-[0_0_24px_rgba(34,211,238,0.15)]",
                  slide.glow,
                )}
              >
                <Icon className="h-5 w-5 text-cyan-200" aria-hidden />
              </motion.div>

              <motion.span
                variants={makeVariants(
                  prefersReducedMotion,
                  { opacity: 0, scale: 0.8 },
                  { opacity: 1, scale: 1 },
                  0.18,
                )}
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
                className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
                {slide.tag}
              </motion.span>
            </motion.div>

            <div className={alignText(align)}>
              <motion.h2
                variants={makeVariants(
                  prefersReducedMotion,
                  {
                    opacity: 0,
                    x: alignEnterX(align, 40),
                    filter: "blur(6px)",
                  },
                  { opacity: 1, x: 0, filter: "blur(0px)" },
                  0.22,
                )}
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
                className="text-2xl font-black leading-tight text-foreground md:text-3xl"
              >
                {slide.title}{" "}
                <motion.span
                  variants={makeVariants(
                    prefersReducedMotion,
                    { opacity: 0, y: 16, scale: 0.92 },
                    { opacity: 1, y: 0, scale: 1 },
                    0.36,
                  )}
                  initial={prefersReducedMotion ? false : "hidden"}
                  animate="visible"
                  className={cn(
                    "inline-block bg-gradient-to-l bg-clip-text text-transparent animate-gradient-x bg-[length:220%_220%]",
                    slide.accent,
                  )}
                >
                  {slide.highlight}
                </motion.span>
              </motion.h2>

              <motion.p
                variants={makeVariants(
                  prefersReducedMotion,
                  { opacity: 0, y: 10 },
                  { opacity: 1, y: 0 },
                  0.46,
                )}
                initial={prefersReducedMotion ? false : "hidden"}
                animate="visible"
                className="mt-2 text-sm leading-7 text-muted/90"
              >
                {slide.subtitle}
              </motion.p>
            </div>

            <motion.div
              variants={makeVariants(
                prefersReducedMotion,
                { opacity: 0 },
                { opacity: 1 },
                0.52,
              )}
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              className={cn("mt-3 flex flex-wrap gap-1.5", alignJustify(align))}
            >
              {slide.chips.map((chip, index) => (
                <motion.span
                  key={chip}
                  variants={makeVariants(
                    prefersReducedMotion,
                    { opacity: 0, y: 14, scale: 0.88 },
                    { opacity: 1, y: 0, scale: 1 },
                    0.58 + index * 0.08,
                  )}
                  initial={prefersReducedMotion ? false : "hidden"}
                  animate="visible"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {chip}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              variants={makeVariants(
                prefersReducedMotion,
                { opacity: 0, y: 24, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1 },
                0.72,
              )}
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              className={cn("mt-5 flex", alignJustify(align))}
            >
              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, -4, 0],
                        boxShadow: [
                          "0 10px 40px rgba(59,130,246,0.35), 0 0 24px rgba(34,211,238,0.2)",
                          "0 16px 55px rgba(34,211,238,0.45), 0 0 36px rgba(34,211,238,0.35)",
                          "0 10px 40px rgba(59,130,246,0.35), 0 0 24px rgba(34,211,238,0.2)",
                        ],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                }
                className="rounded-2xl"
              >
                <Link
                  href={slide.href}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500/90 px-7 py-3.5 text-base font-bold text-white shadow-[0_10px_40px_rgba(59,130,246,0.35)] transition duration-300 hover:scale-[1.05]"
                >
                  <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.35),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
                  <motion.span
                    animate={prefersReducedMotion ? undefined : { x: [0, -3, 0] }}
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    }
                  >
                    {slide.label}
                  </motion.span>
                  <ArrowLeft className="h-5 w-5 opacity-90" aria-hidden />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function HomeBannerCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + BANNER_SLIDES.length) % BANNER_SLIDES.length);
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

  const slide = BANNER_SLIDES[activeIndex];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="بنرهای اصلی"
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div
        className="relative h-[168px] w-full sm:h-[380px] md:h-[460px] lg:h-[500px]"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.image}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.06, 1] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 9, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Image
                src={slide.image}
                alt={`${slide.title} ${slide.highlight}`}
                fill
                priority={activeIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>

            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-t from-background/80 via-background/20 to-transparent sm:from-transparent sm:via-transparent",
                slide.align === "center" &&
                  "sm:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.28)_55%,transparent_100%)]",
                slide.align === "right" &&
                  "sm:bg-gradient-to-l sm:from-background/80 sm:via-background/40 sm:to-transparent",
                slide.align === "left" &&
                  "sm:bg-gradient-to-r sm:from-background/80 sm:via-background/40 sm:to-transparent",
              )}
            />

            <BannerMobileContent
              slide={slide}
              prefersReducedMotion={prefersReducedMotion}
            />
            <BannerDesktopContent
              slide={slide}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={goPrev}
          aria-label="اسلاید قبلی"
          className="absolute start-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/50 text-foreground backdrop-blur-sm transition active:scale-95 sm:start-5 sm:h-11 sm:w-11 sm:hover:scale-105 sm:hover:bg-background/60"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" aria-hidden />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="اسلاید بعدی"
          className="absolute end-2 top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/50 text-foreground backdrop-blur-sm transition active:scale-95 sm:end-5 sm:h-11 sm:w-11 sm:hover:scale-105 sm:hover:bg-background/60"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" aria-hidden />
        </button>

        <div className="absolute bottom-[3.25rem] left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
          {BANNER_SLIDES.map((item, index) => (
            <button
              key={item.image}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`رفتن به اسلاید ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={cn(
                "rounded-full transition-all duration-300",
                index === activeIndex
                  ? "h-1.5 w-5 bg-cyan-400 sm:h-2.5 sm:w-7 sm:shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                  : "h-1.5 w-1.5 bg-surface0 hover:bg-surface0 sm:h-2.5 sm:w-2.5",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
