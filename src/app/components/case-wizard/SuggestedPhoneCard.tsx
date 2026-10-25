"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PhoneBackSvg } from "@/app/components/case-wizard/PhoneBackSvg";
import { buildCustomDesignPath, getBrandBySlug, getModelBySlug } from "@/lib/cases/brands.static";
import {
  isPhoneVisitor,
  matchPhoneFromDevice,
  readRememberedPhone,
  rememberSelectedPhone,
  resolveSuggestedPhone,
  type PhonePick,
} from "@/lib/cases/device-phone";
import { cn } from "@/lib/utils";

type Suggestion = PhonePick & { name: string; nameEn: string; brandName: string };

type Props = {
  className?: string;
  onPick?: (pick: PhonePick) => void;
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

function loadSuggestion(modelName: string | null): PhonePick | null {
  return resolveSuggestedPhone({
    isPhone: isPhoneVisitor(navigator.userAgent, window.innerWidth),
    remembered: readRememberedPhone(),
    detected: matchPhoneFromDevice({
      userAgent: navigator.userAgent,
      modelName,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio || 1,
    }),
  });
}

function toSuggestion(pick: PhonePick | null): Suggestion | null {
  if (!pick) return null;
  const model = getModelBySlug(pick.brandSlug, pick.modelSlug);
  const brand = getBrandBySlug(pick.brandSlug);
  if (!model || !brand) return null;
  return {
    ...pick,
    name: model.name,
    nameEn: model.nameEn,
    brandName: brand.name,
  };
}

export function useSuggestedPhone(): Suggestion | null {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const modelName = await readDeviceModelName();
      if (cancelled) return;
      setSuggestion(toSuggestion(loadSuggestion(modelName)));
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

  return suggestion;
}

export default function SuggestedPhoneCard({ className, onPick }: Props) {
  const suggestion = useSuggestedPhone();
  if (!suggestion) return null;

  const model = getModelBySlug(suggestion.brandSlug, suggestion.modelSlug);
  if (!model) return null;

  const pick = { brandSlug: suggestion.brandSlug, modelSlug: suggestion.modelSlug };
  const body = (
    <>
      <div className="flex h-16 w-10 shrink-0 items-center justify-center">
        <PhoneBackSvg model={model} className="h-full w-auto" />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-xs font-semibold text-cyan-400">گوشی پیشنهادی</p>
        <p className="truncate text-sm font-bold text-foreground">{suggestion.name}</p>
        <p className="truncate text-xs text-muted">
          {suggestion.brandName} · {suggestion.nameEn}
        </p>
      </div>
    </>
  );
  const cardClass = cn(
    "flex w-full items-center gap-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-right transition hover:border-cyan-400",
    className,
  );

  if (onPick) {
    return (
      <button
        type="button"
        onClick={() => {
          rememberSelectedPhone(pick);
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
      href={buildCustomDesignPath(suggestion.brandSlug, suggestion.modelSlug)}
      onClick={() => rememberSelectedPhone(pick)}
      className={cardClass}
    >
      {body}
    </Link>
  );
}
