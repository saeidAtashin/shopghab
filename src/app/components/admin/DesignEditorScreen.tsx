"use client";

import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import DesignEditorForm from "@/app/components/admin/DesignEditorForm";
import DesignAdminTools from "@/app/components/designs/DesignAdminTools";
import type {
  AttributeGroupRecord,
  AttributeValueRecord,
  CategoryRecord,
  CollectionRecord,
  DesignRecord,
} from "@/lib/catalog/schema";

export default function DesignEditorScreen({ id }: { id?: string }) {
  const [design, setDesign] = useState<DesignRecord | undefined>();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [groups, setGroups] = useState<AttributeGroupRecord[]>([]);
  const [values, setValues] = useState<AttributeValueRecord[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [categoryBody, attributeBody, collectionBody] = await Promise.all([
          adminJson<{ categories: CategoryRecord[] }>("/api/admin/catalog/categories"),
          adminJson<{ groups: AttributeGroupRecord[]; values: AttributeValueRecord[] }>(
            "/api/admin/catalog/attributes",
          ),
          adminJson<{ collections: CollectionRecord[] }>("/api/admin/catalog/collections"),
        ]);
        let loaded: DesignRecord | undefined;
        if (id) {
          const designBody = await adminJson<{ design: DesignRecord }>(
            `/api/admin/catalog/designs/${id}`,
          );
          loaded = designBody.design;
        }
        if (!active) return;
        setCategories(categoryBody.categories);
        setGroups(attributeBody.groups);
        setValues(attributeBody.values);
        setCollections(collectionBody.collections);
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
  return (
    <div className="grid gap-8">
      <DesignEditorForm
        design={design}
        categories={categories}
        groups={groups}
        values={values}
        collections={collections}
      />
      {design ? <DesignAdminTools designId={design.id} /> : null}
    </div>
  );
}
