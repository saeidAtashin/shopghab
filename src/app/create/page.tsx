import { createPageMetadata } from "@/lib/seo/metadata";
import BrandGrid from "@/app/components/case-wizard/BrandGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import DesignSamplesSection from "@/app/components/designs/DesignSamplesSection";
import { PHONE_BRANDS } from "@/lib/cases/brands.static";
import { getFeaturedTemplates } from "@/lib/cases/templates.static";

export const metadata = createPageMetadata({
  title: "انتخاب برند گوشی",
  description: "برند گوشی خود را انتخاب کنید و طراحی قاب را شروع کنید.",
  path: "/create",
});

export default function CreatePage() {
  const featuredTemplates = getFeaturedTemplates(4);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <WizardBreadcrumb crumbs={[{ label: "برند" }]} />
        <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">برند گوشی خود را انتخاب کنید</h1>
        <p className="mt-2 text-muted">مرحله ۱ از ۳ — برند</p>

        <section className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <DesignSamplesSection
            templates={featuredTemplates}
            limit={4}
            title="یا از یک طراحی آماده شروع کنید"
            description="مدل گوشی را بعداً انتخاب می‌کنید — طراحی تمام‌صفحه روی قاب اعمال می‌شود"
          />
        </section>

        <div className="mt-6">
          <ModelSearch placeholder="مثلاً گلکسی S24، آیفون 15 Pro، ردمی نوت 13…" />
        </div>
        <div className="mt-8">
          <BrandGrid brands={PHONE_BRANDS} />
        </div>
      </div>
    </div>
  );
}
