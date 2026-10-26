"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import PhoneVerificationModal from "@/app/components/auth/PhoneVerificationModal";
import ApplyTemplateWizard, {
  type TemplatePurchaseIntent,
} from "@/app/components/designs/ApplyTemplateWizard";
import DockableAction from "@/app/components/ui/DockableAction";
import DesignArtworkStage from "@/app/components/designs/DesignArtworkStage";
import DesignImageZoom from "@/app/components/designs/DesignImageZoom";
import { useAuth } from "@/app/context/AuthContext";
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
type GalleryImage = { src: string; thumb: string; artwork: boolean };

type Props = {
  template: CaseTemplate | null;
  previewId: string;
  title: string;
  description: string;
  gallery: GalleryImage[];
  imageAlt: string;
  categories: CategoryLink[];
  collections?: CategoryLink[];
  tags: string[];
  related: RelatedDesign[];
};

export default function DesignDetailClient({
  template,
  previewId,
  title,
  description,
  gallery,
  imageAlt,
  categories,
  collections = [],
  tags,
  related,
}: Props) {
  const { user, loading: authLoading } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardIntent, setWizardIntent] = useState<TemplatePurchaseIntent>("premade");
  const [loginOpen, setLoginOpen] = useState(false);
  const [caseTypeSlug, setCaseTypeSlug] = useState(SELECTABLE_CASE_TYPE_SLUG);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const active = gallery[activeIndex] ?? gallery[0];
  const caseType = CASE_TYPES.find((item) => item.slug === caseTypeSlug) ?? CASE_TYPES[0];
  const premadePrice = caseType ? getCaseTotalPrice(caseType, false) : null;
  const customPrice = caseType ? getCaseTotalPrice(caseType, true) : null;

  function openWizard(intent: TemplatePurchaseIntent) {
    setWizardIntent(intent);
    setWizardOpen(true);
  }

  function startCustomDesign() {
    if (authLoading) return;
    if (!user) {
      setLoginOpen(true);
      return;
    }
    openWizard("custom");
  }

  function stepGallery(direction: number): void {
    setActiveIndex((current) => (current + direction + gallery.length) % gallery.length);
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          {active?.artwork ? (
            <DesignArtworkStage
              id={previewId}
              src={active.src}
              thumb={active.thumb}
              alt={imageAlt}
              priority
              sizes="(max-width: 1024px) 100vw, 640px"
              className="min-h-80 rounded-2xl border border-border"
              imageClassName="object-contain p-6"
              onZoom={() => setZoomOpen(true)}
            />
          ) : active ? (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="relative block min-h-80 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-card/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
              aria-label={`بزرگ‌نمایی ${imageAlt}`}
            >
              <Image
                src={designedAssetUrl(active.src)}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-contain p-6"
              />
            </button>
          ) : (
            <div className="flex min-h-80 items-center justify-center rounded-2xl border border-border bg-card/40 p-6">
              <p className="text-sm text-muted">تصویر این طرح در دسترس نیست.</p>
            </div>
          )}
          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((frame, index) => (
                <button
                  key={frame.src}
                  type="button"
                  onClick={() => {
                    setZoomOpen(false);
                    setActiveIndex(index);
                  }}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                    active?.src === frame.src ? "border-cyan-400" : "border-border"
                  }`}
                  aria-label={frame.artwork ? "نمایش لایه تصویر" : "نمایش تصویر"}
                  aria-current={active?.src === frame.src ? "true" : undefined}
                >
                  <Image
                    src={designedAssetUrl(frame.thumb)}
                    alt=""
                    fill
                    sizes="64px"
                    loading="lazy"
                    className="object-contain"
                  />
                </button>
              ))}
            </div>
          ) : null}
          {active ? (
            <DesignImageZoom
              open={zoomOpen}
              src={active.src}
              alt={imageAlt}
              onClose={() => setZoomOpen(false)}
              onPrev={gallery.length > 1 ? () => stepGallery(-1) : undefined}
              onNext={gallery.length > 1 ? () => stepGallery(1) : undefined}
            />
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
                    <span>{formatToman(getCaseTotalPrice(item, false))}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {premadePrice != null ? (
            <p className="mt-4 text-sm text-muted">
              طرح پیش‌ساخته:{" "}
              <span className="font-black text-foreground">{formatToman(premadePrice)}</span>
              {customPrice != null ? (
                <>
                  {" "}
                  · طراحی اختصاصی:{" "}
                  <span className="font-black text-foreground">{formatToman(customPrice)}</span>
                </>
              ) : null}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted">این طرح روی همه مدل‌های گوشی قابل چاپ است.</p>

          {template ? (
            <DockableAction className="mt-8">
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-64">
                <button
                  type="button"
                  onClick={() => openWizard("premade")}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400"
                >
                  خرید طرح پیش‌ساخته
                </button>
                <button
                  type="button"
                  onClick={startCustomDesign}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-500/10 py-3.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  طراحی اختصاصی
                </button>
              </div>
            </DockableAction>
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
                <div className="relative h-32 overflow-hidden bg-card/40">
                  {item.image ? (
                    <Image
                      src={designedAssetUrl(item.image)}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                      className="origin-center scale-200 object-contain"
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
          intent={wizardIntent}
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
        />
      ) : null}
      <PhoneVerificationModal
        open={loginOpen}
        phone=""
        onClose={() => setLoginOpen(false)}
        onVerified={() => {
          setLoginOpen(false);
          openWizard("custom");
        }}
      />
    </>
  );
}
