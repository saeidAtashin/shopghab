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
import { designProductJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
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

  const categoryName = primaryCategory(catalog, design)?.name;
  return createPageMetadata({
    title: designSeoTitle(design),
    description: designSeoDescription(design, categoryName),
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

  const category = primaryCategory(catalog, direct);
  const title = designSeoTitle(direct);
  const description = designSeoDescription(direct, category?.name);
  const path = `/designs/${direct.slug}`;
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
  const gallery = images.frames.map((frame) => ({
    src: frame.src,
    thumb: frame.thumb || frame.src,
    artwork: frame.src === direct.imagePath,
  }));
  if (direct.imagePath && !gallery.some((frame) => frame.src === direct.imagePath)) {
    gallery.push({
      src: direct.imagePath,
      thumb: direct.thumbnailPath || direct.imagePath,
      artwork: true,
    });
  }
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
          designProductJsonLd({
            name: title,
            description,
            path,
            image: images.hero || undefined,
            sku: direct.id,
          }),
          breadcrumbJsonLd(crumbs, path),
        ]}
      />
      <main id="main" tabIndex={-1} className="min-h-screen bg-background px-4 pb-16 pt-24 text-foreground outline-none sm:px-6">
        <div className="mx-auto max-w-5xl">
          <CatalogBreadcrumbs items={crumbs} />
          <div className="mt-8">
            <DesignDetailClient
              template={template}
              previewId={direct.id}
              title={direct.title}
              description={direct.description || direct.shortDescription || description}
              gallery={gallery}
              imageAlt={images.alt}
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
