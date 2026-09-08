import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import FaqSection from "@/app/components/seo/FaqSection";
import OverviewSection from "@/app/components/seo/OverviewSection";
import PageShell from "@/app/components/seo/PageShell";
import TrustSignalsBar from "@/app/components/seo/TrustSignalsBar";
import { CtaButtonGroup } from "@/app/components/ui/cta";
import { services } from "@/app/data/services";
import {
  SERVICES_INDEX_DESCRIPTION,
  SERVICES_INDEX_FAQS,
  SERVICES_INDEX_OVERVIEW,
  SERVICES_INDEX_PROCESS_STEPS,
  SERVICES_INDEX_TRUST_SIGNALS,
} from "@/app/data/services-index-content";
import { GAME_INSTALL_CONSOLE_META } from "@/lib/game-install-meta";
import { getGameInstallImage } from "@/lib/quick-access-images";
import { collectionPageJsonLd, itemListJsonLd } from "../../lib/seo/jsonld";
import { createPageMetadata } from "../../lib/seo/metadata";

const PATH = "/services";
const TITLE = "خدمات تعمیر کنسول بازی";

export const metadata = createPageMetadata({
  title: TITLE,
  description: SERVICES_INDEX_DESCRIPTION,
  path: PATH,
  keywords: [
    "خدمات تعمیر کنسول",
    "تعمیر ps5",
    "تعمیر ps4",
    "تعمیر xbox",
    "نصب بازی ps5",
  ],
});

export default function ServicesIndexPage() {
  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <PageShell
        currentPath={PATH}
        jsonLd={[
          collectionPageJsonLd({
            name: TITLE,
            description: SERVICES_INDEX_DESCRIPTION,
            path: PATH,
          }),
          itemListJsonLd({
            name: TITLE,
            path: PATH,
            items: services.map((s) => ({
              name: s.title,
              url: `/services/${s.slug}`,
            })),
          }),
        ]}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-12"
      >
        <h1 className="text-4xl font-black md:text-5xl">خدمات تعمیر کنسول</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          تعمیر تخصصی انواع کنسول و قطعات با عیب‌یابی دقیق، قطعات باکیفیت و
          گارانتی خدمات.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group overflow-hidden rounded-3xl border border-border bg-card/60 transition hover:-translate-y-1 hover:border-border"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold">{service.title}</h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">
                    {service.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-cyan-400">
                    مشاهده جزئیات
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <OverviewSection
          title="راهنمای خدمات تعمیر کنسول"
          paragraphs={SERVICES_INDEX_OVERVIEW}
          className="border-t-0 py-16"
        />

        <section className="border-t border-border py-16" aria-labelledby="process-title">
          <div className="container mx-auto px-0">
            <h2 id="process-title" className="mb-8 text-3xl font-black">
              مراحل ثبت و تعمیر
            </h2>
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {SERVICES_INDEX_PROCESS_STEPS.map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-border bg-card/50 p-5"
                >
                  <span className="mb-2 block font-mono text-sm text-cyan-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="font-semibold leading-7">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-border py-16" aria-labelledby="game-install-title">
          <h2 id="game-install-title" className="mb-8 text-3xl font-black">
            نصب بازی
          </h2>
          <p className="mb-8 max-w-2xl text-muted">
            علاوه بر تعمیر، نصب بازی برای PS4، PS5 و Xbox با تعرفه شفاف انجام
            می‌شود.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(GAME_INSTALL_CONSOLE_META).map(([slug, meta]) => {
              const imageSrc = getGameInstallImage(slug);
              return (
              <Link
                key={slug}
                href={`/services/game-install/${slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card/50 transition hover:border-cyan-400/30"
              >
                {imageSrc ? (
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={meta.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                <h3 className="text-lg font-bold">{meta.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {meta.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-400">
                  مشاهده تعرفه
                  <ChevronLeft className="h-4 w-4" />
                </span>
                </div>
              </Link>
            );
            })}
          </div>
        </section>

        <TrustSignalsBar signals={SERVICES_INDEX_TRUST_SIGNALS} />

        <FaqSection items={SERVICES_INDEX_FAQS} />

        <section className="border-t border-border py-16">
          <div className="rounded-[32px] border border-cyan-400/20 bg-cyan-500/5 px-8 py-12 text-center">
            <h2 className="text-3xl font-black">آماده ثبت سفارش هستید؟</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              فرم تعمیر را تکمیل کنید یا وضعیت سفارش قبلی را پیگیری نمایید.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButtonGroup repairLabel="ثبت سفارش تعمیر" secondary="tracking" />
            </div>
          </div>
        </section>
      </PageShell>
    </main>
  );
}
