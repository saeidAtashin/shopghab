"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { DesignRoutePendingLabel } from "@/app/components/ui/DesignRouteLoading";
import { modelPickerName } from "@/lib/cases/model-label";
import type { PhoneModel } from "@/lib/cases/types";
import { designRouteLoaderProps } from "@/lib/route-navigation";
import { cn } from "@/lib/utils";
import { PhoneBackSvg } from "./PhoneBackSvg";

type Props = {
  model: PhoneModel;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  pending?: boolean;
  routeLoader?: boolean;
  namePrefix?: string;
  badge?: string;
  className?: string;
};

function modelPlateParts(name: string): { lead: string; rest: string } {
  const trimmed = name.trim();
  const splitAt = trimmed.indexOf(" ");
  if (splitAt <= 0) return { lead: trimmed, rest: "" };
  return {
    lead: trimmed.slice(0, splitAt),
    rest: trimmed.slice(splitAt + 1).trim(),
  };
}

export function PickerPhone({ model, className }: { model: PhoneModel; className?: string }) {
  return (
    <PhoneBackSvg
      model={model}
      className={className}
      bodyFill="#f4f4f7"
      logoFill="rgba(17,17,17,0.08)"
    />
  );
}

export default function ModelPickerCard({
  model,
  href,
  onClick,
  selected = false,
  pending = false,
  routeLoader = false,
  namePrefix = "",
  badge,
  className,
}: Props) {
  const names = modelPickerName(model);
  const plate = modelPlateParts(names.name);
  const caption = namePrefix.trim();
  const shell = cn(
    "group relative flex w-full flex-col items-center bg-transparent text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
    pending && "pointer-events-none",
    className,
  );

  const body = (
    <span className="relative flex aspect-[3/4] w-full items-center justify-center">
      {pending ? (
        <span className="absolute inset-0 z-10 flex items-center justify-center p-3">
          <DesignRoutePendingLabel />
        </span>
      ) : null}
      <span className="relative inline-flex h-full max-w-full items-center justify-center transition group-hover:scale-[1.03]">
        <PickerPhone model={model} className="h-full w-auto max-w-full drop-shadow-md" />
        <span className="pointer-events-none absolute top-1/2 left-1/2 flex w-[70%] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          {caption ? (
            <span className="mb-1 text-[10px] font-bold tracking-wide text-zinc-500">{caption}</span>
          ) : null}
          <span className="w-full rounded-2xl border border-white/80 bg-white/85 px-2 py-1.5 text-center shadow-[0_6px_16px_rgba(17,17,17,0.12)] backdrop-blur-md">
            <span className="block text-balance text-lg font-black leading-none tracking-tight text-zinc-950 sm:text-xl">
              {plate.lead}
            </span>
            {plate.rest ? (
              <span className="mt-1 block text-balance text-[11px] font-semibold leading-tight text-zinc-600 sm:text-xs">
                {plate.rest}
              </span>
            ) : null}
          </span>
        </span>
      </span>
      {selected ? (
        <span className="absolute start-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-black">
          <Check size={14} aria-hidden />
        </span>
      ) : null}
      {badge ? (
        <span className="absolute inset-x-2 top-2 text-center text-[10px] font-bold text-cyan-700">{badge}</span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-busy={pending}
        onClick={onClick}
        className={shell}
        {...(routeLoader ? designRouteLoaderProps : {})}
      >
        {body}
      </Link>
    );
  }

  return (
    <button type="button" aria-pressed={selected} aria-busy={pending} onClick={onClick} className={shell}>
      {body}
    </button>
  );
}

export function PickerPhoneWell({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center justify-center", className)}>{children}</span>;
}
