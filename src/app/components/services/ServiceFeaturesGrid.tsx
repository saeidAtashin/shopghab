"use client";

import {
  BadgeCheck,
  Cpu,
  Gauge,
  Monitor,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import FadeUp from "@/app/components/animations/FadeUp";
import { cn } from "@/lib/utils";
import type { brandThemes } from "@/lib/brand-theme";

type BrandTheme = (typeof brandThemes)[keyof typeof brandThemes];

const FEATURE_ICONS: LucideIcon[] = [
  Cpu,
  ShieldCheck,
  Gauge,
  BadgeCheck,
  Wrench,
  Zap,
  Monitor,
  Sparkles,
];

const FEATURE_TAGS = [
  "CORE",
  "SECURE",
  "SPEED",
  "QA",
  "TOOLS",
  "POWER",
  "DISPLAY",
  "SYNC",
];

const FEATURE_DESCRIPTIONS = [
  "بررسی کامل سخت‌افزار با ابزار تشخیص پیشرفته.",
  "اجرا طبق پروتکل‌های استاندارد تعمیرگاه تخصصی.",
  "کنترل کیفیت چندمرحله‌ای پیش از تحویل دستگاه.",
  "قطعات و فرآیند تعمیر با ضمانت شفاف ارائه می‌شود.",
];

type ServiceFeatureCardProps = {
  feature: string;
  index: number;
  theme: BrandTheme;
};

function ServiceFeatureCard({
  feature,
  index,
  theme,
}: ServiceFeatureCardProps) {
  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
  const tag = FEATURE_TAGS[index % FEATURE_TAGS.length];
  const description = FEATURE_DESCRIPTIONS[index % FEATURE_DESCRIPTIONS.length];

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black/45 p-7 backdrop-blur-xl transition-all duration-500",
        "hover:-translate-y-1.5 hover:border-cyan-400/35 hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]",
        theme.border,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:18px_18px]"
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100",
          theme.bg,
        )}
      />

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute start-3 top-3 h-5 w-5 border-s-2 border-t-2 transition-colors duration-300",
          theme.border,
          "group-hover:border-cyan-400/70",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-3 end-3 h-5 w-5 border-b-2 border-e-2 transition-colors duration-300",
          theme.border,
          "group-hover:border-cyan-400/70",
        )}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute end-4 top-3 font-mono text-4xl font-black leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-cyan-400/15"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-scan-soft"
      />

      <div className="relative z-10">
        <div className="relative mb-6 inline-flex">
          <div
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-xl border bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-500 group-hover:scale-110",
              theme.border,
              theme.bg,
            )}
          >
            <Icon className={cn("h-6 w-6", theme.primary)} strokeWidth={2.1} />
          </div>
          <span
            aria-hidden
            className={cn(
              "absolute -inset-1.5 rounded-[14px] border border-dashed opacity-30 transition-all duration-700 group-hover:opacity-60 group-hover:animate-[spin_10s_linear_infinite]",
              theme.border,
            )}
          />
        </div>

        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-500/45">
          {tag}_{String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-cyan-300">
          {feature}
        </h3>

        <p className="mt-3 text-sm leading-7 text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
          {description}
        </p>

        <div className="mt-5 flex items-center gap-2">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/70">
            Online
          </span>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-700 group-hover:w-full"
      />
    </div>
  );
}

type ServiceFeaturesGridProps = {
  features: string[];
  theme: BrandTheme;
};

export default function ServiceFeaturesGrid({
  features,
  theme,
}: ServiceFeaturesGridProps) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-10 opacity-20 [background-image:linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] [background-size:36px_36px]"
      />

      <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <FadeUp key={`${feature}-${index}`} delay={index * 0.08}>
            <ServiceFeatureCard feature={feature} index={index} theme={theme} />
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
