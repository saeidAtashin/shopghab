export const SITE_BRAND = "شاپ قاب";
export const SITE_NAME = "شاپ قاب";
export const SITE_ALTERNATE_NAMES = ["shopghab", "شاپ‌قاب", "Shopghab"] as const;
export const SITE_TAGLINE =
  "فروش قاب موبایل و طراحی قاب اختصاصی — انتخاب برند و مدل، چاپ با کیفیت و ارسال سریع در شاپ قاب";
export const SITE_LOCALE = "fa_IR";
export const SITE_THEME_COLOR = "#06b6d4";
export const DEFAULT_OG_IMAGE = "/images/banner-shopghab-org.webp";
export const SITE_PHONE = "+989107701704";
export const SITE_PHONE_DISPLAY = "۰۹۱۰۷۷۰۱۷۰۴";
export const SITE_ADDRESS = {
  streetAddress: "توپخانه، پاساژ لیلا، طبقه ۴، واحد ۲۱",
  addressLocality: "تهران",
  addressRegion: "تهران",
  addressCountry: "IR",
};
export const SITE_ADDRESS_DISPLAY =
  "تهران، توپخانه، پاساژ لیلا، طبقه ۴، واحد ۲۱";

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://shopghab.ir";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
