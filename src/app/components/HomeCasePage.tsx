import Link from "next/link";
import { Palette, Truck, Shield, Smartphone } from "lucide-react";
import DesignSamplesSection from "@/app/components/designs/DesignSamplesSection";
import HomeHero from "@/app/components/home/hero/HomeHero";
import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { getHeroTemplates } from "@/app/components/home/hero/hero.constants";
import { getModelBySlug } from "@/lib/cases/brands.static";

const POPULAR_MODELS = [
  { brandSlug: "apple", modelSlug: "iphone-16-pro" },
  { brandSlug: "apple", modelSlug: "iphone-14-pro" },
  { brandSlug: "samsung", modelSlug: "galaxy-s25-ultra" },
  { brandSlug: "samsung", modelSlug: "galaxy-a55" },
  { brandSlug: "xiaomi", modelSlug: "redmi-note-14-pro" },
  { brandSlug: "huawei", modelSlug: "pura-70-pro" },
] as const;

function getPopularModels() {
  const models = [];
  for (const { brandSlug, modelSlug } of POPULAR_MODELS) {
    const model = getModelBySlug(brandSlug, modelSlug);
    if (model) models.push(model);
  }
  return models;
}

export default function HomeCasePage() {
  const heroTemplates = getHeroTemplates();
  const popularModels = getPopularModels();

  return (
    <main className="min-h-screen bg-background">
      <HomeHero />

      <section className="border-y border-border bg-background/50 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Palette, title: "طراحی زنده", desc: "متن و استیکر را لحظه‌ای ببین" },
            { icon: Truck, title: "ارسال سریع", desc: "چاپ با کیفیت و ارسال به سراسر ایران" },
            { icon: Shield, title: "گارانتی", desc: "۷ روز ضمانت بازگشت" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 rounded-xl p-4">
              <Icon size={20} className="mt-0.5 shrink-0 text-cyan-400" />
              <div>
                <p className="font-bold text-foreground">{title}</p>
                <p className="text-sm text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-foreground">
                <Smartphone size={24} className="text-cyan-400" />
                محبوب‌ترین مدل‌ها
              </h2>
              <p className="mt-1 text-sm text-muted">طراحی اختصاصی برای مدل گوشی تو</p>
            </div>
            <Link href="/create" className="text-sm text-cyan-400 hover:underline">
              همه برندها
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popularModels.map((model) => (
              <Link
                key={`${model.brandSlug}-${model.slug}`}
                href={`/phones/${model.brandSlug}/${model.slug}`}
                className="group rounded-2xl border border-border bg-card/60 p-4 transition hover:border-cyan-500/50 hover:bg-card"
              >
                <div className="relative mx-auto flex h-32 w-16 items-center justify-center">
                  <PhoneBackSvg
                    model={model}
                    className="h-full w-auto max-w-full drop-shadow-lg transition group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-bold text-foreground">{model.name}</p>
                  <p className="text-xs text-muted">{model.nameEn}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <DesignSamplesSection templates={heroTemplates.slice(0, 4)} limit={4} />
        </div>
      </section>
    </main>
  );
}
