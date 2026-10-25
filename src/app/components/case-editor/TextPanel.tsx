"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useEditorStore } from "@/lib/design/editor-store";
import {
  EDITOR_FONT_OPTIONS,
  loadEditorFonts,
  normalizeFontFamily,
} from "@/lib/design/editor-fonts";
import type { DesignLayer, TextLayer } from "@/lib/design/types";
import FontPickerSheet from "@/app/components/case-editor/FontPickerSheet";

const COLOR_OPTIONS = [
  "#ffffff",
  "#06b6d4",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#ef4444",
  "#000000",
];

function selectTextLayer(state: {
  selectedLayerId: string | null;
  document: { layers: DesignLayer[] };
}): TextLayer | undefined {
  if (!state.selectedLayerId) return undefined;
  const layer = state.document.layers.find((l) => l.id === state.selectedLayerId);
  return layer?.type === "text" ? layer : undefined;
}

export default function TextPanel({ compact = false }: { compact?: boolean }) {
  const textLayer = useEditorStore(selectTextLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const commitHistory = useEditorStore((s) => s.commitHistory);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const meta = useEditorStore((s) => s.meta);
  const canvasW = meta?.canvasWidth ?? 280;
  const canvasH = meta?.canvasHeight ?? 560;
  const [fontOpen, setFontOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focusNextText = useRef(false);

  const displayFont = textLayer
    ? normalizeFontFamily(textLayer.fontFamily)
    : undefined;
  const fontLabel =
    EDITOR_FONT_OPTIONS.find((font) => font.family === displayFont)?.label ?? "فونت";

  useEffect(() => {
    if (!focusNextText.current || !textLayer) return;
    focusNextText.current = false;
    textareaRef.current?.focus();
  }, [textLayer]);

  const commitSlider = useCallback(() => {
    commitHistory();
  }, [commitHistory]);

  const liveUpdate = useCallback(
    (id: string, patch: Partial<TextLayer>) => {
      updateLayer(id, patch, { recordHistory: false });
    },
    [updateLayer],
  );

  async function handleFontChange(family: string) {
    if (!textLayer) return;
    await loadEditorFonts([family]);
    updateLayer(textLayer.id, { fontFamily: family });
  }

  const showExtras = !compact || showMore;

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      <button
        type="button"
        onClick={() => {
          focusNextText.current = true;
          addTextLayer();
        }}
        className={`min-h-11 w-full rounded-xl bg-cyan-500 text-sm font-bold text-black transition hover:bg-cyan-400 ${
          compact ? "py-2.5" : "py-2.5"
        }`}
      >
        افزودن متن
      </button>

      {textLayer && displayFont ? (
        <div
          className={`rounded-xl border border-border bg-card/60 ${
            compact ? "space-y-2 p-3" : "space-y-3 p-4"
          }`}
        >
          <label className="block space-y-1">
            <span className="text-xs text-muted">متن</span>
            <textarea
              ref={textareaRef}
              value={textLayer.text}
              onChange={(e) => liveUpdate(textLayer.id, { text: e.target.value })}
              onBlur={commitSlider}
              rows={compact ? 2 : 3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground"
            />
          </label>

          <div className="space-y-1">
            <span className="text-xs text-muted">فونت</span>
            <button
              type="button"
              onClick={() => setFontOpen(true)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-right"
            >
              <span className="block text-[10px] text-muted">{fontLabel}</span>
              <span
                dir="auto"
                className="mt-0.5 block truncate text-lg leading-8 text-foreground"
                style={{ fontFamily: `"${displayFont}", sans-serif` }}
              >
                {textLayer.text.trim() || "متن شما"}
              </span>
            </button>
          </div>

          <label className="block space-y-1">
            <span className="text-xs text-muted">اندازه: {textLayer.fontSize}px</span>
            <input
              type="range"
              min={12}
              max={72}
              value={textLayer.fontSize}
              onChange={(e) =>
                liveUpdate(textLayer.id, { fontSize: Number(e.target.value) })
              }
              onPointerUp={commitSlider}
              onBlur={commitSlider}
              className="w-full accent-cyan-500"
            />
          </label>

          <div className="space-y-1">
            <span className="text-xs text-muted">رنگ متن</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateLayer(textLayer.id, { fill: color })}
                  className={`h-9 w-9 rounded-full border-2 lg:h-7 lg:w-7 ${
                    textLayer.fill === color ? "border-cyan-400" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={textLayer.fill}
                onChange={(e) => updateLayer(textLayer.id, { fill: e.target.value })}
                className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent lg:h-7 lg:w-7"
                title="رنگ دلخواه"
              />
            </div>
          </div>

          {showExtras ? (
            <>
              <div className="space-y-1">
                <span className="text-xs text-muted">تراز</span>
                <div className="flex gap-1">
                  {(
                    [
                      { value: "right" as const, icon: AlignRight },
                      { value: "center" as const, icon: AlignCenter },
                      { value: "left" as const, icon: AlignLeft },
                    ] as const
                  ).map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateLayer(textLayer.id, { align: value })}
                      className={`flex min-h-11 flex-1 items-center justify-center rounded-lg border py-2 ${
                        textLayer.align === value
                          ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                          : "border-border text-muted"
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">رنگ پس‌زمینه</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateLayer(textLayer.id, {
                        backgroundFill: textLayer.backgroundFill ? null : "#000000",
                      })
                    }
                    className={`rounded-md px-2 py-0.5 text-[10px] transition ${
                      textLayer.backgroundFill
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {textLayer.backgroundFill ? "فعال" : "بدون پس‌زمینه"}
                  </button>
                </div>
                {textLayer.backgroundFill ? (
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={`bg-${color}`}
                        type="button"
                        onClick={() => updateLayer(textLayer.id, { backgroundFill: color })}
                        className={`h-9 w-9 rounded-full border-2 lg:h-7 lg:w-7 ${
                          textLayer.backgroundFill === color
                            ? "border-cyan-400"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={textLayer.backgroundFill}
                      onChange={(e) =>
                        updateLayer(textLayer.id, { backgroundFill: e.target.value })
                      }
                      className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent lg:h-7 lg:w-7"
                      title="رنگ پس‌زمینه دلخواه"
                    />
                  </div>
                ) : null}
              </div>

              {textLayer.backgroundFill ? (
                <label className="block space-y-1">
                  <span className="text-xs text-muted">
                    انحنای گوشه: {textLayer.cornerRadius ?? 0}px
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    value={textLayer.cornerRadius ?? 0}
                    onChange={(e) =>
                      liveUpdate(textLayer.id, { cornerRadius: Number(e.target.value) })
                    }
                    onPointerUp={commitSlider}
                    onBlur={commitSlider}
                    className="w-full accent-cyan-500"
                  />
                </label>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="text-xs text-muted">X</span>
                  <input
                    type="number"
                    min={0}
                    max={canvasW}
                    value={Math.round(textLayer.x)}
                    onChange={(e) =>
                      liveUpdate(textLayer.id, { x: Number(e.target.value) })
                    }
                    onBlur={commitSlider}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs text-muted">Y</span>
                  <input
                    type="number"
                    min={0}
                    max={canvasH}
                    value={Math.round(textLayer.y)}
                    onChange={(e) =>
                      liveUpdate(textLayer.id, { y: Number(e.target.value) })
                    }
                    onBlur={commitSlider}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                  />
                </label>
              </div>
            </>
          ) : null}

          {compact ? (
            <button
              type="button"
              onClick={() => setShowMore((open) => !open)}
              className="min-h-11 w-full rounded-lg border border-border text-xs text-muted"
            >
              {showMore ? "کمتر" : "بیشتر"}
            </button>
          ) : null}
        </div>
      ) : (
        <p className="text-center text-xs text-muted">
          یک متن را انتخاب کنید یا متن جدید اضافه کنید
        </p>
      )}

      {fontOpen && textLayer && displayFont ? (
        <FontPickerSheet
          text={textLayer.text}
          selectedFamily={displayFont}
          onSelect={(family) => void handleFontChange(family)}
          onClose={() => setFontOpen(false)}
        />
      ) : null}
    </div>
  );
}
