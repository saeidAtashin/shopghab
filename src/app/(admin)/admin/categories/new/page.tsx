import AdminShell from "@/app/components/admin/AdminShell";
import CategoryEditorScreen from "@/app/components/admin/CategoryEditorScreen";

export default function NewCategoryPage() {
  return (
    <AdminShell title="دسته جدید">
      <CategoryEditorScreen />
    </AdminShell>
  );
}
