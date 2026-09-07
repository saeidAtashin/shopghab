import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import PageShell from "@/app/components/seo/PageShell";
import { services } from "@/app/data/services";
// import { GAME_INSTALL_CONSOLE_META } from "@/lib/game-install-meta";
import { collectionPageJsonLd, itemListJsonLd } from "../../lib/seo/jsonld";
import { createPageMetadata } from "../../lib/seo/metadata";

const PATH = "/services";
const TITLE = "خدمات تعمیر کنسول بازی";
const DESCRIPTION =
  "لیست خدمات تعمیر PS5، PS4، Xbox، HDMI و دسته بازی با ضمانت، زمان تقریبی و هزینه شفاف.";


export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["خدمات تعمیر کنسول", "تعمیر ps5", "تعمیر ps4", "تعمیر xbox"],
});

export default function ServicesIndexPage() {
  return (
    <main className="min-h-screen bg-black pt-24 text-white">
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
        <p className="mt-4 max-w-2xl text-lg text-zinc-400">
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
                className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 transition hover:-translate-y-1 hover:border-white/20"
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
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold">{service.title}</h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-zinc-400">
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
      </PageShell>
    </main>
  );
}
