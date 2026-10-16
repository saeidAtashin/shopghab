"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { adminJson } from "@/app/components/admin/AdminShell";
import { designedAssetUrl } from "@/lib/designed-assets";
import {
  designWriteSchema,
  type CategoryRecord,
  type DesignRecord,
  type DesignWriteInput,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

function splitList(value: string): string[] {
  return value
    .split(/[,،\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyDesign(): DesignWriteInput {
  return {
    title: "",
    titleEn: "",
    slug: "",
    shortDescription: "",
    description: "",
    categoryIds: [],
    tags: [],
    colors: [],
    styles: [],
    alt: "",
    imagePath: "",
    thumbnailPath: "",
    gallery: [],
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    status: "draft",
    featured: false,
    sortOrder: 0,
    templateSlug: "",
  };
}

function fromDesign(design: DesignRecord): DesignWriteInput {
  return {
    title: design.title,
    titleEn: design.titleEn,
    slug: design.slug,
    shortDescription: design.shortDescription,
    description: design.description,
    categoryIds: design.categoryIds,
    tags: design.tags,
    colors: design.colors,
    styles: design.styles,
    alt: design.alt,
    imagePath: design.imagePath,
    thumbnailPath: design.thumbnailPath,
    gallery: design.gallery,
    seoTitle: design.seoTitle,
    seoDescription: design.seoDescription,
    ogImage: design.ogImage,
    status: design.status,
    featured: design.featured,
    sortOrder: design.sortOrder,
    templateSlug: design.templateSlug,
  };
}

type Props = {
  design?: DesignRecord;
  categories: CategoryRecord[];
};

export default function DesignEditorForm({ design, categories }: Props) {
  const router = useRouter();
  const defaults = design ? fromDesign(design) : emptyDesign();
  const [tagsText, setTagsText] = useState(defaults.tags.join("، "));
  const [colorsText, setColorsText] = useState(defaults.colors.join("، "));
  const [stylesText, setStylesText] = useState(defaults.styles.join("، "));
  const [galleryText, setGalleryText] = useState(defaults.gallery.join("\n"));
  const [categoryQuery, setCategoryQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(defaults.categoryIds);
  const [imagePath, setImagePath] = useState(defaults.imagePath);
  const [previewAlt, setPreviewAlt] = useState(defaults.alt || defaults.title);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm<DesignWriteInput>({
    resolver: zodResolver(designWriteSchema),
    defaultValues: defaults,
  });
  const selected = categories.filter((category) => selectedIds.includes(category.id));
  const visibleCategories = useMemo(() => {
    const query = categoryQuery.trim();
    if (!query) return categories;
    return categories.filter(
      (category) => category.name.includes(query) || category.slug.includes(query.toLowerCase()),
    );
  }, [categories, categoryQuery]);

  async function onSubmit(values: DesignWriteInput) {
    setSaving(true);
    setError("");
    setNotice("");
    const payload: DesignWriteInput = {
      ...values,
      tags: splitList(tagsText),
      colors: splitList(colorsText),
      styles: splitList(stylesText),
      gallery: splitList(galleryText).filter((path) => path.startsWith("/designed/")),
    };
    try {
      if (design) {
        await adminJson(`/api/admin/catalog/designs/${design.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("تغییرها ذخیره شد.");
        router.refresh();
      } else {
        const created = await adminJson<{ design: DesignRecord }>("/api/admin/catalog/designs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.push(`/admin/designs/${created.design.id}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    form.setValue("categoryIds", next, { shouldValidate: true });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-3xl border border-border bg-surface">
        {imagePath ? (
          <Image src={designedAssetUrl(imagePath)} alt={previewAlt || "طرح"} fill sizes="280px" className="object-contain p-4" />
        ) : (
          <p className="text-sm text-muted">تصویری انتخاب نشده</p>
        )}
      </div>

      <div className="grid gap-4">
        {notice ? <p className="rounded-2xl border border-cyan-500/40 px-4 py-3 text-sm">{notice}</p> : null}
        {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}

        <label className="text-sm">
          عنوان فارسی
          <input
            {...form.register("title", {
              onChange: (event) => {
                const value = event.target.value;
                setPreviewAlt((current) => current || value);
              },
            })}
            className={`${inputClass} mt-1`}
          />
          <FieldError message={form.formState.errors.title?.message} />
        </label>
        <label className="text-sm">
          عنوان انگلیسی
          <input {...form.register("titleEn")} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm">
          اسلاگ
          <input {...form.register("slug")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
          <FieldError message={form.formState.errors.slug?.message} />
        </label>
        <label className="text-sm">
          توضیح کوتاه
          <textarea {...form.register("shortDescription")} rows={2} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm">
          توضیح کامل
          <textarea {...form.register("description")} rows={5} className={`${inputClass} mt-1`} />
        </label>

        <fieldset className="rounded-3xl border border-border p-4">
          <legend className="px-2 text-sm">دسته‌ها</legend>
          <input
            value={categoryQuery}
            onChange={(event) => setCategoryQuery(event.target.value)}
            placeholder="جستجوی دسته"
            className={`${inputClass} mb-3`}
            aria-label="جستجوی دسته"
          />
          {selected.length > 0 ? (
            <ul className="mb-3 flex flex-wrap gap-2">
              {selected.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300"
                  >
                    {category.name} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-xs text-muted">دسته‌ای انتخاب نشده است.</p>
          )}
          <div className="max-h-48 space-y-2 overflow-auto">
            {visibleCategories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
                <span className="text-xs text-muted">{category.slug}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="text-sm">
          برچسب‌ها (با ویرگول)
          <input value={tagsText} onChange={(event) => setTagsText(event.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm">
          رنگ‌های غالب
          <input value={colorsText} onChange={(event) => setColorsText(event.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm">
          سبک بصری
          <input value={stylesText} onChange={(event) => setStylesText(event.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm">
          متن جایگزین تصویر
          <input
            {...form.register("alt", {
              onChange: (event) => setPreviewAlt(event.target.value),
            })}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="text-sm">
          مسیر تصویر اصلی
          <input
            {...form.register("imagePath", {
              onChange: (event) => setImagePath(event.target.value),
            })}
            dir="ltr"
            className={`${inputClass} mt-1 text-left`}
          />
          <FieldError message={form.formState.errors.imagePath?.message} />
        </label>
        <label className="text-sm">
          مسیر بندانگشتی
          <input {...form.register("thumbnailPath")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
        </label>
        <label className="text-sm">
          گالری (هر خط یک مسیر /designed/)
          <textarea value={galleryText} onChange={(event) => setGalleryText(event.target.value)} rows={3} dir="ltr" className={`${inputClass} mt-1 text-left`} />
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
          تصویر Open Graph
          <input {...form.register("ogImage")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
        </label>
        <label className="text-sm">
          اسلاگ قالب ادیتور
          <input {...form.register("templateSlug")} dir="ltr" className={`${inputClass} mt-1 text-left`} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            وضعیت
            <select {...form.register("status")} className={`${inputClass} mt-1`}>
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
              <option value="archived">بایگانی</option>
            </select>
          </label>
          <label className="text-sm">
            ترتیب
            <input type="number" {...form.register("sortOrder", { valueAsNumber: true })} className={`${inputClass} mt-1`} />
          </label>
          <label className="mt-7 flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("featured")} />
            ویژه
          </label>
        </div>

        <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-300">{message}</span>;
}
