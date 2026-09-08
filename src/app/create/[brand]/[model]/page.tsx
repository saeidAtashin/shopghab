import { redirect } from "next/navigation";
import { getBrandBySlug, getModelBySlug } from "@/lib/cases/brands.static";
import { buildModelCanonicalPath } from "@/lib/seo/case-model-seo";

type Props = { params: Promise<{ brand: string; model: string }> };

export default async function CaseTypeRedirectPage({ params }: Props) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  const model = getModelBySlug(brandSlug, modelSlug);
  if (!brand || !model) {
    redirect("/create");
  }

  redirect(buildModelCanonicalPath(brandSlug, modelSlug));
}
