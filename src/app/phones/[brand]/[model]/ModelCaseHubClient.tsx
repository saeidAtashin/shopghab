"use client";

import { useState } from "react";
import Link from "next/link";

import CaseTypePicker from "@/app/components/case-wizard/CaseTypePicker";
import WizardBreadcrumb from "@/app/components/case-wizard/WizardBreadcrumb";
import {
  SELECTABLE_CASE_TYPE_SLUG,
  buildCustomDesignPath,
} from "@/lib/cases/brands.static";
import type { CaseType, PhoneBrand, PhoneModel } from "@/lib/cases/types";

type Props = {
  brand: PhoneBrand;
  model: PhoneModel;
  caseTypes: CaseType[];
};

export default function ModelCaseHubClient({
  brand,
  model,
  caseTypes,
}: Props) {
  const [selectedCase, setSelectedCase] = useState(SELECTABLE_CASE_TYPE_SLUG);

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
          <p className="mt-2 text-muted">طراحی اختصاصی</p>
        </header>

        <section className="mt-10" aria-labelledby="custom-design-heading">
          <div className="mb-8">
            <h2
              id="custom-design-heading"
              className="text-xl font-black text-foreground"
            >
              طراحی اختصاصی
            </h2>
            <p className="mt-1 text-sm text-muted">
              قاب خالی — متن، استیکر و تصویر خود را اضافه کنید
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
              href={`${buildCustomDesignPath(brand.slug, model.slug)}?tab=design-for-you`}
              className="mt-4 inline-flex rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
            >
              ارسال درخواست طراحی
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
