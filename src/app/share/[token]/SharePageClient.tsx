"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import {
  getBrandBySlug,
  getCaseTypeBySlug,
  getModelBySlug,
} from "@/lib/cases";
import { useEditorStore } from "@/lib/design/editor-store";
import type { SavedDesign } from "@/lib/design/types";
import { formatToman } from "@/lib/shop/format";
import { getCaseTotalPrice } from "@/lib/cases/brands.static";

const CaseCanvas = dynamic(() => import("@/app/components/case-editor/CaseCanvas"), {
  ssr: false,
});

type Props = { design: SavedDesign };

export default function SharePageClient({ design }: Props) {
  const { loadDocument, setPreviewMode } = useEditorStore();
  const brand = getBrandBySlug(design.brandSlug);
  const model = getModelBySlug(design.brandSlug, design.modelSlug);
  const caseType = getCaseTypeBySlug(design.caseTypeSlug);

  useEffect(() => {
    if (!model || !caseType) return;
    loadDocument(design, {
      brandSlug: design.brandSlug,
      modelSlug: design.modelSlug,
      caseTypeSlug: design.caseTypeSlug,
      caseType,
      model,
      canvasWidth: model.canvasWidth,
      canvasHeight: model.canvasHeight,
    });
    setPreviewMode(true);
    return () => setPreviewMode(false);
  }, [design, model, caseType, loadDocument, setPreviewMode]);

  if (!brand || !model || !caseType) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-black text-foreground">{design.name}</h1>
        {design.description ? (
          <p className="mt-2 text-muted">{design.description}</p>
        ) : null}
        <p className="mt-1 text-sm text-muted">
          {brand.name} — {model.name} — {caseType.name}
        </p>
        <div className="mt-8 flex justify-center">
          <CaseCanvas
            caseColor={caseType.color}
            caseMaterial={caseType.material}
            readOnly
          />
        </div>
        <p className="mt-6 font-bold text-cyan-400">
          {formatToman(getCaseTotalPrice(caseType, true))}
        </p>
        <Link
          href={`/design/${design.brandSlug}/${design.modelSlug}/${design.caseTypeSlug}?share=${design.shareToken}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-8 py-3 text-sm font-bold text-black"
        >
          <ShoppingCart size={18} />
          طراحی مشابه
        </Link>
      </div>
    </div>
  );
}
