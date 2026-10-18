import AdminShell from "@/app/components/admin/AdminShell";
import CustomersPanel from "@/app/components/admin/CustomersPanel";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  return (
    <AdminShell
      title="کاربران"
      description="کاربرانی که آنلاین هستند یا سفارش فروشگاه ثبت کرده‌اند."
    >
      <CustomersPanel />
    </AdminShell>
  );
}
