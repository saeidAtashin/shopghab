"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { adminJson } from "@/app/components/admin/AdminShell";
import {
  categoryWriteSchema,
  type CategoryRecord,
  type CategoryWriteInput,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

function valuesOf(category?: CategoryRecord): CategoryWriteInput {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? null,
    description: category?.description ?? "",
    seoTitle: category?.seoTitle ?? "",
    seoDescription: category?.seoDescription ?? "",
    coverImage: category?.coverImage ?? "",
    status: category?.status ?? "active",
  };
}

type Props = {
  category?: CategoryRecord;
  categories: CategoryRecord[];
};

export default function CategoryEditorForm({ category, categories }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const form = useForm<CategoryWriteInput>({
    resolver: zodResolver(categoryWriteSchema),
    defaultValues: valuesOf(category),
  });

  const parents = categories.filter((item) => item.id !== category?.id);

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
        <select
          {...form.register("parentId", {
            setValueAs: (value: string) => (value ? value : null),
          })}
          className={`${inputClass} mt-1`}
        >
          <option value="">بدون والد</option>
          {parents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
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
        <select {...form.register("status")} className={`${inputClass} mt-1`}>
          <option value="active">فعال</option>
          <option value="archived">بایگانی</option>
        </select>
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
