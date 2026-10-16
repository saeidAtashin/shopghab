"use client";

import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import DesignEditorForm from "@/app/components/admin/DesignEditorForm";
import type { CategoryRecord, DesignRecord } from "@/lib/catalog/schema";

export default function DesignEditorScreen({ id }: { id?: string }) {
  const [design, setDesign] = useState<DesignRecord | undefined>();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const categoryBody = await adminJson<{ categories: CategoryRecord[] }>(
          "/api/admin/catalog/categories",
        );
        let loaded: DesignRecord | undefined;
        if (id) {
          const designBody = await adminJson<{ design: DesignRecord }>(
            `/api/admin/catalog/designs/${id}`,
          );
          loaded = designBody.design;
        }
        if (!active) return;
        setCategories(categoryBody.categories);
        setDesign(loaded);
      } catch (reason) {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "بارگذاری فرم انجام نشد");
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
  return <DesignEditorForm design={design} categories={categories} />;
}
