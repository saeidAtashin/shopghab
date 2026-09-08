"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { EditorTab } from "@/app/components/case-editor/EditorPageClient";
import { EDITOR_GUIDE_STEPS, type EditorGuideStep } from "@/app/components/case-editor/editor-guide-steps";

const SPOTLIGHT_PADDING = 8;

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onTabChange: (tab: EditorTab) => void;
  onEnsureMobileDockOpen: () => void;
  isMobileViewport: boolean;
};

function findGuideTarget(selector: string): Element | null {
  const nodes = document.querySelectorAll(`[data-editor-guide="${selector}"]`);
  if (nodes.length === 0) return null;

  let best: Element | null = null;
  let bestArea = 0;

  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const area = rect.width * rect.height;
    if (area > bestArea) {
      bestArea = area;
      best = node;
    }
  });

  return best;
}

function scrollGuideTargetIntoView(target: string, isMobileViewport: boolean): void {
  if (!isMobileViewport) return;

  const el = findGuideTarget(target);
  if (!el) return;

  if (target.startsWith("tab-")) {
    el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
    return;
  }

  el.scrollIntoView({ behavior: "instant", block: "center", inline: "nearest" });
}

function measureTarget(selector: string): SpotlightRect | null {
  const el = findGuideTarget(selector);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  };
}

function getTooltipStyle(
  rect: SpotlightRect | null,
  viewport: { width: number; height: number },
): React.CSSProperties {
  if (!rect) {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "min(22rem, calc(100vw - 2rem))",
    };
  }

  const cardMaxWidth = Math.min(352, viewport.width - 32);
  const cardEstimatedHeight = 180;
  const gap = 12;

  const spaceBelow = viewport.height - (rect.top + rect.height);
  const spaceAbove = rect.top;
  const placeBelow = spaceBelow >= cardEstimatedHeight || spaceBelow >= spaceAbove;

  let top = placeBelow ? rect.top + rect.height + gap : rect.top - cardEstimatedHeight - gap;
  top = Math.max(16, Math.min(top, viewport.height - cardEstimatedHeight - 16));

  let left = rect.left + rect.width / 2 - cardMaxWidth / 2;
  left = Math.max(16, Math.min(left, viewport.width - cardMaxWidth - 16));

  return {
    position: "fixed",
    top,
    left,
    width: cardMaxWidth,
  };
}

function getSpotlightMaskPadding(
  rect: SpotlightRect,
  viewport: { width: number; height: number },
) {
  return {
    top: rect.top,
    right: Math.max(0, viewport.width - rect.left - rect.width),
    bottom: Math.max(0, viewport.height - rect.top - rect.height),
    left: rect.left,
  };
}

const SPOTLIGHT_MASK_STYLE: React.CSSProperties = {
  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
};

function applyStepSideEffects(
  step: EditorGuideStep,
  onTabChange: (tab: EditorTab) => void,
  onEnsureMobileDockOpen: () => void,
  isMobileViewport: boolean,
) {
  if (step.kind === "spotlight" && step.tab) {
    onTabChange(step.tab);
    if (isMobileViewport) {
      onEnsureMobileDockOpen();
    }
  }
}

export default function EditorGuideOverlay({
  open,
  onClose,
  onComplete,
  onTabChange,
  onEnsureMobileDockOpen,
  isMobileViewport,
}: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const step = EDITOR_GUIDE_STEPS[stepIndex];
  const isLastStep = stepIndex >= EDITOR_GUIDE_STEPS.length - 1;
  const isModalStep = step?.kind === "modal";

  const updateMeasurements = useCallback(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });

    if (!step || step.kind === "modal") {
      setSpotlightRect(null);
      return;
    }

    const rect = measureTarget(step.target);
    setSpotlightRect(rect);
  }, [step]);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      setSpotlightRect(null);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;

    applyStepSideEffects(step, onTabChange, onEnsureMobileDockOpen, isMobileViewport);

    if (step.kind === "spotlight" && isMobileViewport) {
      scrollGuideTargetIntoView(step.target, true);
    }

    const raf = requestAnimationFrame(() => {
      updateMeasurements();
    });
    const retry150 = window.setTimeout(updateMeasurements, 150);
    const retry350 = window.setTimeout(updateMeasurements, 350);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(retry150);
      window.clearTimeout(retry350);
    };
  }, [open, step, stepIndex, onTabChange, onEnsureMobileDockOpen, isMobileViewport, updateMeasurements]);

  useEffect(() => {
    if (!open) return;

    const handleResize = () => updateMeasurements();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    const observer = new ResizeObserver(() => updateMeasurements());
    document.querySelectorAll("[data-editor-guide]").forEach((node) => {
      observer.observe(node);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
      observer.disconnect();
    };
  }, [open, stepIndex, updateMeasurements]);

  const handleSkip = useCallback(() => {
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
      onClose();
      return;
    }
    setStepIndex((i) => i + 1);
  }, [isLastStep, onComplete, onClose]);

  if (!open || !step) return null;

  const tooltipStyle = isModalStep
    ? {
        position: "fixed" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "min(22rem, calc(100vw - 2rem))",
      }
    : getTooltipStyle(spotlightRect, viewport);

  const spotlightMaskPadding =
    spotlightRect && viewport.width > 0
      ? getSpotlightMaskPadding(spotlightRect, viewport)
      : null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="editor-guide-title">
      {isModalStep ? (
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={handleSkip}
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0" onClick={handleSkip} aria-hidden />
      )}

      {!isModalStep && spotlightRect && spotlightMaskPadding ? (
        <>
          <motion.div
            key={`spotlight-mask-${stepIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 bg-black/45 backdrop-blur-sm"
            style={{
              ...SPOTLIGHT_MASK_STYLE,
              padding: `${spotlightMaskPadding.top}px ${spotlightMaskPadding.right}px ${spotlightMaskPadding.bottom}px ${spotlightMaskPadding.left}px`,
            }}
            aria-hidden
          />
          <motion.div
            key={`spotlight-ring-${stepIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed rounded-xl ring-2 ring-cyan-400/80 motion-safe:animate-pulse"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            aria-hidden
          />
        </>
      ) : !isModalStep ? (
        <div
          className="pointer-events-none absolute inset-0 bg-black/55 backdrop-blur-sm"
          aria-hidden
        />
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={tooltipStyle}
          className="z-[71] rounded-2xl border border-cyan-500/30 bg-card/95 p-4 shadow-xl backdrop-blur-sm sm:p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-medium text-cyan-400/90">
            {stepIndex + 1} / {EDITOR_GUIDE_STEPS.length}
          </p>
          <h2 id="editor-guide-title" className="mt-1 text-sm font-bold text-foreground">
            {step.title}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">{step.body}</p>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleNext}
              className="min-h-10 flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
            >
              {isLastStep ? "شروع طراحی" : "بعدی"}
            </button>
            {!isLastStep ? (
              <button
                type="button"
                onClick={handleSkip}
                className="min-h-10 rounded-xl border border-border px-3 py-2 text-xs text-muted transition hover:border-cyan-500/40 hover:text-foreground"
              >
                رد کردن
              </button>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
