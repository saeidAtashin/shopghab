import AdminShell from "@/app/components/admin/AdminShell";
import CategoryEditorScreen from "@/app/components/admin/CategoryEditorScreen";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ parent?: string }>;
}) {
  const { parent } = await searchParams;
  return (
    <AdminShell title="دسته جدید">
      <CategoryEditorScreen parentId={parent} />
    </AdminShell>
  );
}
