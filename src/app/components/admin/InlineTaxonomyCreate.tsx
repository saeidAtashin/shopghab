"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import AdminSelect from "@/app/components/admin/AdminSelect";
import { adminJson } from "@/app/components/admin/AdminShell";
import { designSlugBase } from "@/lib/catalog/design-autofill";
import type {
  AttributeValueRecord,
  CategoryRecord,
  CollectionRecord,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-cyan-500";

function uniqueSlug(base: string, used: Set<string>): string {
  const root = base || "item";
  if (!used.has(root)) return root;
  let index = 2;
  while (used.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

export function InlineCategoryCreate({
  categories,
  onCreated,
}: {
  categories: CategoryRecord[];
  onCreated: (category: CategoryRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parentOptions = useMemo(() => {
    const byId = new Map(categories.map((category) => [category.id, category]));
    const labelFor = (category: CategoryRecord): string => {
      const parent = category.parentId ? byId.get(category.parentId) : undefined;
      return parent ? `${parent.name} / ${category.name}` : category.name;
    };
    return [
      { value: "", label: "ریشه (بدون والد)" },
      ...[...categories]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fa"))
        .map((category) => ({ value: category.id, label: labelFor(category) })),
    ];
  }, [categories]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("نام دسته الزامی است");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const slug = uniqueSlug(
        designSlugBase({ title: trimmed, titleEn: "" }),
        new Set(categories.map((category) => category.slug)),
      );
      const body = await adminJson<{ category: CategoryRecord }>("/api/admin/catalog/categories", {
        method: "POST",
        body: JSON.stringify({
          name: trimmed,
          slug,
          parentId: parentId || null,
          description: "",
          seoTitle: "",
          seoDescription: "",
          coverImage: "",
          status: "active",
        }),
      });
      onCreated(body.category);
      setName("");
      setParentId("");
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ایجاد دسته انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 min-h-11 rounded-full border border-dashed border-border px-4 text-sm text-cyan-300 hover:border-cyan-500/50"
      >
        + افزودن دسته
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2 rounded-2xl border border-border bg-black/20 p-3">
      <p className="text-xs font-semibold text-cyan-300">دسته جدید</p>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="نام دسته"
        className={inputClass}
        aria-label="نام دسته جدید"
      />
      <AdminSelect
        value={parentId}
        onChange={setParentId}
        ariaLabel="دسته والد"
        options={parentOptions}
      />
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-full bg-cyan-500 px-4 text-sm font-bold text-black disabled:opacity-60"
        >
          {saving ? "..." : "ایجاد و انتخاب"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="min-h-11 rounded-full border border-border px-4 text-sm"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

export function InlineAttributeValueCreate({
  groupId,
  groupName,
  onCreated,
}: {
  groupId: string;
  groupName: string;
  onCreated: (value: AttributeValueRecord) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("نام ویژگی الزامی است");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = await adminJson<{ value: AttributeValueRecord | null }>(
        "/api/admin/catalog/attributes",
        {
          method: "POST",
          body: JSON.stringify({ kind: "value", groupId, name: trimmed }),
        },
      );
      if (!body.value) throw new Error("ویژگی ایجاد شد ولی شناسه برنگشت");
      onCreated(body.value);
      setName("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ایجاد ویژگی انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={`افزودن به ${groupName}`}
        className={`${inputClass} min-w-[10rem] flex-1`}
        aria-label={`افزودن مقدار به ${groupName}`}
      />
      <button
        type="submit"
        disabled={saving}
        className="min-h-11 rounded-full border border-dashed border-border px-3 text-sm text-cyan-300 disabled:opacity-60"
      >
        {saving ? "..." : "+"}
      </button>
      {error ? <p className="w-full text-xs text-red-300">{error}</p> : null}
    </form>
  );
}

export function InlineCollectionCreate({
  collections,
  onCreated,
}: {
  collections: CollectionRecord[];
  onCreated: (collection: CollectionRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("نام کالکشن الزامی است");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const slug = uniqueSlug(
        designSlugBase({ title: trimmed, titleEn: "" }),
        new Set(collections.map((collection) => collection.slug)),
      );
      const body = await adminJson<{ collection: CollectionRecord }>("/api/admin/catalog/collections", {
        method: "POST",
        body: JSON.stringify({
          name: trimmed,
          slug,
          description: "",
          seoTitle: "",
          seoDescription: "",
          coverImage: "",
          status: "active",
        }),
      });
      onCreated(body.collection);
      setName("");
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ایجاد کالکشن انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 min-h-11 rounded-full border border-dashed border-border px-4 text-sm text-cyan-300 hover:border-cyan-500/50"
      >
        + افزودن کالکشن
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2 rounded-2xl border border-border bg-black/20 p-3">
      <p className="text-xs font-semibold text-cyan-300">کالکشن جدید</p>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="نام کالکشن"
        className={inputClass}
        aria-label="نام کالکشن جدید"
      />
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-full bg-cyan-500 px-4 text-sm font-bold text-black disabled:opacity-60"
        >
          {saving ? "..." : "ایجاد و انتخاب"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="min-h-11 rounded-full border border-border px-4 text-sm"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

export function GuidedSuggestionRow({
  title,
  suggestions,
  onApply,
}: {
  title: string;
  suggestions: { id: string; label: string; groupLabel: string }[];
  onApply: (id: string) => void;
}) {
  if (suggestions.length === 0) return null;
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3">
      <p className="mb-2 text-xs font-semibold text-cyan-300">{title}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onApply(item.id)}
            className="min-h-11 rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 text-sm text-cyan-100 hover:border-cyan-300"
            title={item.groupLabel}
          >
            + {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TaxonomyHint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-6 text-muted">{children}</p>;
}
