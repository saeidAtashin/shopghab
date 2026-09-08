import { PHONE_MODELS } from "@/lib/cases/brands.static";
import { getFeaturedTemplates } from "@/lib/cases/templates.static";
import type { CaseTemplate } from "@/lib/design/types";

export const HERO_BADGE = "ارسال رایگان به سراسر ایران";

export const HERO_HEADING = "قاب موبایل اختصاصی خودت را طراحی کن";

export const HERO_DESCRIPTION =
  "برند و مدل گوشی‌ات را انتخاب کن، متن و استیکر اضافه کن و قاب اختصاصی بساز — یا از بین صدها طراحی آماده انتخاب کن.";

export const HERO_CTAS = {
  primary: { label: "شروع طراحی", href: "/create" },
  secondary: { label: "مشاهده طراحی‌ها", href: "/designs" },
} as const;

export const HERO_RATING = {
  score: 4.9,
  label: "امتیاز ۴٫۹ از مشتریان",
} as const;

export type HeroTrustIcon = "Palette" | "Sparkles" | "Truck" | "Smartphone";

export type HeroTrustBadge = {
  icon: HeroTrustIcon;
  label: string;
};

export const HERO_TRUST_BADGES: HeroTrustBadge[] = [
  { icon: "Palette", label: "۵۰۰+ طراحی" },
  { icon: "Sparkles", label: "چاپ UV پریمیوم" },
  { icon: "Truck", label: "ارسال رایگان" },
  { icon: "Smartphone", label: `${PHONE_MODELS.length}+ مدل گوشی` },
];

export const HERO_PHONE = {
  brandSlug: "apple",
  modelSlug: "iphone-16-pro",
} as const;

export const HERO_TEMPLATE_COUNT = 6;

export function getHeroTemplates(): CaseTemplate[] {
  return getFeaturedTemplates(HERO_TEMPLATE_COUNT);
}

export const HERO_FLOATING_POSITIONS = [
  { top: "8%", right: "4%", delay: 0, duration: 5.5, hideOnMobile: false },
  { top: "18%", left: "2%", delay: 0.8, duration: 6.2, hideOnMobile: true },
  { bottom: "22%", right: "0%", delay: 1.4, duration: 5.8, hideOnMobile: false },
  { bottom: "12%", left: "6%", delay: 0.4, duration: 6.8, hideOnMobile: true },
  { top: "42%", right: "-2%", delay: 1.8, duration: 7.2, hideOnMobile: true },
] as const;

export const HERO_ARTWORK_INTERVAL_MS = 4000;
