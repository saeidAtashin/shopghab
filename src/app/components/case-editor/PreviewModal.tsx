"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEditorStore } from "@/lib/design/editor-store";
import { createRafResizeHandler } from "@/lib/design/throttle-raf";
import CaseCanvas from "./CaseCanvas";

type Props = {
  caseColor: string;
  caseMaterial: string;
  onClose: () => void;
};

function getPreviewDisplaySize() {
  if (typeof window === "undefined") {
    return { width: 320, height: 640 };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    width: Math.min(340, vw * 0.82),
    height: Math.min(680, vh * 0.72),
  };
}

export default function PreviewModal({ caseColor, caseMaterial, onClose }: Props) {
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode);
  const reduceMotion = useReducedMotion();
  const [displaySize, setDisplaySize] = useState(getPreviewDisplaySize);

  const isClear = caseMaterial === "clear";
  const isGlass = caseMaterial === "glass";

  useEffect(() => {
    setPreviewMode(true);
    return () => setPreviewMode(false);
  }, [setPreviewMode]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const { handler, cancel } = createRafResizeHandler(() =>
      setDisplaySize(getPreviewDisplaySize()),
    );
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      cancel();
    };
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const backdropTransition = { duration: reduceMotion ? 0.01 : 0.2 };
  const caseTransition = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, damping: 24, stiffness: 280 };

  return (
    <motion.div
      key="preview-backdrop"
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={backdropTransition}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="پیش‌نمایش قاب"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" aria-hidden />

      <motion.div
        className="relative flex w-full max-w-md flex-col items-center"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 20 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
        transition={caseTransition}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex w-full items-center justify-between px-1">
          <p className="text-sm font-bold text-white">پیش‌نمایش قاب</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div
            className={`pointer-events-none absolute inset-0 -z-10 scale-110 rounded-[2.5rem] blur-3xl ${
              reduceMotion ? "opacity-55" : "animate-preview-glow"
            }`}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${caseColor}99 0%, rgba(6,182,212,0.35) 45%, transparent 72%)`,
            }}
            aria-hidden
          />

          <div
            className="relative"
            style={{
              boxShadow: isGlass
                ? "0 0 48px rgba(6,182,212,0.35), 0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
                : isClear
                  ? "0 0 40px rgba(255,255,255,0.12), 0 24px 80px rgba(0,0,0,0.55)"
                  : `0 0 48px ${caseColor}55, 0 24px 80px rgba(0,0,0,0.55)`,
            }}
          >
            <CaseCanvas
              caseColor={caseColor}
              caseMaterial={caseMaterial}
              readOnly
              displayMaxWidth={displaySize.width}
              displayMaxHeight={displaySize.height}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
