import { absoluteUrl } from "./site";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

const HOME: BreadcrumbItem = { label: "خانه", href: "/" };

/** Breadcrumb trail starting from home. Last segment is the current page (no href). */
export function breadcrumbTrail(
  ...segments: BreadcrumbItem[]
): BreadcrumbItem[] {
  return [HOME, ...segments];
}

export const crumbs = {
  designs: (): BreadcrumbItem => ({ label: "طراحی‌های آماده", href: "/designs" }),
  create: (): BreadcrumbItem => ({ label: "طراحی قاب", href: "/create" }),
  cases: (): BreadcrumbItem => ({ label: "قاب‌های آماده", href: "/cases" }),
  tracking: (): BreadcrumbItem => ({
    label: "پیگیری سفارش",
    href: "/tracking",
  }),
  cart: (): BreadcrumbItem => ({ label: "سبد خرید", href: "/cart" }),
  current: (label: string): BreadcrumbItem => ({ label }),
};

export function breadcrumbJsonLd(
  items: BreadcrumbItem[],
  currentPath: string,
) {
  const withUrls = items.map((item, index) => {
    const isLast = index === items.length - 1;
    const path = isLast ? currentPath : item.href;
    return {
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.label,
      ...(path ? { item: absoluteUrl(path) } : {}),
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: withUrls,
  };
}
