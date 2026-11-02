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
      <PickerPhone
        model={model}
        className="h-full w-auto max-w-full drop-shadow-md transition group-hover:scale-[1.03]"
      />
      <span className="pointer-events-none absolute inset-x-[16%] top-1/2 -translate-y-1/2 text-center text-xl font-black leading-tight text-zinc-950 sm:text-2xl">
        {namePrefix}
        {names.name}
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
