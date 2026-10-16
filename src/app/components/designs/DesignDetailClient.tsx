"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ApplyTemplateWizard from "@/app/components/designs/ApplyTemplateWizard";
import {
  CASE_TYPES,
  getCaseTotalPrice,
  isCaseTypeSelectable,
  SELECTABLE_CASE_TYPE_SLUG,
} from "@/lib/cases/brands.static";
import { designedAssetUrl } from "@/lib/designed-assets";
import type { CaseTemplate } from "@/lib/design/types";
import { formatToman } from "@/lib/shop/format";

type CategoryLink = { slug: string; name: string };
type RelatedDesign = { slug: string; title: string; image: string; alt: string };

type Props = {
  template: CaseTemplate | null;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  gallery: string[];
  categories: CategoryLink[];
  collections?: CategoryLink[];
  tags: string[];
  related: RelatedDesign[];
};

export default function DesignDetailClient({
  template,
  title,
  description,
  imageSrc,
  imageAlt,
  gallery,
  categories,
  collections = [],
  tags,
  related,
}: Props) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [caseTypeSlug, setCaseTypeSlug] = useState(SELECTABLE_CASE_TYPE_SLUG);
  const [activeImage, setActiveImage] = useState(imageSrc);
  const caseType = CASE_TYPES.find((item) => item.slug === caseTypeSlug) ?? CASE_TYPES[0];
  const price = caseType ? getCaseTotalPrice(caseType, true) : null;

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card/40 p-6">
            {activeImage ? (
              <Image
                src={designedAssetUrl(activeImage)}
                alt={imageAlt}
                width={640}
                height={640}
                priority
                className="h-auto max-h-[28rem] w-full object-contain"
              />
            ) : (
              <p className="text-sm text-muted">تصویر این طرح در دسترس نیست.</p>
            )}
          </div>
          {gallery.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {[imageSrc, ...gallery].filter(Boolean).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                    activeImage === src ? "border-cyan-400" : "border-border"
                  }`}
                  aria-label="نمایش تصویر"
                >
                  <Image src={designedAssetUrl(src)} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {categories.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/designs/category/${category.slug}`}
                  className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400 hover:underline"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
          {collections.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  href={`/designs/collection/${collection.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
                >
                  {collection.name}
                </Link>
              ))}
            </div>
          ) : null}
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-4 text-sm leading-8 text-muted">{description}</p>
          {tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="برچسب‌ها">
              {tags.map((tag) => (
                <li key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">نوع قاب</legend>
            <div className="mt-3 grid gap-2">
              {CASE_TYPES.map((item) => {
                const selectable = isCaseTypeSelectable(item.slug);
                return (
                  <label
                    key={item.slug}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
                      selectable ? "border-border" : "border-border/50 opacity-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="caseType"
                        value={item.slug}
                        checked={caseTypeSlug === item.slug}
                        disabled={!selectable}
                        onChange={() => setCaseTypeSlug(item.slug)}
                      />
                      {item.name}
                    </span>
                    <span>{formatToman(getCaseTotalPrice(item, true))}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {price != null ? (
            <p className="mt-4 text-lg font-black text-foreground">
              قیمت چاپ روی {caseType?.name}: {formatToman(price)}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted">این طرح روی همه مدل‌های گوشی قابل چاپ است.</p>

          {template ? (
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400 sm:w-auto sm:px-10"
            >
              انتخاب گوشی و ادامه خرید
            </button>
          ) : (
            <p className="mt-8 text-sm text-muted">قالب ویرایش این طرح هنوز به ادیتور وصل نشده است.</p>
          )}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16" aria-labelledby="related-designs">
          <h2 id="related-designs" className="text-xl font-black">
            طرح‌های مرتبط
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/designs/${item.slug}`}
                className="overflow-hidden rounded-2xl border border-border"
              >
                <div className="relative h-32 bg-card/40">
                  {item.image ? (
                    <Image
                      src={designedAssetUrl(item.image)}
                      alt={item.alt}
                      fill
                      sizes="25vw"
                      className="object-contain p-2"
                    />
                  ) : null}
                </div>
                <span className="block p-3 text-sm font-semibold">{item.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {template ? (
        <ApplyTemplateWizard
          template={template}
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
        />
      ) : null}
    </>
  );
}
