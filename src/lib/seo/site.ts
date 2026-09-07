export const SITE_NAME = "Shopghab | شاپ‌قاب";
export const BRAND_SHORT = "Shopghab";
export const SITE_TAGLINE =
  "Shopghab (شاپ‌قاب) — خرید قاب گوشی آماده و طراحی سفارشی با کیفیت چاپ بالا";
export const SITE_LOCALE = "fa_IR";
/** Default social preview — use a real 1200×630 asset at /og.jpg when available. */
export const DEFAULT_OG_IMAGE = "/images/ps5-repair.webp";
export const SITE_PHONE = "+989107701704";
export const SITE_PHONE_DISPLAY = "09107701704";
export const SITE_WHATSAPP = SITE_PHONE;
export const SITE_HOURS = "شنبه تا پنجشنبه — ۱۰ صبح تا ۹ شب";
export const SITE_ADDRESS = {
  streetAddress: "تهران، توپخانه، پاساژ لیلا، طبقه ۴، واحد ۲۱",
  addressLocality: "تهران",
  addressRegion: "تهران",
  addressCountry: "IR",
};

export function getSiteUrl(): string {
  const url = "https://shopghab.ir";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export function whatsAppUrl(message?: string): string {
  const base = `https://wa.me/${SITE_WHATSAPP.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
