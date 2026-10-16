import AdminShell from "@/app/components/admin/AdminShell";
import DesignEditorScreen from "@/app/components/admin/DesignEditorScreen";

export default function NewDesignPage() {
  return (
    <AdminShell title="طرح جدید" description="طرح جدید به‌صورت پیش‌نویس ذخیره می‌شود">
      <DesignEditorScreen />
    </AdminShell>
  );
}
