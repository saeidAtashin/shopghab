import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import JsonLd from "@/app/components/seo/JsonLd";
import ReadyCaseDetail from "@/app/components/cases/ReadyCaseDetail";
import { getBrandBySlug, getModelBySlug } from "@/lib/cases/brands.static";
import { getReadyCaseBySlug } from "@/lib/cases/ready.static";
import { readyCaseJsonLd } from "@/lib/seo/jsonld";
import { SITE_BRAND } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getReadyCaseBySlug(slug);
  if (!product) return {};
  return createPageMetadata({
    title: `فروش قاب ${product.title}`,
    description: `فروش قاب موبایل «${product.title}» در ${SITE_BRAND}. ${product.description}`,
    path: `/cases/${slug}`,
    keywords: ["فروش قاب موبایل", SITE_BRAND, "shopghab", product.title],
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
          brandName: SITE_BRAND,
          modelName: model?.name ?? brand?.name,
        })}
      />
      <ReadyCaseDetail product={product} />
    </>
  );
}
