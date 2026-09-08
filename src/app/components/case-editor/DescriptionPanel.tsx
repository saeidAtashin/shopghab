"use client";

import { useEditorStore } from "@/lib/design/editor-store";

export default function DescriptionPanel() {
  const document = useEditorStore((s) => s.document);
  const setDescription = useEditorStore((s) => s.setDescription);
  const setName = useEditorStore((s) => s.setName);

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs text-muted">نام طراحی</span>
        <input
          type="text"
          value={document.name ?? ""}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: قاب تولدم"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted">توضیحات (برای سفارش)</span>
        <textarea
          value={document.description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="توضیحات اضافی برای چاپ یا ارسال..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
    </div>
  );
}
