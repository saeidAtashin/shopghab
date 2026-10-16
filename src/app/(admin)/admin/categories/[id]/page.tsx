import AdminShell from "@/app/components/admin/AdminShell";
import CategoryEditorScreen from "@/app/components/admin/CategoryEditorScreen";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title="ویرایش دسته">
      <CategoryEditorScreen id={id} />
    </AdminShell>
  );
}
