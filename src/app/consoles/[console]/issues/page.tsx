import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import PageShell from "@/app/components/seo/PageShell";
import { services } from "@/app/data/services";
import { consoleIds, getConsole } from "../../../../lib/console-catalog";
import { webPageJsonLd } from "../../../../lib/seo/jsonld";
import { createPageMetadata } from "../../../../lib/seo/metadata";

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
      title: "صفحه یافت نشد",
      path: `/consoles/${consoleSlug}/issues`,
      noIndex: true,
    });
  }

  const path = `/consoles/${config.id}/issues`;

  return createPageMetadata({
    title: `مشکلات رایج ${config.title}`,
    description: `لیست مشکلات متداول ${config.title} و راهنمای تعمیر.`,
    path,
  });
}

export default async function ConsoleIssuesPage({ params }: Props) {
  const { console: consoleSlug } = await params;
  const config = getConsole(consoleSlug);

  if (!config) notFound();

  const repair = services.find((s) => s.slug === config.repairSlug);
  const issues = repair?.commonIssues ?? [];
  const path = `/consoles/${config.id}/issues`;

  return (
    <main className="min-h-screen bg-zinc-950 pt-24 text-white">
      <PageShell
        currentPath={path}
        jsonLd={webPageJsonLd({
          name: `مشکلات رایج ${config.title}`,
          description: `مشکلات متداول ${config.title}`,
          path,
        })}
        containerClassName="container mx-auto max-w-5xl px-6"
      >
        <h1 className="mb-4 text-3xl font-black">مشکلات رایج {config.title}</h1>
        <p className="mb-10 max-w-2xl text-lg text-zinc-400">
          رایج‌ترین خرابی‌های {config.title} و لینک راهنمای تعمیر هر مورد.
        </p>

        <ul className="space-y-3">
          {issues.map((issue) => (
            <li key={issue.slug}>
              <Link
                href={`/issues/${issue.slug}`}
                className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 transition hover:border-cyan-500/30"
              >
                <span className="font-medium group-hover:text-cyan-200">
                  {issue.title}
                </span>
                <ChevronLeft
                  size={18}
                  className="text-zinc-500 group-hover:text-cyan-400"
                />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={`/services/${config.repairSlug}`}
          className="mt-10 inline-flex rounded-2xl bg-cyan-500 px-8 py-4 font-bold text-black transition hover:bg-cyan-400"
        >
          ثبت درخواست تعمیر {config.title}
        </Link>
      </PageShell>
    </main>
  );
}
