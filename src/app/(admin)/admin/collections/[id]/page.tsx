import AdminShell from "@/app/components/admin/AdminShell";
import CollectionEditorScreen from "@/app/components/admin/CollectionEditorScreen";

type Props = { params: Promise<{ id: string }> };

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title="ویرایش کالکشن">
      <CollectionEditorScreen id={id} />
    </AdminShell>
  );
}
