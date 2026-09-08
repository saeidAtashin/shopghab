"use client";

import type { CaseTemplate } from "@/lib/design/types";
import DesignSampleCard from "./DesignSampleCard";

type Props = {
  templates: CaseTemplate[];
  limit?: number;
  onSelect?: (template: CaseTemplate) => void;
  linkMode?: boolean;
  priorityFirst?: boolean;
};

export default function DesignSampleGrid({
  templates,
  limit,
  onSelect,
  linkMode = false,
  priorityFirst = false,
}: Props) {
  const items = limit != null ? templates.slice(0, limit) : templates;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((template, index) => (
        <DesignSampleCard
          key={template.id}
          template={template}
          onSelect={onSelect}
          href={linkMode ? `/designs/${template.slug}` : undefined}
          priority={priorityFirst && index === 0}
        />
      ))}
    </div>
  );
}
