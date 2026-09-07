import Link from "next/link";
import { notFound } from "next/navigation";

import PageShell from "@/app/components/seo/PageShell";
import { webPageJsonLd } from "../../../../lib/seo/jsonld";
import { createPageMetadata } from "../../../../lib/seo/metadata";
import {
  buildRepairHref,
  consoleIdFromGameInstallSlug,
} from "../../../../lib/repair-links";
import { GAME_INSTALL_CONSOLE_META } from "@/lib/game-install-meta";
import { GAME_INSTALL_PRICE_DATA } from "@/lib/game-install-pricing";

type Props = {
  params: Promise<{ console: string }>;
};

export function generateStaticParams() {
  return Object.keys(GAME_INSTALL_CONSOLE_META).map((console) => ({
    console,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { console: consoleSlug } = await params;
  const meta = GAME_INSTALL_CONSOLE_META[consoleSlug];

  if (!meta) {
    return createPageMetadata({
      title: "صفحه یافت نشد",
      path: `/services/game-install/${consoleSlug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `تعرفه نصب بازی ${meta.label}`,
    description: `لیست کامل هزینه نصب بازی روی ${meta.label} شامل نصب اکانتی، پکیج اقتصادی، نصب آفلاین کپی خور و خدمات جانبی.`,
    path: `/services/game-install/${consoleSlug}`,
    keywords: [
      `تعرفه نصب بازی ${meta.label}`,
      `قیمت نصب بازی ${meta.label}`,
      `نصب بازی ${meta.label}`,
    ],
  });
}

export default async function GameInstallPage({ params }: Props) {
  const { console: consoleSlug } = await params;
  const meta = GAME_INSTALL_CONSOLE_META[consoleSlug];

  if (!meta) notFound();

  const path = `/services/game-install/${consoleSlug}`;
  const repairHref = buildRepairHref({
    consoleId: consoleIdFromGameInstallSlug(consoleSlug),
  });
  const pricingSections = [
    GAME_INSTALL_PRICE_DATA.accountCapacityInstallation,
    GAME_INSTALL_PRICE_DATA.economyPackagesRandomGames,
    GAME_INSTALL_PRICE_DATA.jailbreakOfflineInstallation,
    GAME_INSTALL_PRICE_DATA.xboxInstallation,
    GAME_INSTALL_PRICE_DATA.additionalServices,
  ];
  const jsonLdDescription = `تعرفه نصب بازی ${meta.label}: از نصب با اکانت ظرفیتی تا نصب آفلاین کپی خور و خدمات جانبی.`;

  const formatToman = (value: number) => {
    if (value === 0) return "رایگان";
    return `${value.toLocaleString("fa-IR")} تومان`;
  };

  return (
    <main className="min-h-screen bg-[#050816] pt-24 text-white">
      <PageShell
        currentPath={path}
        jsonLd={webPageJsonLd({
          name: `تعرفه نصب بازی ${meta.label}`,
          description: jsonLdDescription,
          path,
        })}
        containerClassName="relative z-10 mx-auto max-w-5xl px-6"
        className="relative z-10 mx-auto max-w-5xl px-6 pb-16"
      >
        <h1 className="mb-6 text-4xl font-black md:text-5xl">
          تعرفه نصب بازی {meta.label}
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-zinc-400">
          هزینه‌ها به نوع نصب، تعداد بازی و وضعیت کنسول بستگی دارد. بازه‌های زیر
          برای {meta.label} ارائه می‌شوند.
        </p>

        <section className="mb-10 grid gap-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-6 sm:grid-cols-2 xl:grid-cols-5">
          {GAME_INSTALL_PRICE_DATA.summaryTable.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="mb-2 text-sm text-zinc-300">{item.label}</p>
              <p className="font-extrabold text-cyan-300">{item.rangeText}</p>
            </div>
          ))}
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          {pricingSections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="mb-4 text-xl font-black">{section.title}</h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-zinc-200">{item.label}</span>
                    <span className="font-bold text-cyan-300">
                      {formatToman(item.priceRangeToman.min)} -{" "}
                      {formatToman(item.priceRangeToman.max)}
                    </span>
                  </div>
                ))}
              </div>
              {"notes" in section && section.notes ? (
                <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {section.notes}
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <Link
          href={repairHref}
          className="inline-flex rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
        >
          ثبت درخواست نصب بازی
        </Link>
      </PageShell>
    </main>
  );
}
