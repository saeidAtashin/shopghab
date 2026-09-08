import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import JsonLd from "@/app/components/seo/JsonLd";
import ReadyCaseDetail from "@/app/components/cases/ReadyCaseDetail";
import { getBrandBySlug, getModelBySlug } from "@/lib/cases/brands.static";
import { getReadyCaseBySlug } from "@/lib/cases/ready.static";
import { readyCaseJsonLd } from "@/lib/seo/jsonld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getReadyCaseBySlug(slug);
  if (!product) return {};
  return createPageMetadata({
    title: product.title,
    description: product.description,
    path: `/cases/${slug}`,
  });
}

export default async function ReadyCasePage({ params }: Props) {
  const { slug } = await params;
  const product = getReadyCaseBySlug(slug);
  if (!product) notFound();

  const brand = getBrandBySlug(product.brandSlug);
  const model = getModelBySlug(product.brandSlug, product.modelSlug);

  return (
    <>
      <JsonLd
        data={readyCaseJsonLd({
          product,
          path: `/cases/${slug}`,
          brandName: brand?.name,
          modelName: model?.name,
        })}
      />
      <ReadyCaseDetail product={product} />
    </>
  );
}
