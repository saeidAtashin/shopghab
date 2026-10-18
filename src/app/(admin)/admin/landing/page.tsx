import AdminShell from "@/app/components/admin/AdminShell";
import LandingSectionsForm from "@/app/components/admin/LandingSectionsForm";
import { readCatalog } from "@/lib/catalog/store";
import { readLandingSections } from "@/lib/landing/store";
import { landingTaxonomy } from "@/lib/landing/taxonomy";

export const dynamic = "force-dynamic";

export default function AdminLandingPage() {
  const settings = readLandingSections();
  const items = landingTaxonomy(readCatalog());

  return (
    <AdminShell
      title="لندینگ"
      description="انتخاب بخش‌هایی که در صفحه اصلی دیده می‌شوند و استایل کارت هر بخش."
    >
      <LandingSectionsForm initial={settings} items={items} />
    </AdminShell>
  );
}
