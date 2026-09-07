import { notFound } from "next/navigation";

import HubLinkGrid from "@/app/components/HubLinkGrid";
import PageShell from "@/app/components/seo/PageShell";
import {
  consoleIds,
  getConsole,
  getRepairService,
} from "../../../lib/console-catalog";
import { webPageJsonLd } from "../../../lib/seo/jsonld";
import { createPageMetadata } from "../../../lib/seo/metadata";

type Props = {
  params: Promise<{ console: string }>;
};

export function generateStaticParams() {
  return consoleIds.map((console) => ({ console }));
}

export async function generateMetadata({ params }: Props) {
  const { console: consoleSlug } = await params;
  const config = getConsole(consoleSlug);

  if (!config) {
    return createPageMetadata({
      title: "کنسول یافت نشد",
      path: `/consoles/${consoleSlug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `خدمات ${config.title}`,
    description: config.description,
    path: `/consoles/${consoleSlug}`,
    keywords: [`تعمیر ${config.title}`, `خدمات ${config.title}`],
  });
}

export default async function ConsoleHubPage({ params }: Props) {
  const { console: consoleSlug } = await params;
  const config = getConsole(consoleSlug);

  if (!config) notFound();

  const repair = getRepairService(config.id);
  const path = `/consoles/${config.id}`;

  const links = [
    {
      title: repair?.title ?? `تعمیر ${config.title}`,
      description: repair?.description,
      href: `/services/${config.repairSlug}`,
    },
    ...config.gameInstallSlugs.map((g) => ({
      title: g.label,
      href: `/services/game-install/${g.slug}`,
    })),
    {
      title: `فروش ${config.title}`,
      description: "خرید کنسول دست‌دوم تست‌شده با ضمانت.",
      href: `/shop/${config.id}`,
    },
    {
      title: "فروش قطعات",
      description: "قطعات اورجینال و سازگار با این کنسول.",
      href: `/shop/${config.id}/parts`,
    },
    {
      title: "مشکلات رایج",
      description: "راهنمای عیب‌یابی و ثبت تعمیر برای مشکلات متداول.",
      href: `/consoles/${config.id}/issues`,
    },
  ];

  return (
    <main className="min-h-screen bg-black pt-24 text-white">
      <PageShell
        currentPath={path}
        jsonLd={webPageJsonLd({
          name: `خدمات ${config.title}`,
          description: config.description,
          path,
        })}
        containerClassName="container mx-auto max-w-5xl px-6"
      >
        <HubLinkGrid
          heading={`خدمات ${config.title}`}
          description={config.description}
          links={links}
        />
      </PageShell>
    </main>
  );
}
