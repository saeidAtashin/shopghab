"use client";

import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import CategoryEditorForm from "@/app/components/admin/CategoryEditorForm";
import type { CategoryRecord } from "@/lib/catalog/schema";

export default function CategoryEditorScreen({ id }: { id?: string }) {
  const [category, setCategory] = useState<CategoryRecord | undefined>();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const body = await adminJson<{ categories: CategoryRecord[] }>("/api/admin/catalog/categories");
        if (!active) return;
        setCategories(body.categories);
        setCategory(id ? body.categories.find((item) => item.id === id) : undefined);
        if (id && !body.categories.some((item) => item.id === id)) {
          setError("دسته پیدا نشد");
        }
      } catch (reason) {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "بارگذاری انجام نشد");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="text-muted">در حال بارگذاری فرم...</p>;
  if (error) return <p className="text-red-300">{error}</p>;
  return <CategoryEditorForm category={category} categories={categories} />;
}
