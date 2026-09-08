import { blogPosts } from "@/app/data/blog";
import { services } from "@/app/data/services";
import {
  consoleCatalog,
  consoleIds,
  getRepairService,
  type ConsoleId,
} from "./console-catalog";
import { SHOP_CONSOLE_META, SHOP_CONSOLE_ORDER, getProducts } from "./shop";

export type BranchNode = {
  title: string;
  href?: string;
  children?: BranchNode[];
};

const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const shopProductsByConsole = Object.fromEntries(
  SHOP_CONSOLE_ORDER.map((slug) => [
    slug,
    getProducts({ console: slug }).map((product) => ({
      title: product.title,
      href: `/shop/${slug}/${product.slug}`,
    })),
  ]),
);

function issuesBranch(
  consoleId: ConsoleId,
  repairSlug: string,
  limit = 5,
): BranchNode {
  const repair = serviceBySlug[repairSlug];
  const issues = repair?.commonIssues?.slice(0, limit) ?? [];

  return {
    title: "مشکلات رایج",
    href: `/consoles/${consoleId}/issues`,
    children: issues.map((issue) => ({
      title: issue.title,
      href: `/issues/${issue.slug}`,
    })),
  };
}

function consoleBranch(consoleId: ConsoleId): BranchNode {
  const config = consoleCatalog[consoleId];
  const repair = serviceBySlug[config.repairSlug];

  const gameInstallChildren: BranchNode[] = config.gameInstallSlugs.map(
    (g) => ({
      title: g.label,
      href: `/services/game-install/${g.slug}`,
    }),
  );

  const gameInstallNode: BranchNode =
    gameInstallChildren.length === 1
      ? gameInstallChildren[0]
      : {
          title: "نصب بازی",
          href: `/consoles/${consoleId}`,
          children: gameInstallChildren,
        };

  const shopConsoleLinks: BranchNode[] =
    consoleId === "xbox"
      ? [
          { title: "فروش Xbox Series", href: "/shop/xbox-series" },
          { title: "فروش Xbox One", href: "/shop/xbox-one" },
        ]
      : [{ title: `فروش ${config.title}`, href: `/shop/${consoleId}` }];

  return {
    title: config.title,
    href: `/consoles/${consoleId}`,
    children: [
      {
        title: repair?.title ?? `تعمیر ${config.title}`,
        href: `/services/${config.repairSlug}`,
      },
      gameInstallNode,
      {
        title: "فروش کنسول",
        href: consoleId === "xbox" ? "/shop/xbox-series" : `/shop/${consoleId}`,
        children: shopConsoleLinks,
      },
      {
        title: "فروش قطعات",
        href: `/shop/${consoleId}/parts`,
      },
      issuesBranch(consoleId, config.repairSlug),
    ],
  };
}

/** خانه → کنسول / خدمات / … → زیرخدمات (+ مشکلات رایج) */
export const siteBreadcrumbTree: BranchNode = {
  title: "خانه",
  href: "/",
  children: [
    ...consoleIds.map((id) => consoleBranch(id)),
    {
      title: "تعمیر دسته",
      href: "/services/controller-repair",
      children: [
        {
          title: "تعمیرات دسته بازی",
          href: "/services/controller-repair",
        },
        {
          title: "مشکلات رایج دسته",
          href: "/issues",
          children:
            serviceBySlug["controller-repair"]?.commonIssues
              ?.slice(0, 4)
              .map((issue) => ({
                title: issue.title,
                href: `/issues/${issue.slug}`,
              })) ?? [],
        },
      ],
    },
    {
      title: "همه خدمات",
      href: "/services",
    },
    {
      title: "فروشگاه",
      href: "/shop",
      children: SHOP_CONSOLE_ORDER.map((slug) => ({
        title: `خرید ${SHOP_CONSOLE_META[slug].label}`,
        href: `/shop/${slug}`,
        children: shopProductsByConsole[slug],
      })),
    },
    {
      title: "تعمیر HDMI",
      href: "/services/hdmi-repair",
    },
    {
      title: "مشکلات رایج",
      href: "/issues",
    },
    {
      title: "ثبت سفارش تعمیر",
      href: "/repair",
      children: consoleIds.map((id) => {
        const service = getRepairService(id);
        return {
          title: service?.title ?? `تعمیر ${consoleCatalog[id].title}`,
          href: `/repair?console=${id}`,
        };
      }),
    },
    {
      title: "پیگیری تعمیر",
      href: "/tracking",
    },
    {
      title: "بلاگ",
      href: "/blog",
      children: blogPosts.map((post) => ({
        title: post.title,
        href: `/blog/${post.slug}`,
      })),
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
