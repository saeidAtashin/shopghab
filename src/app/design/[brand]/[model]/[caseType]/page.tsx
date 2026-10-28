import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import EditorPageClient, {
  type EditorTab,
} from "@/app/components/case-editor/EditorPageClient";
import { editorDesignPicker } from "@/lib/catalog/logic";
import { readCatalog } from "@/lib/catalog/store";
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
    fork?: string;
  }>;
};

const VALID_TABS = new Set<EditorTab>([
  "layers",
  "text",
  "stickers",
  "upload",
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

  const requestedTab = query.tab === "templates" ? "stickers" : query.tab;
  const initialTab =
    requestedTab && VALID_TABS.has(requestedTab as EditorTab)
      ? (requestedTab as EditorTab)
      : undefined;

  const catalog = readCatalog();
  const forkDesign = query.fork ? catalog.designs.find((item) => item.id === query.fork) : undefined;
  const forkSrc = forkDesign?.imagePath ?? "";
  const forkArtwork =
    forkDesign && forkSrc.startsWith("/designed/") && !forkSrc.includes("..")
      ? {
          designId: forkDesign.id,
          src: forkSrc,
          width: forkDesign.width > 0 ? forkDesign.width : 1600,
          height: forkDesign.height > 0 ? forkDesign.height : 1600,
          name: forkDesign.title || "طرح",
        }
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
      forkArtwork={forkArtwork}
      designPicker={editorDesignPicker(catalog)}
    />
  );
}
