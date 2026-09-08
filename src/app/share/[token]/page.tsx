import { notFound } from "next/navigation";
import SharePageClient from "./SharePageClient";
import { getDesignByShareToken } from "@/lib/design/api";
import { createPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const design = await getDesignByShareToken(token);
  return createPageMetadata({
    title: design?.name ?? "طراحی قاب",
    description: design?.description ?? "مشاهده طراحی قاب موبایل",
    path: `/share/${token}`,
    noIndex: true,
  });
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const design = await getDesignByShareToken(token);
  if (!design) notFound();

  return <SharePageClient design={design} />;
}
