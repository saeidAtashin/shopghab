"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import AdminSelect from "@/app/components/admin/AdminSelect";
import { adminJson } from "@/app/components/admin/AdminShell";
import { designedAssetUrl } from "@/lib/designed-assets";
import {
  categoryWriteSchema,
  type CategoryRecord,
  type CategoryWriteInput,
  type DesignRecord,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

function designArtworkPath(design: Pick<DesignRecord, "thumbnailPath" | "imagePath">): string {
  for (const path of [design.thumbnailPath, design.imagePath]) {
    const trimmed = path.trim();
    if (trimmed.startsWith("/designed/") && !trimmed.includes("..")) return trimmed;
  }
  return "";
}

function valuesOf(category?: CategoryRecord, parentId?: string): CategoryWriteInput {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? parentId ?? null,
    description: category?.description ?? "",
    seoTitle: category?.seoTitle ?? "",
    seoDescription: category?.seoDescription ?? "",
    coverImage: category?.coverImage ?? "",
    status: category?.status ?? "active",
    sortOrder: category?.sortOrder ?? 0,
  };
}

type Props = {
  category?: CategoryRecord;
  categories: CategoryRecord[];
  parentId?: string;
};

function blockedParentIds(categories: CategoryRecord[], categoryId?: string): Set<string> {
  if (!categoryId) return new Set();
  const blocked = new Set<string>([categoryId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of categories) {
      if (item.parentId && blocked.has(item.parentId) && !blocked.has(item.id)) {
        blocked.add(item.id);
        grew = true;
      }
    }
  }
  return blocked;
}

export default function CategoryEditorForm({ category, categories, parentId }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const form = useForm<CategoryWriteInput>({
    resolver: zodResolver(categoryWriteSchema),
    defaultValues: valuesOf(category, parentId),
  });

  const blocked = blockedParentIds(categories, category?.id);
  const parents = categories.filter((item) => !blocked.has(item.id));
  const names = Object.fromEntries(categories.map((item) => [item.id, item.name]));

  async function onSubmit(values: CategoryWriteInput) {
    setSaving(true);
    setNotice("");
    setError("");
    const payload = { ...values, parentId: values.parentId || null };
    try {
      if (category) {
        await adminJson(`/api/admin/catalog/categories/${category.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("دسته ذخیره شد.");
        router.refresh();
      } else {
        const created = await adminJson<{ category: CategoryRecord }>("/api/admin/catalog/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push(`/admin/categories/${created.category.id}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-3xl gap-4">
      {notice ? <p className="rounded-2xl border border-cyan-500/40 px-4 py-3 text-sm">{notice}</p> : null}
      {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      <label className="text-sm">
        نام فارسی
        <input {...form.register("name")} className={`${inputClass} mt-1`} />
        <FieldError message={form.formState.errors.name?.message} />
      </label>
      <label className="text-sm">
        اسلاگ
        <input {...form.register("slug")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
        <FieldError message={form.formState.errors.slug?.message} />
      </label>
      <label className="text-sm">
        دسته والد
        <Controller
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <AdminSelect
              value={field.value ?? ""}
              onChange={(next) => field.onChange(next ? next : null)}
              onBlur={field.onBlur}
              ariaLabel="دسته والد"
              className="mt-1"
              options={[
                { value: "", label: "بدون والد" },
                ...parents.map((item) => ({
                  value: item.id,
                  label: item.parentId ? `${names[item.parentId] ?? ""} / ${item.name}` : item.name,
                })),
              ]}
            />
          )}
        />
      </label>
      <label className="text-sm">
        توضیحات
        <textarea {...form.register("description")} rows={4} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        عنوان سئو
        <input {...form.register("seoTitle")} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        توضیحات متا
        <textarea {...form.register("seoDescription")} rows={3} className={`${inputClass} mt-1`} />
      </label>
      <div className="grid gap-2">
        <CategoryCoverDesignPicker
          categoryId={category?.id}
          coverImage={form.watch("coverImage")}
          onPick={(path) => form.setValue("coverImage", path, { shouldDirty: true, shouldValidate: true })}
        />
        <label className="text-sm">
          تصویر کاور
          <input {...form.register("coverImage")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
          <FieldError message={form.formState.errors.coverImage?.message} />
        </label>
      </div>
      <label className="text-sm">
        وضعیت
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <AdminSelect
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ariaLabel="وضعیت"
              className="mt-1"
              options={[
                { value: "active", label: "فعال" },
                { value: "inactive", label: "غیرفعال" },
                { value: "archived", label: "بایگانی" },
              ]}
            />
          )}
        />
      </label>
      <label className="text-sm">
        ترتیب
        <input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={`${inputClass} mt-1`} />
      </label>
      <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
        {saving ? "در حال ذخیره..." : "ذخیره"}
      </button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-300">{message}</span>;
}

function CategoryCoverDesignPicker({
  categoryId,
  coverImage,
  onPick,
}: {
  categoryId?: string;
  coverImage: string;
  onPick: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DesignRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !categoryId) return;
    const params = new URLSearchParams({
      categoryId,
      status: "published",
      page: "1",
    });
    if (query.trim()) params.set("q", query.trim());

    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void adminJson<{ items: DesignRecord[] }>(`/api/admin/catalog/designs?${params.toString()}`)
        .then((body) => setItems(body.items))
        .catch((reason: unknown) => {
          setItems([]);
          setError(reason instanceof Error ? reason.message : "دریافت طرح‌ها انجام نشد");
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [open, categoryId, query]);

  if (!categoryId) {
    return (
      <p className="rounded-2xl border border-border bg-surface/40 px-4 py-3 text-sm text-muted">
        پس از ذخیره دسته می‌توانید طرح اصلی را برای تصویر کاور انتخاب کنید.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">انتخاب طرح برای کاور</p>
        <div className="flex flex-wrap gap-2">
          {coverImage.trim() ? (
            <button
              type="button"
              onClick={() => onPick("")}
              className="text-xs font-semibold text-red-300 hover:underline"
            >
              حذف انتخاب
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="text-xs font-semibold text-cyan-300 hover:underline"
            aria-expanded={open}
          >
            {open ? "بستن" : "باز کردن فهرست طرح‌ها"}
          </button>
        </div>
      </div>
      {coverImage.trim().startsWith("/designed/") ? (
        <div className="mt-3 flex items-center gap-3">
          <Image
            src={designedAssetUrl(coverImage.trim())}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-xl object-cover"
          />
          <span className="truncate text-xs text-muted" dir="ltr">
            {coverImage.trim()}
          </span>
        </div>
      ) : null}
      {open ? (
        <div className="mt-3 space-y-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی طرح"
            className={`${inputClass} py-2 text-sm`}
            aria-label="جستجوی طرح برای کاور"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {loading ? <p className="text-sm text-muted">در حال دریافت...</p> : null}
          {!loading && items.length === 0 ? (
            <p className="text-sm text-muted">طرح منتشرشده‌ای در این دسته نیست.</p>
          ) : (
            <ul className="max-h-56 space-y-1 overflow-auto">
              {items.map((design) => {
                const artwork = designArtworkPath(design);
                if (!artwork) return null;
                const active = coverImage.trim() === artwork;
                return (
                  <li key={design.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(artwork);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-start hover:bg-white/5 ${
                        active ? "bg-cyan-500/10 text-cyan-300" : "text-foreground"
                      }`}
                    >
                      <Image
                        src={designedAssetUrl(artwork)}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">{design.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
