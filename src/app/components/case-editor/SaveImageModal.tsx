"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Loader2, Save, Share2, X } from "lucide-react";
import type Konva from "konva";

import {
  dataUrlToFile,
  downloadDataUrl,
  exportStageToDataUrl,
  shareOrDownloadImage,
  type ExportImageFormat,
} from "@/lib/design/export";

type Props = {
  stage: Konva.Stage | null;
  brandSlug: string;
  modelSlug: string;
  loggedIn: boolean;
  savingAccount: boolean;
  onSaveToAccount: () => Promise<void> | void;
  onClose: () => void;
};

export default function SaveImageModal({
  stage,
  brandSlug,
  modelSlug,
  loggedIn,
  savingAccount,
  onSaveToAccount,
  onClose,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [format, setFormat] = useState<ExportImageFormat>("png");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!stage) return;
    let cancelled = false;
    void exportStageToDataUrl(stage, { format: "png", pixelRatio: 2 }).then(
      (url) => {
        if (!cancelled) setPreviewUrl(url);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [stage]);

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

  const filename = `case-${brandSlug}-${modelSlug}.${format}`;

  const exportChosen = useCallback(async () => {
    if (!stage) return null;
    const dataUrl = await exportStageToDataUrl(stage, {
      format,
      pixelRatio: 3,
    });
    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const file = dataUrlToFile(dataUrl, filename, mime);
    return { dataUrl, file };
  }, [filename, format, stage]);

  const handleDownload = useCallback(async () => {
    setBusy("download");
    setStatus(null);
    try {
      const result = await exportChosen();
      if (!result) return;
      downloadDataUrl(result.dataUrl, filename);
      setStatus("تصویر دانلود شد.");
    } catch {
      setStatus("دانلود ناموفق بود.");
    } finally {
      setBusy(null);
    }
  }, [exportChosen, filename]);

  const handleShare = useCallback(async () => {
    setBusy("share");
    setStatus(null);
    try {
      const result = await exportChosen();
      if (!result) return;
      const outcome = await shareOrDownloadImage(result.file, result.dataUrl);
      setStatus(
        outcome === "shared" ? "تصویر اشتراک‌گذاری شد." : "تصویر دانلود شد.",
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus(null);
        return;
      }
      setStatus("اشتراک‌گذاری ناموفق بود.");
    } finally {
      setBusy(null);
    }
  }, [exportChosen]);

  const handleAccountSave = useCallback(async () => {
    setStatus(null);
    try {
      await onSaveToAccount();
      setStatus("طراحی در حساب ذخیره شد.");
    } catch {
      setStatus("خطا در ذخیره طراحی.");
    }
  }, [onSaveToAccount]);

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
      aria-labelledby="save-image-title"
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" aria-hidden />

      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:rounded-3xl"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
        transition={panelTransition}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className="text-xs font-medium text-cyan-400">خروجی تصویر</p>
            <h2 id="save-image-title" className="mt-1 text-lg font-black text-foreground">
              ذخیره طراحی
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

        <div className="mt-4 flex justify-center px-5">
          <div className="flex h-48 w-28 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <Loader2 size={22} className="animate-spin text-cyan-400" />
            )}
          </div>
        </div>

        <div className="mt-4 px-5">
          <p className="mb-2 text-xs text-muted">فرمت فایل</p>
          <div className="grid grid-cols-2 gap-2">
            {(["png", "jpg"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormat(option)}
                className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                  format === option
                    ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                    : "border-border bg-background text-muted hover:border-cyan-500/30"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 px-5">
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={busy !== null || !stage}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {busy === "download" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            دانلود {format.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={busy !== null || !stage}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {busy === "share" ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            اشتراک‌گذاری
          </button>
          {loggedIn ? (
            <button
              type="button"
              onClick={() => void handleAccountSave()}
              disabled={savingAccount || busy !== null}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground transition hover:border-cyan-500/40 disabled:opacity-50"
            >
              {savingAccount ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              ذخیره در حساب
            </button>
          ) : (
            <p className="text-center text-xs text-muted">
              برای ذخیره در حساب کاربری ابتدا وارد شوید. دانلود و اشتراک نیازی به ورود ندارد.
            </p>
          )}
        </div>

        {status ? (
          <p className="mt-3 px-5 text-center text-xs text-cyan-300">{status}</p>
        ) : null}

        <div className="h-5 sm:h-5" />
      </motion.div>
    </motion.div>
  );
}
