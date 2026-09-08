import { isBrandLoaderSlug, type BrandLoaderSlug } from "./brand-route-loaders";

export const PREFERRED_BRAND_LOADER_STORAGE_KEY = "preferred-brand-loader";

const BRAND_ROUTE_PATTERN =
  /^\/(?:create|design|phones)\/(apple|samsung|xiaomi|huawei)(?:\/|$|\?)/;

export type PreferredBrandLoaderSlug = BrandLoaderSlug | null;

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function brandSlugFromPathname(pathname: string): PreferredBrandLoaderSlug {
  const match = pathname.match(BRAND_ROUTE_PATTERN);
  if (!match?.[1] || !isBrandLoaderSlug(match[1])) return null;
  return match[1];
}

export function brandSlugFromHref(href: string | null | undefined): PreferredBrandLoaderSlug {
  if (!href || href.startsWith("#")) return null;

  try {
    const url = new URL(href, typeof window !== "undefined" ? window.location.href : "http://localhost");
    return brandSlugFromPathname(url.pathname);
  } catch {
    if (href.startsWith("/")) {
      return brandSlugFromPathname(href.split("?")[0] ?? href);
    }
    return null;
  }
}

export function getPreferredBrandLoaderSlug(): PreferredBrandLoaderSlug {
  if (!hasLocalStorage()) return null;

  try {
    const raw = localStorage.getItem(PREFERRED_BRAND_LOADER_STORAGE_KEY);
    if (!raw || !isBrandLoaderSlug(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function setPreferredBrandLoaderSlug(slug: string): PreferredBrandLoaderSlug {
  if (!hasLocalStorage()) return null;

  if (!isBrandLoaderSlug(slug)) {
    localStorage.removeItem(PREFERRED_BRAND_LOADER_STORAGE_KEY);
    return null;
  }

  localStorage.setItem(PREFERRED_BRAND_LOADER_STORAGE_KEY, slug);
  return slug;
}
