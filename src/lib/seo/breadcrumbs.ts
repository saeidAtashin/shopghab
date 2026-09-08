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
  services: (): BreadcrumbItem => ({ label: "خدمات", href: "/services" }),
  issues: (): BreadcrumbItem => ({ label: "مشکلات رایج", href: "/issues" }),
  repair: (): BreadcrumbItem => ({ label: "ثبت سفارش تعمیر" }),
  tracking: (): BreadcrumbItem => ({ label: "پیگیری تعمیر" }),
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
