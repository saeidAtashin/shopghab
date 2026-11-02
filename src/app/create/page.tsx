import { createPageMetadata } from "@/lib/seo/metadata";
import { SITE_BRAND } from "@/lib/seo/site";
import BrandGrid from "@/app/components/case-wizard/BrandGrid";
import ModelSearch from "@/app/components/case-wizard/ModelSearch";
import SuggestedPhoneCard from "@/app/components/case-wizard/SuggestedPhoneCard";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import { PHONE_BRANDS } from "@/lib/cases/brands.static";

export const metadata = createPageMetadata({
  title: "خرید قاب اختصاصی",
  description: `خرید قاب اختصاصی و قاب تلفن همراه در ${SITE_BRAND}. برند گوشی را انتخاب کنید و قاب موبایل یا قاب گوشی را با طرح خودتان سفارش دهید.`,
  path: "/create",
  keywords: ["خرید قاب اختصاصی", "خرید قاب موبایل", "قاب گوشی", "قاب تلفن همراه", SITE_BRAND, "shopghab"],
});

export default function CreatePage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background pt-24 pb-16 px-4 text-foreground outline-none sm:px-6">
      <div className="mx-auto max-w-[90rem]">
        <WizardBreadcrumb crumbs={[{ label: "برند" }]} />
        <h1 className="mt-6 text-2xl font-black text-foreground sm:text-3xl">خرید قاب اختصاصی</h1>
        <p className="mt-2 text-muted">
          برند گوشی را انتخاب کنید — قاب موبایل، قاب گوشی یا قاب تلفن همراه با طرح خودتان.
        </p>
        <p className="mt-1 text-sm text-muted">مرحله ۱ از ۲ — برند</p>
        <SuggestedPhoneCard className="mt-6" />

        <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0 xl:top-[4.5rem]">
          <ModelSearch placeholder="مثلاً گلکسی S24، آیفون 15 Pro، ردمی نوت 13…" />
        </div>
        <div className="mt-6">
          <BrandGrid brands={PHONE_BRANDS} />
        </div>
      </div>
    </main>
  );
}
