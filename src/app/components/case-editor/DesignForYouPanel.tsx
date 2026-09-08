"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Send, Upload, X } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { uploadImage } from "@/lib/cases/api";
import { submitDesignRequest } from "@/lib/design/design-request-api";
import { useEditorStore } from "@/lib/design/editor-store";

type Props = {
  brandSlug: string;
  modelSlug: string;
  caseTypeSlug: string;
  modelName: string;
};

export default function DesignForYouPanel({
  brandSlug,
  modelSlug,
  caseTypeSlug,
  modelName,
}: Props) {
  const { user } = useAuth();
  const { meta } = useEditorStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(user?.name ?? "");
  const [contactPhone, setContactPhone] = useState(
    user?.phone_number ?? user?.phone ?? "",
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setImageUrls((prev) => [...prev, url]);
    } catch {
      setError("خطا در آپلود تصویر.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("لطفاً توضیحات طراحی را بنویسید.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await submitDesignRequest({
        brandSlug,
        modelSlug,
        caseTypeSlug,
        description: description.trim(),
        imageUrls,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });
      setMessage(
        "درخواست ثبت شد — طراحی برای شما آماده می‌شود و برای تأیید ارسال می‌کنیم.",
      );
      setDescription("");
      setImageUrls([]);
    } catch {
      setError("خطا در ثبت درخواست. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <p className="text-sm font-bold text-foreground">طراحی قاب برای شما</p>
        <p className="mt-1 text-xs leading-6 text-muted">
          تصویر و توضیحات خود را بفرستید — ما قاب را طراحی می‌کنیم و برای
          تأیید به شما ارسال می‌کنیم.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted">
        مدل: <span className="text-foreground">{modelName}</span>
        {meta?.caseType ? (
          <>
            {" "}
            — نوع قاب: <span className="text-foreground">{meta.caseType.name}</span>
          </>
        ) : null}
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-muted">توضیحات طراحی *</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="مثلاً: پس‌زمینه کهکشانی با نام «علی» با فونت نئون..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          required
        />
      </label>

      <div className="space-y-2">
        <span className="text-xs text-muted">تصاویر مرجع (اختیاری)</span>
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-600 py-4 text-sm text-muted transition hover:border-cyan-500/50 disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? "در حال آپلود..." : "افزودن تصویر"}
        </button>
        {imageUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs text-muted">نام</span>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted">شماره تماس</span>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            dir="ltr"
          />
        </label>
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:opacity-50"
      >
        <Send size={16} />
        {submitting ? "در حال ارسال..." : "ارسال درخواست طراحی"}
      </button>
    </form>
  );
}
