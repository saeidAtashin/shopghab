import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import EditorPageClient, {
  type EditorTab,
} from "@/app/components/case-editor/EditorPageClient";
import {
  getBrandBySlug,
  getCaseTypeBySlug,
  getModelBySlug,
} from "@/lib/cases/brands.static";

type Props = {
  params: Promise<{ brand: string; model: string; caseType: string }>;
  searchParams: Promise<{
    design?: string;
    share?: string;
    template?: string;
    tab?: string;
  }>;
};

const VALID_TABS = new Set<EditorTab>([
  "layers",
  "text",
  "stickers",
  "upload",
  "templates",
  "design-for-you",
  "description",
]);

export async function generateMetadata({ params }: Props) {
  const { brand, model, caseType } = await params;
  const phoneModel = getModelBySlug(brand, model);
  const caseTypeInfo = getCaseTypeBySlug(caseType);

  return createPageMetadata({
    title: phoneModel
      ? `طراحی قاب ${phoneModel.name}${caseTypeInfo ? ` — ${caseTypeInfo.name}` : ""}`
      : "طراحی قاب",
    path: `/design/${brand}/${model}/${caseType}`,
    noIndex: true,
  });
}

export default async function DesignEditorPage({ params, searchParams }: Props) {
  const { brand, model, caseType } = await params;
  const query = await searchParams;

  if (
    !getBrandBySlug(brand) ||
    !getModelBySlug(brand, model) ||
    !getCaseTypeBySlug(caseType)
  ) {
    notFound();
  }

  const initialTab =
    query.tab && VALID_TABS.has(query.tab as EditorTab)
      ? (query.tab as EditorTab)
      : undefined;

  return (
    <EditorPageClient
      brandSlug={brand}
      modelSlug={model}
      caseTypeSlug={caseType}
      initialDesignId={query.design}
      initialShareToken={query.share}
      initialTemplateSlug={query.template}
      initialTab={initialTab}
    />
  );
}
