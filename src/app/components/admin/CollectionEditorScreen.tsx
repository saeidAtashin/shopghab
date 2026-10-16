"use client";

import { useEffect, useState } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import CollectionEditorForm from "@/app/components/admin/CollectionEditorForm";
import type { CollectionRecord } from "@/lib/catalog/schema";

export default function CollectionEditorScreen({ id }: { id?: string }) {
  const [collection, setCollection] = useState<CollectionRecord | undefined>();
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    void adminJson<{ collection: CollectionRecord }>(`/api/admin/catalog/collections/${id}`)
      .then((body) => {
        if (active) setCollection(body.collection);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "بارگذاری انجام نشد");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="text-muted">در حال بارگذاری فرم...</p>;
  if (error) return <p className="text-red-300">{error}</p>;
  return <CollectionEditorForm collection={collection} />;
}
