"use client";

import Link from "next/link";
import { ShoppingCart, Palette } from "lucide-react";
import { useShopCart } from "@/app/context/ShopCartContext";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import {
  getBrandBySlug,
  getCaseTypeBySlug,
  getModelBySlug,
} from "@/lib/cases";
import { formatToman } from "@/lib/shop/format";
import type { ReadyCase } from "@/lib/cases/types";

type Props = {
  product: ReadyCase;
};

export default function ReadyCaseDetail({ product }: Props) {
  const { addReadyCase } = useShopCart();
  const brand = getBrandBySlug(product.brandSlug);
  const model = getModelBySlug(product.brandSlug, product.modelSlug);
  const caseType = getCaseTypeBySlug(product.caseTypeSlug);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6">
      <WizardBreadcrumb
        crumbs={[
          { label: "قاب‌های آماده", href: "/cases" },
          ...(model
            ? [
                {
                  label: model.name,
                  href: `/phones/${product.brandSlug}/${product.modelSlug}`,
                },
              ]
            : []),
          { label: product.title },
        ]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card/40 p-12">
          <div
            className="h-64 w-32 rounded-[2rem] border-2 border-border shadow-2xl"
            style={{
              backgroundColor: caseType?.color ?? "#2a2a2e",
              backgroundImage: "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(139,92,246,0.3) 100%)",
            }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-black text-foreground sm:text-3xl">{product.title}</h1>
            <p className="mt-3 leading-7 text-muted">{product.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <dt className="text-muted">برند</dt>
              <dd className="font-medium text-foreground">{brand?.name}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <dt className="text-muted">مدل</dt>
              <dd className="font-medium text-foreground">{model?.name}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <dt className="text-muted">نوع قاب</dt>
              <dd className="font-medium text-foreground">{caseType?.name}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <dt className="text-muted">موجودی</dt>
              <dd className="font-medium text-emerald-400">
                {product.inStock ? "موجود" : "ناموجود"}
              </dd>
            </div>
          </dl>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-cyan-400">
              {formatToman(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-muted line-through">
                {formatToman(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => addReadyCase(product.id, product.title)}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              افزودن به سبد
            </button>
            {product.template ? (
              <Link
                href={`/design/${product.brandSlug}/${product.modelSlug}/${product.caseTypeSlug}?template=${product.slug}`}
                className="flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-6 py-3 text-sm font-bold text-cyan-400 transition hover:bg-cyan-500/20"
              >
                <Palette size={18} />
                ویرایش در ادیتور
              </Link>
            ) : null}
            <Link
              href={`/phones/${product.brandSlug}/${product.modelSlug}`}
              className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground transition hover:border-cyan-500/50"
            >
              <Palette size={18} />
              طراحی مشابه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
