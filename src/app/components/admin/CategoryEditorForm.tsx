"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import AdminSelect from "@/app/components/admin/AdminSelect";
import { adminJson } from "@/app/components/admin/AdminShell";
import {
  categoryWriteSchema,
  type CategoryRecord,
  type CategoryWriteInput,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

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
      <label className="text-sm">
        تصویر کاور
        <input {...form.register("coverImage")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
        <FieldError message={form.formState.errors.coverImage?.message} />
      </label>
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
