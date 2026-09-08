"use client";

import { useCallback } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useEditorStore } from "@/lib/design/editor-store";
import { EDITOR_FONT_OPTIONS, normalizeFontFamily } from "@/lib/design/editor-fonts";
import type { DesignLayer, TextLayer } from "@/lib/design/types";

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

export default function TextPanel() {
  const textLayer = useEditorStore(selectTextLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const commitHistory = useEditorStore((s) => s.commitHistory);
  const addTextLayer = useEditorStore((s) => s.addTextLayer);
  const meta = useEditorStore((s) => s.meta);
  const canvasW = meta?.canvasWidth ?? 280;
  const canvasH = meta?.canvasHeight ?? 560;

  const displayFont = textLayer
    ? normalizeFontFamily(textLayer.fontFamily)
    : undefined;

  const commitSlider = useCallback(() => {
    commitHistory();
  }, [commitHistory]);

  const liveUpdate = useCallback(
    (id: string, patch: Partial<TextLayer>) => {
      updateLayer(id, patch, { recordHistory: false });
    },
    [updateLayer],
  );

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => addTextLayer()}
        className="w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-400"
      >
        افزودن متن
      </button>

      {textLayer ? (
        <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
          <label className="block space-y-1">
            <span className="text-xs text-muted">متن</span>
            <textarea
              value={textLayer.text}
              onChange={(e) => liveUpdate(textLayer.id, { text: e.target.value })}
              onBlur={commitSlider}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs text-muted">فونت</span>
            <select
              value={displayFont}
              onChange={(e) => updateLayer(textLayer.id, { fontFamily: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {EDITOR_FONT_OPTIONS.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

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
            <span className="text-xs text-muted">رنگ متن</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateLayer(textLayer.id, { fill: color })}
                  className={`h-9 w-9 max-lg:h-9 max-lg:w-9 lg:h-7 lg:w-7 rounded-full border-2 ${
                    textLayer.fill === color ? "border-cyan-400" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={textLayer.fill}
                onChange={(e) => updateLayer(textLayer.id, { fill: e.target.value })}
                className="h-9 w-9 max-lg:h-9 max-lg:w-9 lg:h-7 lg:w-7 cursor-pointer rounded border border-border bg-transparent"
                title="رنگ دلخواه"
              />
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
                    className={`h-9 w-9 max-lg:h-9 max-lg:w-9 lg:h-7 lg:w-7 rounded-full border-2 ${
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
                  className="h-9 w-9 max-lg:h-9 max-lg:w-9 lg:h-7 lg:w-7 cursor-pointer rounded border border-border bg-transparent"
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
        </div>
      ) : (
        <p className="text-center text-xs text-muted">
          یک متن را انتخاب کنید یا متن جدید اضافه کنید
        </p>
      )}
    </div>
  );
}
