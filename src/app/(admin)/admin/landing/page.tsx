import AdminShell from "@/app/components/admin/AdminShell";
import LandingSectionsForm from "@/app/components/admin/LandingSectionsForm";
import { readCatalog } from "@/lib/catalog/store";
import { readLandingSections } from "@/lib/landing/store";
import { landingBannerChoices, landingTaxonomy } from "@/lib/landing/taxonomy";

export const dynamic = "force-dynamic";

export default function AdminLandingPage() {
  const catalog = readCatalog();
  const settings = readLandingSections();
  const items = landingTaxonomy(catalog);

  return (
    <AdminShell
      title="لندینگ"
      description="انتخاب بخش‌ها، استایل کارت، و تصویر بنر هر کارت انتخاب‌شده."
    >
      <LandingSectionsForm initial={settings} items={items} choices={landingBannerChoices(catalog)} />
    </AdminShell>
  );
}
