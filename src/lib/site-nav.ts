export type SiteNavLeaf = {
  title: string;
  href: string;
};

export type SiteNavItem = SiteNavLeaf & {
  children?: SiteNavLeaf[];
};

export const navbarNavItems: SiteNavItem[] = [
  { title: "خانه", href: "/" },
  { title: "قاب‌های آماده", href: "/cases" },
  { title: "طراحی سفارشی", href: "/custom" },
  { title: "پیگیری سفارش", href: "/tracking" },
  { title: "درباره ما", href: "/about-us" },
  { title: "تماس", href: "/contact" },
];

export const headerNavItems: SiteNavLeaf[] = [
  { title: "خانه", href: "/" },
  { title: "قاب‌های آماده", href: "/cases" },
  { title: "طراحی سفارشی", href: "/custom" },
  { title: "پیگیری سفارش", href: "/tracking" },
];

export const footerQuickLinks: SiteNavLeaf[] = [
  { title: "خانه", href: "/" },
  { title: "قاب‌های آماده", href: "/cases" },
  { title: "طراحی سفارشی", href: "/custom" },
  { title: "پیگیری سفارش", href: "/tracking" },
];

export const footerInfoLinks: SiteNavLeaf[] = [
  { title: "درباره ما", href: "/about-us" },
  { title: "تماس با ما", href: "/contact" },
  { title: "سوالات متداول", href: "/faq" },
  { title: "قوانین و شرایط", href: "/terms" },
  { title: "حریم خصوصی", href: "/privacy-policy" },
];
