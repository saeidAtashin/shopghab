"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { adminJson } from "@/app/components/admin/AdminShell";
import {
  collectionWriteSchema,
  type CollectionRecord,
  type CollectionWriteInput,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

function valuesOf(collection?: CollectionRecord): CollectionWriteInput {
  return {
    name: collection?.name ?? "",
    slug: collection?.slug ?? "",
    description: collection?.description ?? "",
    seoTitle: collection?.seoTitle ?? "",
    seoDescription: collection?.seoDescription ?? "",
    coverImage: collection?.coverImage ?? "",
    status: collection?.status ?? "active",
    sortOrder: collection?.sortOrder ?? 0,
  };
}

export default function CollectionEditorForm({ collection }: { collection?: CollectionRecord }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const form = useForm<CollectionWriteInput>({
    resolver: zodResolver(collectionWriteSchema),
    defaultValues: valuesOf(collection),
  });

  async function onSubmit(values: CollectionWriteInput) {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      if (collection) {
        await adminJson(`/api/admin/catalog/collections/${collection.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        setNotice("کالکشن ذخیره شد.");
        router.refresh();
      } else {
        const created = await adminJson<{ collection: CollectionRecord }>("/api/admin/catalog/collections", {
          method: "POST",
          body: JSON.stringify(values),
        });
        router.push(`/admin/collections/${created.collection.id}`);
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
        نام
        <input {...form.register("name")} className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm">
        اسلاگ
        <input {...form.register("slug")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
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
      </label>
      <label className="text-sm">
        وضعیت
        <select {...form.register("status")} className={`${inputClass} mt-1`}>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
          <option value="archived">بایگانی</option>
        </select>
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
