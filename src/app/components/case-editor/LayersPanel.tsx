"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Sticker,
  Trash2,
  Type,
  X,
} from "lucide-react";

import { useEditorStore } from "@/lib/design/editor-store";
import {
  BLEND_MODE_OPTIONS,
  EFFECT_TYPE_OPTIONS,
  effectSupportsIntensity,
  getEffectTypeLabel,
  getImageLayerEffects,
} from "@/lib/design/image-layer-filters";
import {
  generateEffectId,
  isLayerVisible,
  type DesignLayer,
  type ImageBlendMode,
  type ImageEffectType,
  type ImageLayer,
  type ImageLayerEffect,
} from "@/lib/design/types";

const ImageToolsPanel = dynamic(
  () => import("@/app/components/case-editor/ImageToolsPanel"),
  {
    ssr: false,
    loading: () => (
      <div className="py-4 text-center text-xs text-muted">در حال بارگذاری ابزار تصویر…</div>
    ),
  },
);

function layerLabel(layer: DesignLayer): string {
  if (layer.name) return layer.name;
  if (layer.type === "text") {
    const preview = layer.text.length > 20 ? `${layer.text.slice(0, 20)}…` : layer.text;
    return preview || "متن";
  }
  if (layer.isSticker) return "استیکر";
  return "تصویر";
}

function LayerTypeIcon({ layer }: { layer: DesignLayer }) {
  if (layer.type === "text") return <Type size={14} className="shrink-0" />;
  if (layer.isSticker) return <Sticker size={14} className="shrink-0" />;
  return <ImageIcon size={14} className="shrink-0" />;
}

function removeEffectFromLayer(
  layer: ImageLayer,
  effectId: string,
): ImageLayerEffect[] {
  return getImageLayerEffects(layer).filter((effect) => effect.id !== effectId);
}

export default function LayersPanel() {
  const layers = useEditorStore((s) => s.document.layers);
  const selectedLayerId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const setLayerVisible = useEditorStore((s) => s.setLayerVisible);
  const restoreLayer = useEditorStore((s) => s.restoreLayer);
  const moveLayer = useEditorStore((s) => s.moveLayer);
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const pendingEffectPreview = useEditorStore((s) => s.pendingEffectPreview);

  const layersReversed = [...layers].reverse();
  const selected = selectedLayerId
    ? layers.find((l) => l.id === selectedLayerId)
    : null;

  if (layers.length === 0) {
    return (
      <p className="text-center text-xs text-muted">
        هنوز لایه‌ای اضافه نشده. از تب متن، استیکر یا تصویر استفاده کنید.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">بالا = جلوتر روی قاب</p>
      <ul className="space-y-1">
        {layersReversed.map((layer) => {
          const visible = isLayerVisible(layer);
          const isSelected = selectedLayerId === layer.id;
          const imageEffects =
            layer.type === "image" ? getImageLayerEffects(layer) : [];
          const hasPreviewChip =
            layer.type === "image" &&
            pendingEffectPreview?.layerId === layer.id &&
            !imageEffects.some((e) => e.type === pendingEffectPreview.type);

          return (
            <li
              key={layer.id}
              className={`rounded-lg border px-2 py-2 text-xs transition ${
                isSelected
                  ? "border-cyan-500/50 bg-cyan-500/10 text-foreground"
                  : visible
                    ? "border-border bg-card/60 text-muted hover:border-cyan-500/30"
                    : "border-border/50 bg-card/30 text-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    visible ? selectLayer(layer.id) : restoreLayer(layer.id)
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-right"
                >
                  <LayerTypeIcon layer={layer} />
                  <span className="truncate">{layerLabel(layer)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayerVisible(layer.id, !visible)}
                  className="shrink-0 p-1 text-muted hover:text-foreground"
                  title={visible ? "مخفی کردن" : "نمایش"}
                >
                  {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                {!visible ? (
                  <button
                    type="button"
                    onClick={() => restoreLayer(layer.id)}
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-cyan-400"
                  >
                    نمایش
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLayerVisible(layer.id, false)}
                    className="shrink-0 p-1 text-red-400/70 hover:text-red-400"
                    title="حذف از قاب"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {(imageEffects.length > 0 || hasPreviewChip) ? (
                <div className="mt-1.5 flex flex-wrap gap-1 pe-1">
                  {imageEffects.map((effect) => (
                    <span
                      key={effect.id}
                      className="inline-flex max-w-full items-center gap-0.5 rounded-md border border-cyan-500/25 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-200/90"
                    >
                      <span className="truncate">
                        {getEffectTypeLabel(effect.type)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, {
                            effects: removeEffectFromLayer(
                              layer as ImageLayer,
                              effect.id,
                            ),
                          });
                        }}
                        className="shrink-0 rounded p-0.5 text-cyan-300/80 hover:bg-cyan-500/20 hover:text-foreground"
                        title="حذف افکت"
                        aria-label={`حذف ${getEffectTypeLabel(effect.type)}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {hasPreviewChip && pendingEffectPreview ? (
                    <span className="inline-flex max-w-full items-center gap-0.5 rounded-md border border-dashed border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-200/90">
                      <span className="truncate">
                        پیش‌نمایش: {getEffectTypeLabel(pendingEffectPreview.type)}
                      </span>
                    </span>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div className="space-y-2 rounded-xl border border-border bg-card/60 p-3">
          <p className="text-xs font-semibold text-muted">لایه انتخاب‌شده</p>
          <div className="flex flex-wrap gap-2">
            <ActionButton
              onClick={() => moveLayer(selected.id, "up")}
              icon={<ArrowUp size={14} />}
              label="جلو"
            />
            <ActionButton
              onClick={() => moveLayer(selected.id, "down")}
              icon={<ArrowDown size={14} />}
              label="عقب"
            />
            <ActionButton
              onClick={() => duplicateLayer(selected.id)}
              icon={<Copy size={14} />}
              label="کپی"
            />
            {isLayerVisible(selected) ? (
              <ActionButton
                onClick={() => setLayerVisible(selected.id, false)}
                icon={<Trash2 size={14} />}
                label="حذف"
                danger
              />
            ) : (
              <ActionButton
                onClick={() => restoreLayer(selected.id)}
                icon={<Eye size={14} />}
                label="بازیابی"
              />
            )}
          </div>
          {selected.type === "image" ? (
            <>
              <ImageLayerSettings
                layer={selected}
                onUpdate={(patch) => updateLayer(selected.id, patch)}
              />
              <ImageToolsPanel layer={selected} />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ImageLayerSettings({
  layer,
  onUpdate,
}: {
  layer: ImageLayer;
  onUpdate: (patch: Partial<ImageLayer>) => void;
}) {
  const setPendingEffectPreview = useEditorStore((s) => s.setPendingEffectPreview);
  const [pendingEffectType, setPendingEffectType] = useState<ImageEffectType>(
    "blur",
  );
  const [pendingIntensity, setPendingIntensity] = useState(50);
  const [previewEnabled, setPreviewEnabled] = useState(false);

  const opacityPercent = Math.round((layer.opacity ?? 1) * 100);
  const activeEffects = getImageLayerEffects(layer);
  const appliedTypes = new Set(activeEffects.map((effect) => effect.type));
  const appliedTypeKey = activeEffects
    .map((effect) => effect.type)
    .sort()
    .join(",");
  const availableEffectTypes = EFFECT_TYPE_OPTIONS.filter(
    (option) => !appliedTypes.has(option.value),
  );

  useEffect(() => {
    return () => setPendingEffectPreview(null);
  }, [setPendingEffectPreview]);

  useEffect(() => {
    if (
      availableEffectTypes.length > 0 &&
      !availableEffectTypes.some((option) => option.value === pendingEffectType)
    ) {
      setPendingEffectType(availableEffectTypes[0].value);
    }
  }, [availableEffectTypes, pendingEffectType]);

  useEffect(() => {
    if (availableEffectTypes.length === 0 || !previewEnabled) {
      setPendingEffectPreview(null);
      return;
    }
    const typeAlreadyApplied = appliedTypeKey
      .split(",")
      .filter(Boolean)
      .includes(pendingEffectType);
    if (typeAlreadyApplied) {
      setPendingEffectPreview(null);
      return;
    }
    setPendingEffectPreview({
      layerId: layer.id,
      type: pendingEffectType,
      intensity: pendingIntensity,
    });
  }, [
    appliedTypeKey,
    availableEffectTypes.length,
    layer.id,
    pendingEffectType,
    pendingIntensity,
    previewEnabled,
    setPendingEffectPreview,
  ]);

  const commitPreview = () => {
    if (appliedTypes.has(pendingEffectType)) return;
    onUpdate({
      effects: [
        ...activeEffects,
        {
          id: generateEffectId(),
          type: pendingEffectType,
          intensity: effectSupportsIntensity(pendingEffectType)
            ? pendingIntensity
            : undefined,
        },
      ],
    });
    setPendingEffectPreview(null);
    setPreviewEnabled(false);
  };

  const cancelPreview = () => {
    setPendingEffectPreview(null);
    setPreviewEnabled(false);
  };

  const removeEffect = (effectId: string) => {
    onUpdate({ effects: removeEffectFromLayer(layer, effectId) });
  };

  const updateEffectIntensity = (effectId: string, intensity: number) => {
    onUpdate({
      effects: activeEffects.map((effect) =>
        effect.id === effectId ? { ...effect, intensity } : effect,
      ),
    });
  };

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <p className="text-xs font-semibold text-muted">تنظیمات تصویر</p>

      <label className="block space-y-1">
        <span className="text-[10px] text-muted">شفافیت ({opacityPercent}٪)</span>
        <input
          type="range"
          min={0}
          max={100}
          value={opacityPercent}
          onChange={(e) =>
            onUpdate({ opacity: Number(e.target.value) / 100 })
          }
          className="w-full accent-cyan-500"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] text-muted">حالت ترکیب / Blend Mode</span>
        <select
          value={layer.blendMode ?? "normal"}
          onChange={(e) =>
            onUpdate({ blendMode: e.target.value as ImageBlendMode })
          }
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
        >
          {BLEND_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <p className="text-[10px] text-muted">افکت‌ها / Effects</p>

        {activeEffects.length === 0 ? (
          <p className="text-[10px] text-muted/80">
            نوع افکت را انتخاب کنید — روی قاب پیش‌نمایش داده می‌شود.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeEffects.map((effect) => {
              const intensity = effect.intensity ?? 50;
              return (
                <li
                  key={effect.id}
                  className="rounded-lg border border-border bg-background/60 p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-foreground">
                      {getEffectTypeLabel(effect.type)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEffect(effect.id)}
                      className="rounded p-1 text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                      title="حذف افکت"
                      aria-label={`حذف ${getEffectTypeLabel(effect.type)}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {effectSupportsIntensity(effect.type) ? (
                    <label className="mt-2 block space-y-1">
                      <span className="text-[10px] text-muted">
                        شدت ({intensity}٪)
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={intensity}
                        onChange={(e) =>
                          updateEffectIntensity(
                            effect.id,
                            Number(e.target.value),
                          )
                        }
                        className="w-full accent-cyan-500"
                      />
                    </label>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {availableEffectTypes.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-dashed border-cyan-500/30 bg-cyan-500/5 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-medium text-cyan-200/90">
                پیش‌نمایش افکت / Effect Preview
              </p>
              {!previewEnabled ? (
                <button
                  type="button"
                  onClick={() => setPreviewEnabled(true)}
                  className="rounded-md px-2 py-0.5 text-[10px] text-cyan-400 transition hover:bg-cyan-500/10"
                >
                  فعال‌سازی پیش‌نمایش
                </button>
              ) : null}
            </div>
            <select
              value={pendingEffectType}
              onChange={(e) => {
                setPreviewEnabled(true);
                setPendingEffectType(e.target.value as ImageEffectType);
              }}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              {availableEffectTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {effectSupportsIntensity(pendingEffectType) ? (
              <label className="block space-y-1">
                <span className="text-[10px] text-muted">
                  شدت ({pendingIntensity}٪)
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pendingIntensity}
                  onChange={(e) => {
                    setPreviewEnabled(true);
                    setPendingIntensity(Number(e.target.value));
                  }}
                  className="w-full accent-cyan-500"
                />
              </label>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={commitPreview}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 py-1.5 text-[10px] text-cyan-300 hover:border-cyan-500/60"
              >
                <Plus size={12} />
                اعمال / Add
              </button>
              <button
                type="button"
                onClick={cancelPreview}
                className="flex-1 rounded-lg border border-border px-2 py-1.5 text-[10px] text-muted hover:border-cyan-500/30"
              >
                لغو / Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-muted/80">
            همه افکت‌ها اعمال شده‌اند.
          </p>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] ${
        danger
          ? "border-red-500/30 text-red-400"
          : "border-border text-muted hover:border-cyan-500/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
