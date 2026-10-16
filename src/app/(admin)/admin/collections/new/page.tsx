import AdminShell from "@/app/components/admin/AdminShell";
import CollectionEditorScreen from "@/app/components/admin/CollectionEditorScreen";

export default function NewCollectionPage() {
  return (
    <AdminShell title="کالکشن جدید">
      <CollectionEditorScreen />
    </AdminShell>
  );
}
