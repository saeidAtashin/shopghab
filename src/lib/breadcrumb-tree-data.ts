import { cases } from "@/app/data/cases";

export type BranchNode = {
  title: string;
  href?: string;
  children?: BranchNode[];
};

/** خانه → قاب‌ها / سفارشی / صفحات اطلاعاتی */
export const siteBreadcrumbTree: BranchNode = {
  title: "خانه",
  href: "/",
  children: [
    {
      title: "قاب‌های آماده",
      href: "/cases",
      children: cases.map((item) => ({
        title: item.title,
        href: `/cases/${item.slug}`,
      })),
    },
    {
      title: "طراحی سفارشی",
      href: "/custom",
    },
    {
      title: "پیگیری سفارش",
      href: "/tracking",
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
