"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Search, X } from "lucide-react";

import CaseTypePicker from "@/app/components/case-wizard/CaseTypePicker";
import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { usePreferredBrandLoader } from "@/app/context/PreferredBrandLoaderContext";
import DesignSamplePreview from "@/app/components/designs/DesignSamplePreview";
import {
  CASE_TYPES,
  getBrandBySlug,
  getCaseTypeBySlug,
  getModelBySlug,
  getModelsByBrand,
  PHONE_BRANDS,
} from "@/lib/cases/brands.static";
import { searchPhoneModels } from "@/lib/cases/model-search";
import type { PhoneModel } from "@/lib/cases/types";
import type { CaseTemplate } from "@/lib/design/types";
import { cn } from "@/lib/utils";

type Step = "brand" | "model" | "caseType";

const STEPS: { id: Step; label: string }[] = [
  { id: "brand", label: "برند" },
  { id: "model", label: "مدل" },
  { id: "caseType", label: "قاب" },
];

type Props = {
  template: CaseTemplate;
  open: boolean;
  onClose: () => void;
  initialBrandSlug?: string;
  initialModelSlug?: string;
};

function stepIndex(step: Step): number {
  return STEPS.findIndex((s) => s.id === step);
}

function StepIndicator({
  current,
  brandLocked,
  modelLocked,
  onStepClick,
}: {
  current: Step;
  brandLocked: boolean;
  modelLocked: boolean;
  onStepClick: (step: Step) => void;
}) {
  const currentIdx = stepIndex(current);

  function canNavigateTo(step: Step): boolean {
    const idx = stepIndex(step);
    if (idx >= currentIdx) return false;
    if (step === "brand" && brandLocked) return false;
    if (step === "model" && modelLocked) return false;
    return true;
  }

  return (
    <nav aria-label="مراحل انتخاب گوشی" className="flex items-center gap-1 px-5 py-3">
      {STEPS.map((item, idx) => {
        const done = idx < currentIdx;
        const active = item.id === current;
        const navigable = canNavigateTo(item.id);

        return (
          <div key={item.id} className="flex min-w-0 flex-1 items-center gap-1">
            {idx > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1",
                  done ? "bg-cyan-500/50" : "bg-border",
                )}
              />
            ) : null}
            <button
              type="button"
              disabled={!navigable}
              aria-current={active ? "step" : undefined}
              onClick={() => navigable && onStepClick(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition sm:px-3",
                active && "bg-cyan-500/15 text-cyan-400",
                done && !active && "text-cyan-400/80",
                !active && !done && "text-muted",
                navigable && "cursor-pointer hover:bg-surface",
                !navigable && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                  active && "border-cyan-500 bg-cyan-500 text-black",
                  done && !active && "border-cyan-500/50 bg-cyan-500/20 text-cyan-400",
                  !active && !done && "border-border bg-surface text-muted",
                )}
              >
                {done && !active ? <Check size={12} /> : idx + 1}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}

export default function ApplyTemplateWizard({
  template,
  open,
  onClose,
  initialBrandSlug,
  initialModelSlug,
}: Props) {
  const router = useRouter();
  const { setPreferredBrandSlug } = usePreferredBrandLoader();
  const [brandSlug, setBrandSlug] = useState(initialBrandSlug ?? "");
  const [modelSlug, setModelSlug] = useState(initialModelSlug ?? "");
  const [caseTypeSlug, setCaseTypeSlug] = useState(CASE_TYPES[0]?.slug ?? "matte");
  const [modelQuery, setModelQuery] = useState("");

  const initialStep: Step = initialModelSlug && initialBrandSlug
    ? "caseType"
    : initialBrandSlug
      ? "model"
      : "brand";
  const [step, setStep] = useState<Step>(initialStep);

  useEffect(() => {
    if (!open) return;
    setBrandSlug(initialBrandSlug ?? "");
    setModelSlug(initialModelSlug ?? "");
    setCaseTypeSlug(CASE_TYPES[0]?.slug ?? "matte");
    setModelQuery("");
    setStep(initialStep);
  }, [open, initialBrandSlug, initialModelSlug, initialStep]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const brand = getBrandBySlug(brandSlug);
  const model = brandSlug && modelSlug ? getModelBySlug(brandSlug, modelSlug) : undefined;
  const selectedCaseType = getCaseTypeBySlug(caseTypeSlug);
  const models = useMemo(
    () => (brandSlug ? getModelsByBrand(brandSlug) : []),
    [brandSlug],
  );

  const displayedModels = useMemo((): PhoneModel[] => {
    const trimmed = modelQuery.trim();
    if (trimmed.length < 2 || !brandSlug) return models;
    return searchPhoneModels(trimmed, { brandSlug, limit: 50 }).map((r) => r.model);
  }, [modelQuery, brandSlug, models]);

  if (!open) return null;

  function handleClose() {
    onClose();
  }

  function handleContinue() {
    if (!brandSlug || !modelSlug) return;
    router.push(`/design/${brandSlug}/${modelSlug}/${caseTypeSlug}?template=${template.slug}`);
    handleClose();
  }

  function handleStepClick(target: Step) {
    setStep(target);
    if (target === "brand") {
      setModelSlug("");
    }
  }

  const brandLocked = Boolean(initialBrandSlug);
  const modelLocked = Boolean(initialModelSlug);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-template-wizard-title"
        className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card pb-[env(safe-area-inset-bottom)] sm:rounded-2xl"
      >
        <div
          aria-hidden
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden"
        />

        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/50 p-1.5">
              <DesignSamplePreview template={template} maxHeight={72} />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="apply-template-wizard-title"
                className="text-base font-black text-foreground sm:text-lg"
              >
                انتخاب گوشی
              </h2>
              <p
                className="mt-0.5 line-clamp-2 text-xs text-muted sm:text-sm"
                title={template.title}
              >
                {template.title}
              </p>
              <p className="mt-1 hidden text-xs text-muted sm:block">
                طراحی روی قاب به‌صورت تمام‌صفحه اعمال می‌شود و سپس می‌توانید ویرایش کنید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shrink-0 border-b border-border">
          <StepIndicator
            current={step}
            brandLocked={brandLocked}
            modelLocked={modelLocked}
            onStepClick={handleStepClick}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {step === "brand" ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">برند گوشی را انتخاب کنید</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PHONE_BRANDS.map((item) => {
                  const selected = brandSlug === item.slug;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => {
                        setPreferredBrandSlug(item.slug);
                        setBrandSlug(item.slug);
                        setModelSlug("");
                        setModelQuery("");
                        setStep("model");
                      }}
                      className={cn(
                        "group flex min-h-[44px] flex-col items-center gap-3 rounded-2xl border bg-card/60 p-4 transition hover:border-cyan-500/50 hover:bg-card sm:p-6",
                        selected
                          ? "border-cyan-500/60 ring-1 ring-cyan-500/30"
                          : "border-border",
                      )}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface p-3 transition group-hover:bg-cyan-500/10">
                        <Image
                          src={item.logo}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted">{item.nameEn}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === "model" && brandSlug ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  مدل {brand?.name ?? "گوشی"} را انتخاب کنید
                </p>
                {!brandLocked ? (
                  <button
                    type="button"
                    onClick={() => setStep("brand")}
                    className="shrink-0 text-xs text-cyan-400 hover:underline"
                  >
                    تغییر برند
                  </button>
                ) : null}
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                  placeholder="جستجوی مدل…"
                  aria-label="جستجوی مدل گوشی"
                  className="w-full rounded-xl border border-border bg-card/60 py-3 pl-4 pr-10 text-sm text-foreground placeholder:text-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>

              {displayedModels.length === 0 ? (
                <p className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted">
                  مدلی یافت نشد.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {displayedModels.map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => {
                        setModelSlug(item.slug);
                        setStep("caseType");
                      }}
                      className="group rounded-2xl border border-border bg-card/60 p-3 text-right transition hover:border-cyan-500/50 hover:bg-card sm:p-4"
                    >
                      <div className="relative mx-auto flex h-28 w-16 items-center justify-center sm:h-32 sm:w-20">
                        <PhoneBackSvg
                          model={item}
                          className="h-full w-auto max-w-full drop-shadow-lg transition group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-bold text-foreground sm:text-sm">{item.name}</p>
                        <p className="text-[10px] text-muted sm:text-xs">{item.nameEn}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {step === "caseType" && brandSlug && modelSlug ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">نوع قاب را انتخاب کنید</p>
                {!modelLocked ? (
                  <button
                    type="button"
                    onClick={() => setStep("model")}
                    className="shrink-0 text-xs text-cyan-400 hover:underline"
                  >
                    تغییر مدل
                  </button>
                ) : null}
              </div>
              <CaseTypePicker
                brandSlug={brandSlug}
                modelSlug={modelSlug}
                caseTypes={CASE_TYPES}
                selectedSlug={caseTypeSlug}
                onSelect={setCaseTypeSlug}
                showDesignLink={false}
                variant="compact"
              />
            </div>
          ) : null}
        </div>

        {step === "caseType" && brandSlug && modelSlug ? (
          <div className="shrink-0 border-t border-border bg-card/95 p-4 backdrop-blur-sm sm:p-5">
            <p className="mb-3 truncate text-xs text-muted">
              {model?.name}
              {selectedCaseType ? ` · ${selectedCaseType.name}` : null}
            </p>
            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black transition hover:bg-cyan-400"
            >
              اعمال طراحی و ورود به ادیتور
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
