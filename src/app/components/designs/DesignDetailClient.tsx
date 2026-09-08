"use client";

import { useState } from "react";
import ApplyTemplateWizard from "@/app/components/designs/ApplyTemplateWizard";
import DesignSamplePreview from "@/app/components/designs/DesignSamplePreview";
import type { CaseTemplate } from "@/lib/design/types";

type Props = {
  template: CaseTemplate;
};

export default function DesignDetailClient({ template }: Props) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card/40 p-8">
          <DesignSamplePreview template={template} maxHeight={420} />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">{template.title}</h1>
          <p className="mt-4 text-sm leading-8 text-muted">{template.description}</p>
          <p className="mt-4 text-sm text-muted">
            {template.layers.length} لایه · سازگار با تمام برندها و مدل‌ها
          </p>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400 sm:w-auto sm:px-10"
          >
            انتخاب گوشی و ویرایش
          </button>
        </div>
      </div>

      <ApplyTemplateWizard
        template={template}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </>
  );
}
