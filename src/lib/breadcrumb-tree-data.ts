import { PHONE_BRANDS } from "@/lib/cases/brands.static";
import { brandSeriesHref, getSeriesForBrand } from "@/lib/cases/series";

export type BranchNode = {
  title: string;
  href?: string;
  children?: BranchNode[];
};

const BRANDS_WITH_SERIES = new Set(["apple", "samsung", "xiaomi", "huawei"]);

function caseDesignBranches(): BranchNode[] {
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

/** خانه → طراحی قاب / طرح‌های آماده / سفارش */
export const siteBreadcrumbTree: BranchNode = {
  title: "خانه",
  href: "/",
  children: [
    {
      title: "طراحی‌های آماده",
      href: "/designs",
    },
    {
      title: "طراحی قاب",
      href: "/create",
      children: caseDesignBranches(),
    },
    {
      title: "قاب‌های آماده",
      href: "/cases",
    },
    {
      title: "پیگیری سفارش",
      href: "/tracking",
    },
    {
      title: "سبد خرید",
      href: "/cart",
    },
    {
      title: "درباره ما",
      href: "/about-us",
    },
    {
      title: "تماس با ما",
      href: "/contact",
    },
    {
      title: "سوالات متداول",
      href: "/faq",
    },
    {
      title: "قوانین و شرایط",
      href: "/terms",
    },
    {
      title: "حریم خصوصی",
      href: "/privacy-policy",
    },
  ],
};
