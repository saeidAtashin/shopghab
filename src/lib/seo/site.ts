export const SITE_NAME = "شاپ‌قاب | Shopghab";
export const SITE_TAGLINE =
  "طراحی و خرید قاب موبایل اختصاصی — انتخاب برند و مدل، چاپ با کیفیت و ارسال سریع";
export const SITE_LOCALE = "fa_IR";
export const DEFAULT_OG_IMAGE = "/images/banner-shopghab-org.webp";
export const SITE_PHONE = "+989107701704";
export const SITE_ADDRESS = {
  streetAddress: "تهران",
  addressLocality: "تهران",
  addressRegion: "تهران",
  addressCountry: "IR",
};

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://shopghab.ir";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
