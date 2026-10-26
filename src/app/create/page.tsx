import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";
import BrandGrid from "@/app/components/case-wizard/BrandGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import SuggestedPhoneCard from "@/app/components/case-wizard/SuggestedPhoneCard";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import { PHONE_BRANDS } from "@/lib/cases/brands.static";

export const metadata = createPageMetadata({
  title: "فروش قاب موبایل — انتخاب برند",
  description: `برند گوشی را در ${SITE_BRAND} (shopghab) انتخاب کنید و سفارش فروش قاب موبایل یا طراحی اختصاصی را شروع کنید.`,
  path: "/create",
  keywords: ["فروش قاب موبایل", SITE_BRAND, "shopghab", "قاب آیفون", "قاب سامسونگ"],
});

export default function CreatePage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 pb-16 px-4 text-foreground outline-none sm:px-6">
      <div className="mx-auto max-w-[90rem]">
        <WizardBreadcrumb crumbs={[{ label: "برند" }]} />
        <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">برند گوشی خود را انتخاب کنید</h1>
        <p className="mt-2 text-muted">مرحله ۱ از ۲ — برند</p>
        <SuggestedPhoneCard className="mt-6" />

        <div className="mt-10">
          <ModelSearch placeholder="مثلاً گلکسی S24، آیفون 15 Pro، ردمی نوت 13…" />
        </div>
        <div className="mt-8">
          <BrandGrid brands={PHONE_BRANDS} />
        </div>
      </div>
    </main>
  );
}
