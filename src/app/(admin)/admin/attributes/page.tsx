import AdminShell from "@/app/components/admin/AdminShell";
import AttributeAdmin from "@/app/components/admin/AttributeAdmin";

export default function AttributesPage() {
  return (
    <AdminShell title="ویژگی‌ها" description="گروه‌ها و مقدارهای ساخت‌یافته، جدا از دسته‌ها و برچسب‌ها.">
      <AttributeAdmin />
    </AdminShell>
  );
}
