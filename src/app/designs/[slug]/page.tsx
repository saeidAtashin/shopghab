import { notFound, permanentRedirect } from "next/navigation";

import CatalogBreadcrumbs from "@/app/components/designs/CatalogBreadcrumbs";
import DesignDetailClient from "@/app/components/designs/DesignDetailClient";
import JsonLd from "@/app/components/seo/JsonLd";
import { getCaseTemplateBySlug } from "@/lib/cases/templates.static";
import {
  designHasImage,
  designOgImage,
  designSeoDescription,
  designSeoTitle,
  findPublishedDesign,
  findRedirectTarget,
  primaryCategory,
  relatedDesigns,
} from "@/lib/catalog/logic";
import { selectProductImages } from "@/lib/mockups/display";
import { readCatalog } from "@/lib/catalog/store";
import { breadcrumbJsonLd, breadcrumbTrail } from "@/lib/seo/breadcrumbs";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const catalog = readCatalog();
  const design = findPublishedDesign(catalog, slug) ?? findRedirectTarget(catalog, slug);
  if (!design) return {};

  return createPageMetadata({
    title: designSeoTitle(design),
    description: designSeoDescription(design),
    path: `/designs/${design.slug}`,
    ogImage: designOgImage(design),
    noIndex: !designHasImage(design),
  });
}

export default async function DesignDetailPage({ params }: Props) {
  const { slug } = await params;
  const catalog = readCatalog();
  const direct = findPublishedDesign(catalog, slug);
  if (!direct) {
    const target = findRedirectTarget(catalog, slug);
    if (target) permanentRedirect(`/designs/${target.slug}`);
    notFound();
  }

  const title = designSeoTitle(direct);
  const description = designSeoDescription(direct);
  const path = `/designs/${direct.slug}`;
  const category = primaryCategory(catalog, direct);
  const categories = direct.categoryIds
    .map((id) => catalog.categories.find((item) => item.id === id && item.status === "active"))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ slug: item.slug, name: item.name }));
  const collections = direct.collectionIds
    .map((id) => catalog.collections.find((item) => item.id === id && item.status === "active"))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ slug: item.slug, name: item.name }));
  const crumbs = breadcrumbTrail(
    { label: "طراحی‌های آماده", href: "/designs" },
    ...(category
      ? [{ label: category.name, href: `/designs/category/${category.slug}` }]
      : []),
    { label: direct.title },
  );
  const template = getCaseTemplateBySlug(direct.templateSlug) ?? null;
  const images = selectProductImages(direct);
  const related = relatedDesigns(catalog, direct).map((item) => ({
    slug: item.slug,
    title: item.title,
    image: item.thumbnailPath,
    alt: item.alt,
  }));

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: title, description, path }),
          breadcrumbJsonLd(crumbs, path),
        ]}
      />
      <main id="main" tabIndex={-1} className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground outline-none sm:px-6">
        <div className="mx-auto max-w-5xl">
          <CatalogBreadcrumbs items={crumbs} />
          <div className="mt-8">
            <DesignDetailClient
              template={template}
              title={direct.title}
              description={direct.description || direct.shortDescription || description}
              imageSrc={images.hero}
              imageAlt={images.alt}
              imageWidth={images.width}
              imageHeight={images.height}
              gallery={images.gallery}
              categories={categories}
              collections={collections}
              tags={direct.tags}
              related={related}
            />
          </div>
        </div>
      </main>
    </>
  );
}
