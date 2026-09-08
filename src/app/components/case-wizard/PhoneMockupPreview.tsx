"use client";

import type { PhoneModel } from "@/lib/cases/types";
import { PhoneBackSvg } from "./PhoneBackSvg";

type Props = {
  model?: PhoneModel;
  caseColor?: string;
  caseMaterial?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function PhoneMockupPreview({
  model,
  caseColor = "#2a2a2e",
  caseMaterial = "matte",
  children,
  className = "",
}: Props) {
  const isClear = caseMaterial === "clear";
  const isGlass = caseMaterial === "glass";
  const bodyFill = isClear ? "rgba(26,26,34,0.7)" : caseColor;

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative mx-auto w-[200px] rounded-[2rem] border-[3px] p-2 shadow-2xl sm:w-[220px]"
        style={{
          borderColor: isClear ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
          backgroundColor: isClear ? "rgba(255,255,255,0.08)" : caseColor,
          backdropFilter: isClear ? "blur(4px)" : undefined,
          boxShadow: isGlass
            ? "0 0 30px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[1.5rem]"
          style={{ aspectRatio: model ? `${model.canvasWidth}/${model.canvasHeight}` : "1/2" }}
        >
          {model ? (
            <PhoneBackSvg model={model} className="h-full w-full" bodyFill={bodyFill} />
          ) : (
            <div
              className="flex h-full items-center justify-center text-xs text-muted"
              style={{
                background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)",
              }}
            >
              ناحیه طراحی
            </div>
          )}
          {children ? (
            <div className="absolute inset-0 flex items-center justify-center">{children}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
