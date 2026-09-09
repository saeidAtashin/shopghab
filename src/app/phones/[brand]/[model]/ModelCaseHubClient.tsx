"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PenLine, Sparkles } from "lucide-react";

import CaseTypePicker from "@/app/components/case-wizard/CaseTypePicker";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import DesignSamplesSection from "@/app/components/designs/DesignSamplesSection";
import { SELECTABLE_CASE_TYPE_SLUG } from "@/lib/cases/brands.static";
import type { CaseType, PhoneBrand, PhoneModel } from "@/lib/cases/types";
import type { CaseTemplate } from "@/lib/design/types";

type HubPath = "pre-designed" | "custom";

type Props = {
  brand: PhoneBrand;
  model: PhoneModel;
  caseTypes: CaseType[];
  templates: CaseTemplate[];
};

function parseHubPath(value: string | null): HubPath {
  return value === "custom" ? "custom" : "pre-designed";
}

export default function ModelCaseHubClient({
  brand,
  model,
  caseTypes,
  templates,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hubPath, setHubPath] = useState<HubPath>(() =>
    parseHubPath(searchParams.get("path")),
  );
  const [selectedCase, setSelectedCase] = useState(SELECTABLE_CASE_TYPE_SLUG);

  const selectPath = useCallback(
    (path: HubPath) => {
      setHubPath(path);
      const params = new URLSearchParams(searchParams.toString());
      if (path === "pre-designed") {
        params.delete("path");
      } else {
        params.set("path", path);
      }
      const query = params.toString();
      router.replace(
        `/phones/${brand.slug}/${model.slug}${query ? `?${query}` : ""}`,
        { scroll: false },
      );
    },
    [brand.slug, model.slug, router, searchParams],
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <WizardBreadcrumb
          crumbs={[
            { label: "برند", href: "/create" },
            { label: brand.name, href: `/create/${brand.slug}` },
            { label: model.name },
          ]}
        />

        <header className="mt-6">
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">
            قاب {model.name}
          </h1>
          <p className="mt-2 text-muted">
            مرحله ۳ از ۳ — مسیر طراحی را انتخاب کنید
          </p>
        </header>

        <div
          className="mt-8 grid gap-4 sm:grid-cols-2"
          role="tablist"
          aria-label="مسیر طراحی"
        >
          <button
            type="button"
            role="tab"
            aria-selected={hubPath === "pre-designed"}
            onClick={() => selectPath("pre-designed")}
            className={`flex items-start gap-4 rounded-2xl border p-5 text-right transition ${
              hubPath === "pre-designed"
                ? "border-cyan-500/60 bg-cyan-500/10"
                : "border-border bg-card/60 hover:border-cyan-500/30"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
              <Sparkles size={22} className="text-cyan-400" />
            </div>
            <div>
              <p className="font-bold text-foreground">طراحی آماده</p>
              <p className="mt-1 text-sm text-muted">
                از بین طراحی‌های از پیش ساخته‌شده انتخاب کنید
              </p>
            </div>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={hubPath === "custom"}
            onClick={() => selectPath("custom")}
            className={`flex items-start gap-4 rounded-2xl border p-5 text-right transition ${
              hubPath === "custom"
                ? "border-cyan-500/60 bg-cyan-500/10"
                : "border-border bg-card/60 hover:border-cyan-500/30"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
              <PenLine size={22} className="text-cyan-400" />
            </div>
            <div>
              <p className="font-bold text-foreground">طراحی اختصاصی</p>
              <p className="mt-1 text-sm text-muted">
                قاب خالی — متن، استیکر و تصویر خود را اضافه کنید
              </p>
            </div>
          </button>
        </div>

        {hubPath === "pre-designed" ? (
          <section className="mt-10" aria-labelledby="pre-designed-heading">
            <DesignSamplesSection
              templates={templates}
              showViewAll={false}
              title="طراحی‌های آماده"
              description={`روی ${model.name} اعمال می‌شوند — انتخاب کنید و ویرایش کنید`}
              initialBrandSlug={brand.slug}
              initialModelSlug={model.slug}
            />
          </section>
        ) : (
          <section className="mt-10" aria-labelledby="custom-design-heading">
            <div className="mb-8">
              <h2
                id="custom-design-heading"
                className="text-xl font-black text-foreground"
              >
                طراحی اختصاصی
              </h2>
              <p className="mt-1 text-sm text-muted">
                نوع قاب را انتخاب کنید و طراحی را شروع کنید
              </p>
            </div>
            <CaseTypePicker
              brandSlug={brand.slug}
              modelSlug={model.slug}
              caseTypes={caseTypes}
              selectedSlug={selectedCase}
              onSelect={setSelectedCase}
            />

            <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <h3 className="text-lg font-bold text-foreground">طراحی قاب برای شما</h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                تصویر و توضیحات خود را بفرستید — ما قاب را طراحی می‌کنیم و برای
                تأیید به شما ارسال می‌کنیم.
              </p>
              <Link
                href={`/design/${brand.slug}/${model.slug}/${selectedCase}?tab=design-for-you`}
                className="mt-4 inline-flex rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
              >
                ارسال درخواست طراحی
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
