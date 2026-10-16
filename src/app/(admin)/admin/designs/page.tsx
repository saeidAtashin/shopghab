import AdminShell from "@/app/components/admin/AdminShell";
import DesignAdminList from "@/app/components/admin/DesignAdminList";
import MockupStatusPanel from "@/app/components/admin/MockupStatusPanel";

export default function AdminDesignsPage() {
  return (
    <AdminShell title="طرح‌ها" description="جستجو، وضعیت انتشار و دسته‌بندی طرح‌های قاب">
      <MockupStatusPanel />
      <DesignAdminList />
    </AdminShell>
  );
}
