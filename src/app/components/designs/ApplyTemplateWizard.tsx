"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, Search, X } from "lucide-react";

import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import SuggestedPhoneCard, { useSuggestedPhone } from "@/app/components/case-wizard/SuggestedPhoneCard";
import { usePreferredBrandLoader } from "@/app/context/PreferredBrandLoaderContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import { designedAssetUrl } from "@/lib/designed-assets";
import {
  buildCustomDesignPath,
  getBrandBySlug,
  getCaseTotalPrice,
  getCaseTypeBySlug,
  getModelsByBrand,
  PHONE_BRANDS,
  SELECTABLE_CASE_TYPE_SLUG,
} from "@/lib/cases/brands.static";
import { rememberSelectedPhone } from "@/lib/cases/device-phone";
import { searchPhoneModels } from "@/lib/cases/model-search";
import type { PhoneModel } from "@/lib/cases/types";
import { designPublicTitle } from "@/lib/seo/design-copy";
import type { CaseTemplate } from "@/lib/design/types";
import { lockPageScroll } from "@/lib/scroll-lock";
import { formatToman } from "@/lib/shop/format";
import { cn } from "@/lib/utils";

export type TemplatePurchaseIntent = "premade" | "custom";

type Step = "brand" | "model";

const STEPS: { id: Step; label: string }[] = [
  { id: "brand", label: "برند" },
  { id: "model", label: "مدل" },
];

type Props = {
  template: CaseTemplate;
  open: boolean;
  onClose: () => void;
  initialBrandSlug?: string;
  initialModelSlug?: string;
  /** When omitted, the user chooses premade or custom after picking a phone. */
  intent?: TemplatePurchaseIntent;
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
  intent,
}: Props) {
  const router = useRouter();
  const suggested = useSuggestedPhone();
  const { addCatalogCase } = useShopCart();
  const { setPreferredBrandSlug } = usePreferredBrandLoader();
  const [brandSlug, setBrandSlug] = useState(initialBrandSlug ?? "");
  const [modelSlug, setModelSlug] = useState(initialModelSlug ?? "");
  const [modelQuery, setModelQuery] = useState("");
  const autoStartedRef = useRef(false);

  const initialStep: Step = initialBrandSlug ? "model" : "brand";
  const [step, setStep] = useState<Step>(initialStep);
  const caseType = getCaseTypeBySlug(SELECTABLE_CASE_TYPE_SLUG);
  const premadePrice = caseType ? getCaseTotalPrice(caseType, false) : null;
  const customPrice = caseType ? getCaseTotalPrice(caseType, true) : null;

  const finish = useCallback(
    (nextIntent: TemplatePurchaseIntent, nextModelSlug: string, nextBrandSlug: string) => {
      if (!nextBrandSlug || !nextModelSlug) return;
      rememberSelectedPhone({ brandSlug: nextBrandSlug, modelSlug: nextModelSlug });
      setPreferredBrandSlug(nextBrandSlug);

      if (nextIntent === "premade") {
        if (!caseType || premadePrice == null) return;
        addCatalogCase({
          templateSlug: template.slug,
          title: designPublicTitle(template),
          previewUrl: template.thumbnail,
          unitPrice: premadePrice,
          brandSlug: nextBrandSlug,
          modelSlug: nextModelSlug,
          caseTypeSlug: SELECTABLE_CASE_TYPE_SLUG,
        });
        onClose();
        return;
      }

      const path = `${buildCustomDesignPath(nextBrandSlug, nextModelSlug)}?template=${encodeURIComponent(template.slug)}`;
      router.push(path);
      onClose();
    },
    [
      addCatalogCase,
      caseType,
      onClose,
      premadePrice,
      router,
      setPreferredBrandSlug,
      template,
    ],
  );

  useEffect(() => {
    if (!open) {
      autoStartedRef.current = false;
      return;
    }
    setBrandSlug(initialBrandSlug ?? "");
    setModelSlug(initialModelSlug ?? "");
    setModelQuery("");
    setStep(initialStep);
  }, [open, initialBrandSlug, initialModelSlug, initialStep]);

  useEffect(() => {
    if (!open || !intent || !initialBrandSlug || !initialModelSlug || autoStartedRef.current) return;
    autoStartedRef.current = true;
    finish(intent, initialModelSlug, initialBrandSlug);
  }, [open, intent, initialBrandSlug, initialModelSlug, finish]);

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
    return lockPageScroll();
  }, [open]);

  const brand = getBrandBySlug(brandSlug);
  const models = useMemo(
    () => (brandSlug ? getModelsByBrand(brandSlug) : []),
    [brandSlug],
  );

  const displayedModels = useMemo((): PhoneModel[] => {
    const trimmed = modelQuery.trim();
    const list =
      trimmed.length < 2 || !brandSlug
        ? models
        : searchPhoneModels(trimmed, { brandSlug, limit: 50 }).map((r) => r.model);
    if (!suggested || suggested.brandSlug !== brandSlug) return list;
    const index = list.findIndex((item) => item.slug === suggested.modelSlug);
    if (index <= 0) return list;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    return next;
  }, [modelQuery, brandSlug, models, suggested]);

  if (!open) return null;

  function handleClose() {
    onClose();
  }

  function handleContinue(nextModelSlug = modelSlug, nextBrandSlug = brandSlug) {
    if (!intent) {
      setBrandSlug(nextBrandSlug);
      setModelSlug(nextModelSlug);
      setStep("model");
      return;
    }
    finish(intent, nextModelSlug, nextBrandSlug);
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
              <Image
                src={designedAssetUrl(template.thumbnail)}
                alt=""
                width={36}
                height={72}
                sizes="72px"
                className="h-[72px] w-auto object-contain"
              />
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
                {intent === "premade"
                  ? "مدل گوشی را انتخاب کنید تا همین طرح به سبد خرید اضافه شود."
                  : intent === "custom"
                    ? "مدل گوشی را انتخاب کنید تا طراحی اختصاصی در ادیتور شروع شود."
                    : "مدل گوشی را انتخاب کنید، سپس خرید طرح آماده یا طراحی اختصاصی را مشخص کنید."}
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

        <div className="shrink-0 px-4 pt-4 empty:hidden sm:px-5">
          <SuggestedPhoneCard
            onPick={(pick) => {
              setBrandSlug(pick.brandSlug);
              handleContinue(pick.modelSlug, pick.brandSlug);
            }}
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
                        if (intent) {
                          finish(intent, item.slug, brandSlug);
                          return;
                        }
                        setModelSlug(item.slug);
                      }}
                      className={cn(
                        "group rounded-2xl border bg-card/60 p-3 text-right transition hover:border-cyan-500/50 hover:bg-card sm:p-4",
                        !intent && modelSlug === item.slug
                          ? "border-cyan-500/60 ring-1 ring-cyan-500/30"
                          : "border-border",
                      )}
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
                        {suggested?.brandSlug === brandSlug && suggested.modelSlug === item.slug ? (
                          <span className="mt-1 inline-flex rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                            پیشنهادی
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!intent && brandSlug && modelSlug ? (
          <div className="shrink-0 space-y-2 border-t border-border p-4 sm:p-5">
            <button
              type="button"
              onClick={() => finish("premade", modelSlug, brandSlug)}
              className="flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3 text-sm font-bold text-black transition hover:bg-cyan-400"
            >
              خرید طرح پیش‌ساخته
              {premadePrice != null ? ` · ${formatToman(premadePrice)}` : ""}
            </button>
            <button
              type="button"
              onClick={() => finish("custom", modelSlug, brandSlug)}
              className="flex w-full items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-500/10 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              طراحی اختصاصی
              {customPrice != null ? ` · ${formatToman(customPrice)}` : ""}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
