"use client";

import { useState } from "react";
import {
  Crop,
  Loader2,
  Scissors,
  Sparkles,
  User,
  UserCircle,
} from "lucide-react";

import ImageCropModal from "@/app/components/case-editor/ImageCropModal";
import { useEditorStore } from "@/lib/design/editor-store";
import { cropImage } from "@/lib/design/image-tools/crop-image";
import { persistProcessedImage } from "@/lib/design/image-tools/persist-processed-image";
import { removeBackgroundFromImage } from "@/lib/design/image-tools/remove-background";
import { segmentFaceFromImage } from "@/lib/design/image-tools/segment-face";
import { segmentPersonFromImage } from "@/lib/design/image-tools/segment-person";
import type { CropRect } from "@/lib/design/image-tools/types";
import type { ImageLayer } from "@/lib/design/types";

type Props = {
  layer: ImageLayer;
  compact?: boolean;
};

type ToolId = "removeBg" | "person" | "face" | "cutout" | "crop";

const TOOLS: {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "removeBg",
    label: "حذف پس‌زمینه / Remove BG",
    icon: <Sparkles size={14} />,
  },
  {
    id: "person",
    label: "برش شخص / Person Cutout",
    icon: <User size={14} />,
  },
  {
    id: "face",
    label: "برش چهره / Face Cutout",
    icon: <UserCircle size={14} />,
  },
  {
    id: "cutout",
    label: "برش (Cutout) / General Cutout",
    icon: <Scissors size={14} />,
  },
  {
    id: "crop",
    label: "برش تصویر / Crop",
    icon: <Crop size={14} />,
  },
];

export default function ImageToolsPanel({ layer, compact = false }: Props) {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const trackUploadedAsset = useEditorStore((s) => s.trackUploadedAsset);

  const [busyTool, setBusyTool] = useState<ToolId | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const applyBlobToLayer = async (blob: Blob, suffix: string) => {
    setStatus("در حال ذخیره...");
    const url = await persistProcessedImage(blob, `${suffix}-${Date.now()}.png`);
    trackUploadedAsset(url);

    const img = new window.Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("بارگذاری نتیجه ناموفق بود."));
    });

    const aspect = layer.width / layer.height;
    const newAspect = img.naturalWidth / img.naturalHeight;
    let width = layer.width;
    let height = layer.height;
    if (Math.abs(aspect - newAspect) > 0.01) {
      if (newAspect > aspect) {
        height = width / newAspect;
      } else {
        width = height * newAspect;
      }
    }

    updateLayer(layer.id, { src: url, width, height });
  };

  const runTool = async (toolId: ToolId) => {
    if (toolId === "crop") {
      setCropOpen(true);
      return;
    }

    setBusyTool(toolId);
    setError(null);
    setStatus(null);

    try {
      const onProgress = (message: string) => setStatus(message);
      let blob: Blob;

      switch (toolId) {
        case "removeBg":
        case "cutout":
          blob = await removeBackgroundFromImage(layer.src, onProgress);
          break;
        case "person":
          blob = await segmentPersonFromImage(layer.src, onProgress);
          break;
        case "face":
          blob = await segmentFaceFromImage(layer.src, onProgress);
          break;
        default:
          return;
      }

      await applyBlobToLayer(blob, toolId);
      setStatus("انجام شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در پردازش تصویر.");
      setStatus(null);
    } finally {
      setBusyTool(null);
    }
  };

  const handleCropConfirm = async (rect: CropRect) => {
    setBusyTool("crop");
    setError(null);
    setStatus("در حال برش...");
    try {
      const blob = await cropImage(layer.src, rect);
      await applyBlobToLayer(blob, "crop");
      setStatus("انجام شد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در برش تصویر.");
    } finally {
      setBusyTool(null);
      setStatus(null);
    }
  };

  return (
    <div
      className={`space-y-2 ${compact ? "" : "border-t border-border pt-3"}`}
    >
      {!compact ? (
        <p className="text-xs font-semibold text-muted">
          ابزار تصویر / Image Tools
        </p>
      ) : null}
      {!compact ? (
        <p className="text-[10px] leading-relaxed text-muted/90">
          پیشنهاد: برای پرتره از «برش شخص» یا «حذف پس‌زمینه» استفاده کنید.
          پردازش در مرورگر انجام می‌شود.
        </p>
      ) : null}

      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1"}`}>
        {TOOLS.map((tool) => {
          const isBusy = busyTool === tool.id;
          const disabled = busyTool !== null && !isBusy;
          return (
            <button
              key={tool.id}
              type="button"
              disabled={disabled}
              onClick={() => void runTool(tool.id)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-[10px] text-foreground transition hover:border-cyan-500/40 disabled:opacity-50"
            >
              {isBusy ? (
                <Loader2 size={14} className="shrink-0 animate-spin text-cyan-400" />
              ) : (
                <span className="shrink-0 text-cyan-400">{tool.icon}</span>
              )}
              <span className="min-w-0 flex-1">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {status ? (
        <p className="text-[10px] text-cyan-300/90">{status}</p>
      ) : null}
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}

      <ImageCropModal
        open={cropOpen}
        src={layer.src}
        onClose={() => setCropOpen(false)}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
