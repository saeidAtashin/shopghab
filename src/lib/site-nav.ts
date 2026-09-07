import {
  consoleCatalog,
  consoleIds,
  getRepairService,
  type ConsoleId,
} from "./console-catalog";
import { siteBreadcrumbTree } from "./breadcrumb-tree-data";

export type SiteNavLeaf = {
  title: string;
  href: string;
};

export type SiteNavItem = SiteNavLeaf & {
  children?: SiteNavLeaf[];
};

function treeChild(href: string) {
  return siteBreadcrumbTree.children?.find((node) => node.href === href);
}

function trackingItem(): SiteNavLeaf {
  const tracking = treeChild("/tracking");
  return {
    title: tracking?.title ?? "پیگیری",
    href: "/tracking",
  };
}

function issueLabel(consoleId: ConsoleId) {
  return (
    getRepairService(consoleId)?.title ??
    `تعمیر ${consoleCatalog[consoleId].title}`
  );
}

function repairChildren(): SiteNavLeaf[] {
  return consoleIds.map((id) => ({
    title: issueLabel(id),
    href: `/services/${consoleCatalog[id].repairSlug}`,
  }));
}

function gameChildren(): SiteNavLeaf[] {
  return consoleIds.flatMap((id) =>
    consoleCatalog[id].gameInstallSlugs.map((game) => ({
      title: game.label,
      href: `/services/game-install/${game.slug}`,
    })),
  );
}

function shopChildren(): SiteNavLeaf[] {
  return consoleIds.map((id) => ({
    title: `خرید ${consoleCatalog[id].title}`,
    // href: `/shop/${id}`,
    href: "/coming-soon",
  }));
}

export const navbarNavItems: SiteNavItem[] = [
  { title: "خانه", href: "/" },
  {
    title: "تعمیرات",
    href: "/services",
    children: repairChildren(),
  },
  {
    title: "بازی",
    href: "/services/game-install",
    children: gameChildren(),
  },
  {
    title: "فروشگاه",
    href: "/shop",
    children: shopChildren(),
  },
  { title: "بلاگ", href: "/blog/controller-repair" },
  trackingItem(),
  { title: "تماس", href: "/contact" },
];

export const headerNavItems: SiteNavLeaf[] = [
  { title: "خانه", href: "/" },
  { title: "همه خدمات", href: "/services" },
  { title: "ثبت سفارش تعمیر", href: "/repair" },
  { title: "مشکلات رایج", href: "/issues" },
  trackingItem(),
];

export const footerQuickLinks: SiteNavLeaf[] = [
  { title: "خانه", href: "/" },
  { title: "همه خدمات", href: "/services" },
  { title: "ثبت سفارش تعمیر", href: "/repair" },
  trackingItem(),
];

export const footerInfoLinks: SiteNavLeaf[] = [
  { title: "درباره ما", href: "/about-us" },
  { title: "تماس با ما", href: "/contact" },
  { title: "سوالات متداول", href: "/faq" },
  { title: "قوانین و شرایط", href: "/terms" },
  { title: "حریم خصوصی", href: "/privacy-policy" },
];
