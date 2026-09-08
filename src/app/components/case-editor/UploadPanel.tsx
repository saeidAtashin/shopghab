"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { uploadImage } from "@/lib/cases/api";
import ImageToolsPanel from "@/app/components/case-editor/ImageToolsPanel";
import { useEditorStore } from "@/lib/design/editor-store";
import type { ImageLayer } from "@/lib/design/types";

export default function UploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addImageLayer, uploadedAssets, selectedLayerId, document } =
    useEditorStore();

  const selectedImageLayer = selectedLayerId
    ? (document.layers.find(
        (l) => l.id === selectedLayerId && l.type === "image",
      ) as ImageLayer | undefined)
    : undefined;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("فقط فایل تصویری مجاز است.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حداکثر حجم ۵ مگابایت.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      const img = new window.Image();
      img.src = url;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      const maxW = 200;
      const ratio = img.width / img.height;
      const w = Math.min(img.width, maxW);
      const h = w / ratio;
      addImageLayer(url, w, h, false);
    } catch {
      setError("خطا در آپلود تصویر.");
    } finally {
      setUploading(false);
    }
  }

  async function reAddAsset(src: string) {
    const img = new window.Image();
    img.src = src;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
    });
    const maxW = 200;
    const ratio = img.width / img.height;
    const w = Math.min(img.width, maxW);
    const h = w / ratio;
    addImageLayer(src, w, h, false);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
        <p className="text-xs font-semibold text-foreground">
          ویرایش تصویر / Image Editing
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted">
          پس از افزودن تصویر، از تب لایه‌ها ابزار حذف پس‌زمینه، برش شخص، برش
          چهره و برش تصویر را انتخاب کنید.
        </p>
      </div>

      {selectedImageLayer ? (
        <ImageToolsPanel layer={selectedImageLayer} compact />
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-600 py-6 text-sm text-muted transition hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-50"
      >
        <Upload size={18} />
        {uploading ? "در حال آپلود..." : "انتخاب تصویر"}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <p className="text-xs text-muted">JPG, PNG, WebP — حداکثر ۵MB</p>

      {uploadedAssets.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted">تصاویر قبلی</p>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-5 lg:grid-cols-6">
            {uploadedAssets.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => void reAddAsset(src)}
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card/60 transition hover:border-cyan-500/50"
                title="افزودن مجدد"
              >
                <Image src={src} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
