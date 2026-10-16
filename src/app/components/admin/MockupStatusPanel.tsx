"use client";

import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";

type TemplateSummary = {
  id: string;
  name: string;
  enabled: boolean;
  renderer: "prepared" | "photoshop";
  default: boolean;
};

type Issue = {
  slug: string;
  templateId: string;
  kind: "missing" | "outdated" | "error";
  error: string;
};

type StatusResponse = {
  templates: TemplateSummary[];
  summary: {
    designs: number;
    ready: number;
    missing: number;
    outdated: number;
    errors: number;
  };
  issues: Issue[];
};

const KIND_LABEL: Record<Issue["kind"], string> = {
  missing: "نیاز به ساخت",
  outdated: "قدیمی",
  error: "خطا",
};

export default function MockupStatusPanel() {
  const [report, setReport] = useState<StatusResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void adminJson<StatusResponse>("/api/admin/catalog/mockups")
      .then(setReport)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "وضعیت موکاپ دریافت نشد");
      });
  }, []);

  return (
    <section className="mb-6 rounded-3xl border border-border bg-surface p-4" aria-label="وضعیت موکاپ قاب">
      <h2 className="text-sm font-bold">موکاپ قاب</h2>
      <p className="mt-2 text-xs leading-6 text-muted">
        ساخت و بازسازی تصویرها فقط با دستور محلی انجام می‌شود: npm run mockups:generate -- --design=slug یا --all.
        صفحه فروش این فایل‌های PSD را باز نمی‌کند.
      </p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {!report && !error ? <p className="mt-3 text-sm text-muted">در حال دریافت وضعیت...</p> : null}
      {report ? (
        <div className="mt-3 space-y-3 text-sm">
          <p>
            قالب فعال: {report.templates.filter((item) => item.enabled).length} از {report.templates.length}. آماده:{" "}
            {report.summary.ready}. ناقص: {report.summary.missing}. قدیمی: {report.summary.outdated}. خطا:{" "}
            {report.summary.errors}.
          </p>
          {report.templates.length === 0 ? (
            <p className="text-muted">هنوز قالبی ثبت نشده است.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {report.templates.map((template) => (
                <li key={template.id} className="rounded-full border border-border px-3 py-1 text-xs">
                  {template.name} · {template.enabled ? "فعال" : "غیرفعال"}
                  {template.default && template.enabled ? " · تصویر اصلی" : ""}
                </li>
              ))}
            </ul>
          )}
          {report.issues.length > 0 ? (
            <ul className="space-y-1 text-xs text-muted">
              {report.issues.slice(0, 8).map((issue) => (
                <li key={`${issue.slug}-${issue.templateId}-${issue.kind}`}>
                  {issue.slug}
                  {issue.templateId ? ` / ${issue.templateId}` : ""} · {KIND_LABEL[issue.kind]} · {issue.error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
