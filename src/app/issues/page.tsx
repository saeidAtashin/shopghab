import Link from "next/link";
import { ChevronLeft, Wrench } from "lucide-react";

import PageShell from "@/app/components/seo/PageShell";
import { issues } from "@/app/data/issues";
import { collectionPageJsonLd, itemListJsonLd } from "../../lib/seo/jsonld";
import { createPageMetadata } from "../../lib/seo/metadata";

const PATH = "/issues";
const TITLE = "راهنمای مشکلات رایج کنسول بازی";
const DESCRIPTION =
  "علائم، دلایل و راه‌حل مشکلات رایج PS5 و سایر کنسول‌ها. راهنمای فنی قبل از ثبت سفارش تعمیر.";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["مشکلات ps5", "تعمیر hdmi", "روشن نشدن ps5", "داغ شدن ps5"],
});

export default function IssuesIndexPage() {
  return (
    <main className="min-h-screen bg-zinc-950 pt-24 text-white">
      <PageShell
        currentPath={PATH}
        jsonLd={[
          collectionPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: PATH,
          }),
          itemListJsonLd({
            name: TITLE,
            path: PATH,
            items: issues.map((i) => ({
              name: i.title,
              url: `/issues/${i.slug}`,
            })),
          }),
        ]}
        containerClassName="container mx-auto max-w-5xl px-6"
        className="container mx-auto max-w-5xl px-6 pb-12"
      >
        <div className="mb-10 flex items-center gap-3 text-cyan-400">
          <Wrench className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-wide">
            راهنمای فنی
          </span>
        </div>

        <h1 className="text-4xl font-black md:text-5xl">
          مشکلات رایج کنسول بازی
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          علائم، علت احتمالی و راه‌حل تخصصی هر مشکل را بخوانید.
        </p>

        <ul className="mt-14 space-y-4">
          {issues.map((issue) => (
            <li key={issue.slug}>
              <Link
                href={`/issues/${issue.slug}`}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-cyan-500/50"
              >
                <h2 className="text-xl font-bold">{issue.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                  {issue.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-400">
                  مطالعه راهنما
                  <ChevronLeft className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageShell>
    </main>
  );
}
