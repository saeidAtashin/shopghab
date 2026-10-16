import AdminShell from "@/app/components/admin/AdminShell";
import CategoryAdminList from "@/app/components/admin/CategoryAdminList";

export default function AdminCategoriesPage() {
  return (
    <AdminShell title="دسته‌ها" description="دسته‌های قابل ایندکس کاتالوگ طرح‌ها">
      <CategoryAdminList />
    </AdminShell>
  );
}
