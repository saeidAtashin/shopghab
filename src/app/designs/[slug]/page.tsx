import { notFound } from "next/navigation";
import Link from "next/link";

import DesignDetailClient from "@/app/components/designs/DesignDetailClient";
import JsonLd from "@/app/components/seo/JsonLd";
import { getCaseTemplateBySlug, getDesignedTemplates } from "@/lib/cases/templates.static";
import { designedAssetUrl } from "@/lib/designed-assets";
import { createPageMetadata } from "@/lib/seo/metadata";
import { webPageJsonLd } from "@/lib/seo/jsonld";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getDesignedTemplates().map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const template = getCaseTemplateBySlug(slug);
  if (!template) return {};

  return createPageMetadata({
    title: template.title,
    description: template.description,
    path: `/designs/${slug}`,
    ogImage: designedAssetUrl(template.thumbnail),
  });
}

export default async function DesignDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = getCaseTemplateBySlug(slug);
  if (!template) notFound();

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: template.title,
          description: template.description,
          path: `/designs/${slug}`,
        })}
      />
      <div className="min-h-screen bg-background px-4 pb-16 pt-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/designs" className="text-sm text-cyan-400 hover:underline">
            ← بازگشت به طراحی‌های آماده
          </Link>
          <div className="mt-8">
            <DesignDetailClient template={template} />
          </div>
        </div>
      </div>
    </>
  );
}
