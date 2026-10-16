import AdminShell from "@/app/components/admin/AdminShell";
import CollectionAdminList from "@/app/components/admin/CollectionAdminList";

export default function CollectionsPage() {
  return (
    <AdminShell title="کالکشن‌ها" description="فهرست‌های منتخب، جدا از دسته‌بندی طرح‌ها.">
      <CollectionAdminList />
    </AdminShell>
  );
}
