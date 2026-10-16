import AdminShell from "@/app/components/admin/AdminShell";
import DesignEditorScreen from "@/app/components/admin/DesignEditorScreen";

type Props = { params: Promise<{ id: string }> };

export default async function EditDesignPage({ params }: Props) {
  const { id } = await params;
  return (
    <AdminShell title="ویرایش طرح">
      <DesignEditorScreen id={id} />
    </AdminShell>
  );
}
