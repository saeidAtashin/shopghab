import { services } from "@/app/data/services";
import {
  consoleCatalog,
  consoleIds,
  getRepairService,
  type ConsoleId,
} from "./console-catalog";

export type BranchNode = {
  title: string;
  href?: string;
  children?: BranchNode[];
};

const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

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
        href: `/shop/${consoleId}`,
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
