"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, Store, X } from "lucide-react";

export type CheckoutPrompt = {
  title: string;
  previewUrl?: string;
};

type Props = {
  prompt: CheckoutPrompt;
  onClose: () => void;
};

export default function CheckoutPromptModal({ prompt, onClose }: Props) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
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
  const panelTransition = reduceMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, damping: 26, stiffness: 320 };

  return (
    <motion.div
      className="fixed inset-0 z-[280] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={backdropTransition}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-prompt-title"
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" aria-hidden />

      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl"
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 36, scale: 0.96 }
        }
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
        transition={panelTransition}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-l from-cyan-400 via-cyan-500 to-violet-500" />

        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-xs font-medium text-cyan-400">سبد خرید</p>
            <h2
              id="checkout-prompt-title"
              className="mt-1 text-lg font-black text-foreground"
            >
              به سبد خرید اضافه شد
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border p-2 text-muted transition hover:bg-background hover:text-foreground"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 px-5">
          <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
            {prompt.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prompt.previewUrl}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <ShoppingBag size={22} className="text-cyan-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">{prompt.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">
              برای نهایی کردن سفارش به صفحه پرداخت بروید، یا خرید را ادامه دهید.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 px-5 pb-6 sm:flex-row-reverse">
          <Link
            href="/checkout"
            onClick={onClose}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-400"
          >
            <ShoppingBag size={16} />
            ادامه و پرداخت
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:border-cyan-500/40"
          >
            <Store size={16} />
            ادامه خرید
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
