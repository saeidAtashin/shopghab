"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { DesignRoutePendingLabel } from "@/app/components/ui/DesignRouteLoading";
import { buildCustomDesignPath, getBrandBySlug, getModelBySlug } from "@/lib/cases/brands.static";
import {
  isPhoneVisitor,
  matchPhoneFromDevice,
  readRememberedPhones,
  rememberSelectedPhone,
  resolvePhoneSuggestions,
  type PhonePick,
  type PhoneSuggestionKind,
} from "@/lib/cases/device-phone";
import { designRouteLoaderProps } from "@/lib/route-navigation";
import { cn } from "@/lib/utils";

type Suggestion = PhonePick & {
  kind: PhoneSuggestionKind;
  name: string;
  nameEn: string;
  brandName: string;
};

type Props = {
  className?: string;
  onPick?: (pick: PhonePick) => void;
  navigatesOnPick?: boolean;
};

const GROUP_LABEL: Record<PhoneSuggestionKind, string> = {
  current: "گوشی فعلی",
  previous: "انتخاب‌های قبلی",
};

async function readDeviceModelName(): Promise<string | null> {
  const uaData = (
    navigator as Navigator & {
      userAgentData?: {
        getHighEntropyValues?: (hints: string[]) => Promise<{ model?: string }>;
      };
    }
  ).userAgentData;
  if (!uaData?.getHighEntropyValues) return null;
  try {
    const values = await uaData.getHighEntropyValues(["model"]);
    const model = values.model?.trim();
    return model || null;
  } catch {
    return null;
  }
}

function loadSuggestions(modelName: string | null): Suggestion[] {
  const suggestions = resolvePhoneSuggestions({
    isPhone: isPhoneVisitor(navigator.userAgent, window.innerWidth),
    remembered: readRememberedPhones(),
    detected: matchPhoneFromDevice({
      userAgent: navigator.userAgent,
      modelName,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
    }),
  });

  return suggestions.flatMap((suggestion) => {
    const model = getModelBySlug(suggestion.brandSlug, suggestion.modelSlug);
    const brand = getBrandBySlug(suggestion.brandSlug);
    if (!model || !brand) return [];
    return [
      {
        ...suggestion,
        name: model.name,
        nameEn: model.nameEn,
        brandName: brand.name,
      },
    ];
  });
}

export function usePhoneSuggestions(): Suggestion[] {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const modelName = await readDeviceModelName();
      if (cancelled) return;
      setSuggestions(loadSuggestions(modelName));
    };

    void update();
    const onResize = () => {
      void update();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return suggestions;
}

function suggestionKey(suggestion: PhonePick): string {
  return `${suggestion.brandSlug}:${suggestion.modelSlug}`;
}

export default function SuggestedPhoneCard({ className, onPick, navigatesOnPick = false }: Props) {
  const suggestions = usePhoneSuggestions();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  if (suggestions.length === 0) return null;

  const groups: PhoneSuggestionKind[] = ["current", "previous"];

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((kind) => {
        const items = suggestions.filter((suggestion) => suggestion.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind} aria-label={GROUP_LABEL[kind]} className="space-y-2">
            <h2 className="text-sm font-bold text-foreground">{GROUP_LABEL[kind]}</h2>
            {items.map((suggestion) => {
              const model = getModelBySlug(suggestion.brandSlug, suggestion.modelSlug);
              if (!model) return null;
              const pick = { brandSlug: suggestion.brandSlug, modelSlug: suggestion.modelSlug };
              const key = suggestionKey(pick);
              const pending = pendingKey === key;
              const body = (
                <>
                  <div className="relative h-14 w-8 shrink-0 overflow-hidden">
                    <PhoneBackSvg model={model} className="absolute inset-0 h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-xs font-semibold text-cyan-400">
                      {kind === "current" ? "گوشی فعلی" : "انتخاب قبلی"}
                    </p>
                    <p className="truncate text-sm font-bold text-foreground">{suggestion.name}</p>
                    {pending ? (
                      <DesignRoutePendingLabel className="mt-1" />
                    ) : (
                      <p className="truncate text-xs text-muted">
                        {suggestion.brandName} · {suggestion.nameEn}
                      </p>
                    )}
                  </div>
                </>
              );
              const cardClass = cn(
                "flex w-full max-w-full min-w-0 items-center gap-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-right transition hover:border-cyan-400",
                pending && "pointer-events-none border-cyan-400",
              );

              if (onPick) {
                return (
                  <button
                    key={key}
                    type="button"
                    aria-busy={pending}
                    onClick={() => {
                      rememberSelectedPhone(pick);
                      if (navigatesOnPick) setPendingKey(key);
                      onPick(pick);
                    }}
                    className={cardClass}
                  >
                    {body}
                  </button>
                );
              }

              return (
                <Link
                  key={key}
                  href={buildCustomDesignPath(suggestion.brandSlug, suggestion.modelSlug)}
                  {...designRouteLoaderProps}
                  aria-busy={pending}
                  onClick={() => {
                    rememberSelectedPhone(pick);
                    setPendingKey(key);
                  }}
                  className={cardClass}
                >
                  {body}
                </Link>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
