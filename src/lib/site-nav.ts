import { PHONE_BRANDS } from "./cases/brands.static";
import { brandSeriesHref, getSeriesForBrand } from "./cases/series";

export type SiteNavLeaf = {
  title: string;
  href: string;
};

export type SiteNavBranch = SiteNavLeaf & {
  children?: SiteNavLeaf[];
};

export type SiteNavItem = SiteNavLeaf & {
  children?: SiteNavBranch[];
};

const BRANDS_WITH_SERIES = new Set(["apple", "samsung", "xiaomi", "huawei"]);

function buildCaseDesignNavChildren(): SiteNavBranch[] {
  return PHONE_BRANDS.map((brand) => {
    if (!BRANDS_WITH_SERIES.has(brand.slug)) {
      return {
        title: brand.name,
        href: `/create/${brand.slug}`,
      };
    }

    return {
      title: brand.name,
      href: `/create/${brand.slug}`,
      children: getSeriesForBrand(brand.slug).map((series) => ({
        title: series.name,
        href: brandSeriesHref(brand.slug, series.slug),
      })),
    };
  });
}

export const navbarNavItems: SiteNavItem[] = [
  { title: "خانه", href: "/" },
  {
    title: "طراحی‌های آماده",
    href: "/designs",
  },
  {
    title: "طراحی قاب",
    href: "/create",
    children: buildCaseDesignNavChildren(),
  },
  { title: "سبد خرید", href: "/cart" },
  { title: "پیگیری سفارش", href: "/tracking" },
];

export const headerNavItems: SiteNavLeaf[] = [
  { title: "خانه", href: "/" },
  { title: "طراحی‌های آماده", href: "/designs" },
  { title: "طراحی قاب", href: "/create" },
  { title: "پیگیری سفارش", href: "/tracking" },
];

export const footerQuickLinks: SiteNavLeaf[] = [
  { title: "خانه", href: "/" },
  { title: "طراحی‌های آماده", href: "/designs" },
  { title: "طراحی قاب", href: "/create" },
  { title: "سبد خرید", href: "/cart" },
];

export const footerInfoLinks: SiteNavLeaf[] = [
  { title: "درباره ما", href: "/about-us" },
  { title: "تماس با ما", href: "/contact" },
  { title: "سوالات متداول", href: "/faq" },
  { title: "قوانین و شرایط", href: "/terms" },
  { title: "حریم خصوصی", href: "/privacy-policy" },
];
