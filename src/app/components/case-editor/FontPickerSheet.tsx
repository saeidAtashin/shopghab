"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  EDITOR_FONT_OPTIONS,
  loadEditorFonts,
  type EditorFontOption,
} from "@/lib/design/editor-fonts";
import { lockPageScroll } from "@/lib/scroll-lock";

type Props = {
  text: string;
  selectedFamily: string;
  onSelect: (family: string) => void;
  onClose: () => void;
};

function previewCopy(text: string): string {
  const trimmed = text.trim();
  return trimmed || "متن شما";
}

function FontPreviewRow({
  font,
  preview,
  selected,
  onSelect,
}: {
  font: EditorFontOption;
  preview: string;
  selected: boolean;
  onSelect: (family: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void loadEditorFonts([font.family]).then(() => setReady(true));
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [font.family]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(font.family)}
      className={`w-full rounded-xl border px-3 py-2 text-right transition ${
        selected
          ? "border-cyan-400 bg-cyan-500/15"
          : "border-border bg-card/70 hover:border-cyan-500/40"
      }`}
    >
      <span className="block text-[10px] text-muted">{font.label}</span>
      <span
        dir="auto"
        className="mt-1 block line-clamp-2 text-xl leading-8 text-foreground"
        style={ready ? { fontFamily: `"${font.family}", sans-serif` } : undefined}
      >
        {preview}
      </span>
    </button>
  );
}

export default function FontPickerSheet({
  text,
  selectedFamily,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const preview = previewCopy(text);

  useEffect(() => lockPageScroll(), []);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadEditorFonts([selectedFamily]);
  }, [selectedFamily]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const fonts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EDITOR_FONT_OPTIONS;
    return EDITOR_FONT_OPTIONS.filter(
      (font) =>
        font.label.toLowerCase().includes(q) || font.family.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 sm:items-center">
      <button
        type="button"
        aria-label="بستن انتخاب فونت"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="font-picker-title"
        className="relative flex h-[100dvh] w-full flex-col bg-background sm:h-[min(80dvh,720px)] sm:max-w-lg sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <h2 id="font-picker-title" className="text-sm font-bold text-foreground">
            انتخاب فونت
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ms-auto min-h-11 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-black"
          >
            تأیید
          </button>
        </div>
        <div className="border-b border-border px-3 py-3">
          <p
            dir="auto"
            className="line-clamp-3 min-h-16 text-2xl leading-9 text-foreground"
            style={{ fontFamily: `"${selectedFamily}", sans-serif` }}
          >
            {preview}
          </p>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی فونت…"
            dir="rtl"
            className="mt-3 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {fonts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">فونتی پیدا نشد</p>
          ) : (
            fonts.map((font) => (
              <div key={font.family} ref={font.family === selectedFamily ? selectedRef : undefined}>
                <FontPreviewRow
                  font={font}
                  preview={preview}
                  selected={font.family === selectedFamily}
                  onSelect={onSelect}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
