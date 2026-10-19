"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import AdminSelect from "@/app/components/admin/AdminSelect";
import { adminJson } from "@/app/components/admin/AdminShell";
import CategoryMultiSelect from "@/app/components/admin/CategoryMultiSelect";
import {
  autoFlagsForDesign,
  emptyDesignAutoFlags,
  resolveDesignAutos,
  type DesignAutoFlags,
  type DesignAutoKey,
  type DesignAutoSource,
} from "@/lib/catalog/design-autofill";
import { designedAssetUrl } from "@/lib/designed-assets";
import {
  designWriteSchema,
  type AttributeGroupRecord,
  type AttributeValueRecord,
  type CategoryRecord,
  type CollectionRecord,
  type DesignRecord,
  type DesignWriteInput,
} from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

const autoKeys: DesignAutoKey[] = [
  "slug",
  "titleEn",
  "description",
  "shortDescription",
  "seoTitle",
  "seoDescription",
  "alt",
  "ogImage",
  "thumbnailPath",
  "templateSlug",
];

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
    attributeValueIds: [],
    collectionIds: [],
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
    attributeValueIds: design.attributeValueIds,
    collectionIds: design.collectionIds,
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

function sourceFromDesign(design: DesignRecord): DesignAutoSource {
  return {
    title: design.title,
    titleEn: design.titleEn,
    slug: design.slug,
    templateSlug: design.templateSlug,
    imagePath: design.imagePath,
    description: design.description,
    shortDescription: design.shortDescription,
    seoTitle: design.seoTitle,
    seoDescription: design.seoDescription,
    alt: design.alt,
    ogImage: design.ogImage,
    thumbnailPath: design.thumbnailPath,
    tags: design.tags,
  };
}

type Props = {
  design?: DesignRecord;
  categories: CategoryRecord[];
  groups: AttributeGroupRecord[];
  values: AttributeValueRecord[];
  collections: CollectionRecord[];
};

export default function DesignEditorForm({ design, categories, groups, values, collections }: Props) {
  const router = useRouter();
  const defaults = design ? fromDesign(design) : emptyDesign();
  const [tagsText, setTagsText] = useState(defaults.tags.join("، "));
  const [colorsText, setColorsText] = useState(defaults.colors.join("، "));
  const [stylesText, setStylesText] = useState(defaults.styles.join("، "));
  const [galleryText, setGalleryText] = useState(defaults.gallery.join("\n"));
  const [selectedIds, setSelectedIds] = useState<string[]>(defaults.categoryIds);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(defaults.attributeValueIds ?? []);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(defaults.collectionIds ?? []);
  const [custom, setCustom] = useState<DesignAutoFlags>(() =>
    design
      ? autoFlagsForDesign(
          sourceFromDesign(design),
          categories.find((category) => category.id === design.categoryIds[0])?.name,
        )
      : emptyDesignAutoFlags(),
  );
  const [editing, setEditing] = useState<Partial<Record<DesignAutoKey, boolean>>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm<DesignWriteInput>({
    resolver: zodResolver(designWriteSchema),
    defaultValues: defaults,
  });
  const title = form.watch("title");
  const titleEn = form.watch("titleEn");
  const slug = form.watch("slug");
  const templateSlug = form.watch("templateSlug");
  const description = form.watch("description");
  const shortDescription = form.watch("shortDescription");
  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");
  const alt = form.watch("alt");
  const ogImage = form.watch("ogImage");
  const thumbnailPath = form.watch("thumbnailPath");
  const imagePath = form.watch("imagePath");

  const tags = useMemo(() => splitList(tagsText), [tagsText]);
  const categoryName = useMemo(() => {
    const id = selectedIds[0];
    return id ? categories.find((category) => category.id === id)?.name : undefined;
  }, [categories, selectedIds]);

  const resolved = useMemo(
    () =>
      resolveDesignAutos(
        {
          title,
          titleEn,
          slug,
          templateSlug,
          imagePath,
          description,
          shortDescription,
          seoTitle,
          seoDescription,
          alt,
          ogImage,
          thumbnailPath,
          categoryName,
          tags,
        },
        custom,
      ),
    [
      alt,
      categoryName,
      custom,
      description,
      imagePath,
      ogImage,
      seoDescription,
      seoTitle,
      shortDescription,
      slug,
      tags,
      templateSlug,
      thumbnailPath,
      title,
      titleEn,
    ],
  );

  useEffect(() => {
    for (const key of autoKeys) {
      if (custom[key]) continue;
      if (form.getValues(key) !== resolved[key]) {
        form.setValue(key, resolved[key]);
      }
    }
  }, [custom, form, resolved]);

  function unlock(field: DesignAutoKey) {
    form.setValue(field, resolved[field]);
    setCustom((current) => ({ ...current, [field]: true }));
    setEditing((current) => ({ ...current, [field]: true }));
  }

  function resetAuto(field: DesignAutoKey) {
    setEditing((current) => ({ ...current, [field]: false }));
    setCustom((current) => ({ ...current, [field]: false }));
  }

  async function onSubmit(values: DesignWriteInput) {
    setSaving(true);
    setError("");
    const generated = resolveDesignAutos(
      {
        ...values,
        categoryName,
        tags: splitList(tagsText),
      },
      custom,
    );
    const payload: DesignWriteInput = {
      ...values,
      ...generated,
      categoryIds: selectedIds,
      attributeValueIds: selectedAttributeIds,
      collectionIds: selectedCollectionIds,
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
      } else {
        await adminJson("/api/admin/catalog/designs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/designs");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  function toggleId(current: string[], id: string, setCurrent: (ids: string[]) => void) {
    setCurrent(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  const sortedGroups = [...groups].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-8"
    >
      <aside className="sticky top-20 z-20 w-full self-start overflow-hidden rounded-3xl border border-border bg-[#050816]/95 backdrop-blur">
        <div className="relative flex h-40 items-center justify-center overflow-hidden lg:h-80 lg:min-h-80 lg:bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)] lg:bg-card/40">
          {imagePath ? (
            <Image
              src={designedAssetUrl(imagePath)}
              alt={resolved.alt || "طرح"}
              fill
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-contain p-3 lg:p-6"
            />
          ) : (
            <p className="text-sm text-muted">تصویری انتخاب نشده</p>
          )}
        </div>
        <p className="truncate border-t border-border px-4 py-3 text-sm font-semibold">
          {title.trim() || "بدون عنوان"}
        </p>
      </aside>

      <div className="grid min-w-0 gap-6">
        <Section title="مشخصات">
          <label className="text-sm">
            عنوان فارسی
            <input {...form.register("title")} className={`${inputClass} mt-1`} />
            <FieldError message={form.formState.errors.title?.message} />
          </label>
          <AutoField
            label="توضیح طرح"
            value={resolved.description}
            custom={custom.description}
            editing={Boolean(editing.description)}
            onEdit={() => unlock("description")}
            onReset={() => resetAuto("description")}
            error={form.formState.errors.description?.message}
          >
            <textarea {...form.register("description")} rows={5} className={inputClass} />
          </AutoField>
        </Section>

        <Section title="دسته‌بندی">
          <CategoryMultiSelect
            categories={categories}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />

          <div>
            <p className="mb-2 text-sm font-semibold">ویژگی‌ها</p>
            {sortedGroups.length === 0 ? <p className="text-sm text-muted">ویژگی‌ای ثبت نشده است.</p> : null}
            <div className="grid gap-4">
              {sortedGroups.map((group) => {
                const groupValues = values
                  .filter((value) => value.groupId === group.id)
                  .sort((a, b) => a.sortOrder - b.sortOrder);
                return (
                  <div key={group.id}>
                    <p className="mb-2 text-sm font-semibold">{group.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {groupValues.map((value) =>
                        group.slug === "colors" ? (
                          <ColorChip
                            key={value.id}
                            name={value.name}
                            selected={selectedAttributeIds.includes(value.id)}
                            onClick={() => toggleId(selectedAttributeIds, value.id, setSelectedAttributeIds)}
                          />
                        ) : (
                          <ChoiceChip
                            key={value.id}
                            selected={selectedAttributeIds.includes(value.id)}
                            onClick={() => toggleId(selectedAttributeIds, value.id, setSelectedAttributeIds)}
                          >
                            {value.name}
                          </ChoiceChip>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">کالکشن‌ها</p>
            {collections.filter((collection) => collection.status === "active").length === 0 ? (
              <p className="text-sm text-muted">کالکشنی ثبت نشده است.</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {collections.filter((collection) => collection.status === "active").map((collection) => (
                <ChoiceChip
                  key={collection.id}
                  selected={selectedCollectionIds.includes(collection.id)}
                  onClick={() => toggleId(selectedCollectionIds, collection.id, setSelectedCollectionIds)}
                >
                  {collection.name}
                </ChoiceChip>
              ))}
            </div>
          </div>
        </Section>

        <Section title="انتشار">
          <div className="grid gap-4 sm:grid-cols-3">
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
                      { value: "draft", label: "پیش‌نویس" },
                      { value: "published", label: "منتشر شده" },
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
            <label className="mt-7 flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("featured")} className="h-5 w-5" />
              ویژه
            </label>
          </div>
        </Section>

        <details className="rounded-3xl border border-border bg-surface/40">
          <summary className="cursor-pointer list-none px-4 py-4 text-sm font-bold text-cyan-300 md:px-5 [&::-webkit-details-marker]:hidden">
            جزئیات خودکار
          </summary>
          <div className="grid gap-4 px-4 pb-5 md:px-5">
            <p className="text-xs leading-6 text-muted">
              اسلاگ، توضیح کوتاه، سئو و مسیرهای تصویر از عنوان و تصویر اصلی ساخته می‌شوند. فقط اگر لازم است ویرایش کنید.
            </p>
            <AutoField
              label="اسلاگ"
              value={resolved.slug}
              custom={custom.slug}
              preserved={Boolean(design && custom.slug && !editing.slug && slug === design.slug)}
              editing={Boolean(editing.slug)}
              onEdit={() => unlock("slug")}
              onReset={() => resetAuto("slug")}
              ltr
              error={form.formState.errors.slug?.message}
            >
              <input {...form.register("slug")} dir="ltr" className={`${inputClass} text-left`} />
            </AutoField>
            <AutoField
              label="عنوان انگلیسی"
              value={resolved.titleEn}
              custom={custom.titleEn}
              editing={Boolean(editing.titleEn)}
              onEdit={() => unlock("titleEn")}
              onReset={() => resetAuto("titleEn")}
              ltr
            >
              <input {...form.register("titleEn")} dir="ltr" className={`${inputClass} text-left`} />
            </AutoField>
            <AutoField
              label="توضیح کوتاه"
              value={resolved.shortDescription}
              custom={custom.shortDescription}
              editing={Boolean(editing.shortDescription)}
              onEdit={() => unlock("shortDescription")}
              onReset={() => resetAuto("shortDescription")}
              error={form.formState.errors.shortDescription?.message}
            >
              <textarea {...form.register("shortDescription")} rows={2} className={inputClass} />
            </AutoField>
            <AutoField
              label="عنوان سئو"
              value={resolved.seoTitle}
              custom={custom.seoTitle}
              editing={Boolean(editing.seoTitle)}
              onEdit={() => unlock("seoTitle")}
              onReset={() => resetAuto("seoTitle")}
              error={form.formState.errors.seoTitle?.message}
            >
              <input {...form.register("seoTitle")} className={inputClass} />
            </AutoField>
            <AutoField
              label="توضیحات متا"
              value={resolved.seoDescription}
              custom={custom.seoDescription}
              editing={Boolean(editing.seoDescription)}
              onEdit={() => unlock("seoDescription")}
              onReset={() => resetAuto("seoDescription")}
              error={form.formState.errors.seoDescription?.message}
            >
              <textarea {...form.register("seoDescription")} rows={3} className={inputClass} />
            </AutoField>
            <AutoField
              label="متن جایگزین تصویر"
              value={resolved.alt}
              custom={custom.alt}
              editing={Boolean(editing.alt)}
              onEdit={() => unlock("alt")}
              onReset={() => resetAuto("alt")}
            >
              <input {...form.register("alt")} className={inputClass} />
            </AutoField>
            <AutoField
              label="تصویر Open Graph"
              value={resolved.ogImage}
              custom={custom.ogImage}
              editing={Boolean(editing.ogImage)}
              onEdit={() => unlock("ogImage")}
              onReset={() => resetAuto("ogImage")}
              ltr
              error={form.formState.errors.ogImage?.message}
            >
              <input {...form.register("ogImage")} dir="ltr" className={`${inputClass} text-left`} />
            </AutoField>
            <AutoField
              label="مسیر بندانگشتی"
              value={resolved.thumbnailPath}
              custom={custom.thumbnailPath}
              editing={Boolean(editing.thumbnailPath)}
              onEdit={() => unlock("thumbnailPath")}
              onReset={() => resetAuto("thumbnailPath")}
              ltr
              error={form.formState.errors.thumbnailPath?.message}
            >
              <input {...form.register("thumbnailPath")} dir="ltr" className={`${inputClass} text-left`} />
            </AutoField>
            <AutoField
              label="اسلاگ قالب ادیتور"
              value={resolved.templateSlug}
              custom={custom.templateSlug}
              editing={Boolean(editing.templateSlug)}
              onEdit={() => unlock("templateSlug")}
              onReset={() => resetAuto("templateSlug")}
              ltr
            >
              <input {...form.register("templateSlug")} dir="ltr" className={`${inputClass} text-left`} />
            </AutoField>
            <label className="text-sm">
              مسیر تصویر اصلی
              <input
                {...form.register("imagePath")}
                dir="ltr"
                className={`${inputClass} mt-1 text-left`}
              />
              <FieldError message={form.formState.errors.imagePath?.message} />
            </label>
            <label className="text-sm">
              گالری (هر خط یک مسیر /designed/)
              <textarea value={galleryText} onChange={(event) => setGalleryText(event.target.value)} rows={3} dir="ltr" className={`${inputClass} mt-1 text-left`} />
            </label>
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
          </div>
        </details>

        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-border bg-[#050816]/95 p-3 backdrop-blur">
          {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
          <button type="submit" disabled={saving} className="min-h-11 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-3xl border border-border bg-surface/40 p-4 md:p-5">
      <h2 className="text-sm font-bold text-cyan-300">{title}</h2>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="mt-1 block text-xs text-red-300">{message}</span>;
}

const COLOR_SWATCH: Record<string, string> = {
  مشکی: "#171717",
  سفید: "#f8fafc",
  قرمز: "#ef4444",
  صورتی: "#f472b6",
  آبی: "#38bdf8",
  سبز: "#22c55e",
  زرد: "#facc15",
  نارنجی: "#fb923c",
  بنفش: "#a855f7",
  "قهوه‌ای": "#92400e",
  خاکستری: "#9ca3af",
  طلایی: "#eab308",
  "نقره‌ای": "#d4d4d8",
};

function ColorChip({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const background =
    name === "چندرنگ"
      ? "conic-gradient(#ef4444, #facc15, #22c55e, #38bdf8, #a855f7, #ef4444)"
      : COLOR_SWATCH[name] ?? "#64748b";
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={name}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm ${
        selected ? "border-cyan-400 bg-cyan-500/15 text-cyan-100" : "border-border hover:border-cyan-500/50"
      }`}
    >
      <span
        className="h-6 w-6 shrink-0 rounded-full border border-white/40"
        style={{ background }}
        aria-hidden
      />
      {name}
    </button>
  );
}

function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-2 text-sm ${
        selected ? "border-cyan-400 bg-cyan-500/15 text-cyan-100" : "border-border hover:border-cyan-500/50"
      }`}
    >
      {children}
    </button>
  );
}

function AutoField({
  label,
  value,
  custom,
  preserved = false,
  editing,
  onEdit,
  onReset,
  error,
  ltr,
  children,
}: {
  label: string;
  value: string;
  custom: boolean;
  preserved?: boolean;
  editing: boolean;
  onEdit: () => void;
  onReset: () => void;
  error?: string;
  ltr?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span>{label}</span>
        <span className="flex flex-wrap items-center gap-2">
          {preserved ? null : custom ? (
            <button type="button" onClick={onReset} className="min-h-11 rounded-full border border-border px-4 text-xs text-cyan-300">
              بازگشت به خودکار
            </button>
          ) : (
            <span className="text-xs text-muted">خودکار</span>
          )}
          {editing ? null : (
            <button type="button" onClick={onEdit} className="min-h-11 rounded-full border border-border px-4 text-xs">
              ویرایش
            </button>
          )}
        </span>
      </div>
      {editing ? (
        children
      ) : (
        <p
          dir={ltr ? "ltr" : undefined}
          className={`whitespace-pre-wrap rounded-2xl border border-border bg-black/20 px-4 py-3 leading-7 ${ltr ? "text-left" : ""} ${
            value.trim() ? "" : "text-muted"
          }`}
        >
          {value.trim() || "با وارد کردن عنوان پر می‌شود"}
        </p>
      )}
      <FieldError message={error} />
    </div>
  );
}
