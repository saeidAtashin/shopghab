"use client";

import Image from "next/image";
import { useState } from "react";

import {
  getAllTemplates,
} from "@/lib/cases/templates.static";
import { useEditorStore } from "@/lib/design/editor-store";
import type { CaseTemplate } from "@/lib/design/types";

type Props = {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
};

export default function TemplatesPanel({ brandSlug: _brandSlug, modelSlug: _modelSlug, caseTypeSlug: _caseTypeSlug }: Props) {
  const document = useEditorStore((s) => s.document);
  const loadTemplate = useEditorStore((s) => s.loadTemplate);
  const [confirmTemplate, setConfirmTemplate] = useState<CaseTemplate | null>(null);

  const displayTemplates = getAllTemplates();

  function applyTemplate(template: CaseTemplate, replace: boolean) {
    loadTemplate(template, replace);
    setConfirmTemplate(null);
  }

  function handleSelect(template: CaseTemplate) {
    if (document.layers.length > 0) {
      setConfirmTemplate(template);
    } else {
      applyTemplate(template, true);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        از قالب‌های از پیش طراحی‌شده استفاده کنید و آن‌ها را ویرایش کنید.
      </p>

      {displayTemplates.length === 0 ? (
        <p className="text-center text-xs text-muted">قالب‌های بیشتر به زودی اضافه می‌شوند.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
          {displayTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className="overflow-hidden rounded-xl border border-border bg-card/60 text-right transition hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg"
            >
              <div className="relative flex min-h-[140px] items-center justify-center bg-background/50 p-4 sm:min-h-[160px] sm:p-6">
                {template.tags[0] ? (
                  <span className="absolute start-3 top-3 rounded-lg border border-cyan-500/25 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-cyan-300 backdrop-blur-sm">
                    {template.tags[0]}
                  </span>
                ) : null}
                <Image
                  src={template.thumbnail}
                  alt={template.title}
                  width={140}
                  height={140}
                  className="h-auto w-full max-h-[120px] object-contain sm:max-h-[140px]"
                />
              </div>
              <div className="border-t border-border px-3 py-3 sm:px-4">
                <p className="text-sm font-bold text-foreground">{template.title}</p>
                <p className="mt-1 text-xs text-muted">{template.layers.length} لایه</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {confirmTemplate ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-bold text-foreground">جایگزینی طراحی فعلی؟</p>
            <p className="mt-2 text-xs text-muted">
              لایه‌های فعلی حفظ شوند یا با قالب «{confirmTemplate.title}» جایگزین شوند؟
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => applyTemplate(confirmTemplate, true)}
                className="rounded-xl bg-cyan-500 py-2 text-sm font-bold text-black"
              >
                جایگزین کامل
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(confirmTemplate, false)}
                className="rounded-xl border border-border py-2 text-sm text-foreground"
              >
                افزودن به لایه‌های فعلی
              </button>
              <button
                type="button"
                onClick={() => setConfirmTemplate(null)}
                className="py-2 text-xs text-muted"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
