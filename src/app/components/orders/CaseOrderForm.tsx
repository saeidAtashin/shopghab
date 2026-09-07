"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { PHONE_MODELS } from "@/lib/case-catalog";
import type { DesignType } from "@/lib/orders";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  ImageUploadField,
} from "@/app/components/ui/form";

type CaseOrderFormProps = {
  designType: DesignType;
  caseSlug?: string;
  caseTitle?: string;
  defaultPhoneModel?: string;
  submitLabel?: string;
};

export default function CaseOrderForm({
  designType,
  caseSlug = "",
  caseTitle = "",
  defaultPhoneModel = "",
  submitLabel = "ثبت سفارش",
}: CaseOrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneModel, setPhoneModel] = useState(defaultPhoneModel);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("phone", phone);
      formData.set("phoneModel", phoneModel);
      formData.set("designType", designType);
      formData.set("caseSlug", caseSlug);
      formData.set("caseTitle", caseTitle);
      formData.set("description", description);
      if (selectedFile) formData.set("image", selectedFile);

      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "خطا در ثبت سفارش");
        return;
      }

      setTrackingCode(data.trackingCode);
      setName("");
      setPhone("");
      setDescription("");
      setSelectedFile(null);
      setImagePreview(null);
    } catch {
      setError("ارتباط با سرور برقرار نشد");
    } finally {
      setLoading(false);
    }
  }

  if (trackingCode) {
    return (
      <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-8 text-center">
        <p className="text-sm text-amber-300">سفارش با موفقیت ثبت شد</p>
        <p className="mt-3 text-3xl font-black tracking-widest text-white">
          {trackingCode}
        </p>
        <p className="mt-4 text-sm text-zinc-400">
          کد رهگیری را ذخیره کنید و وضعیت سفارش را پیگیری کنید.
        </p>
        <Link
          href={`/tracking?code=${trackingCode}`}
          className="mt-6 inline-flex rounded-2xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400"
        >
          پیگیری سفارش
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {caseTitle ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          سفارش برای: <span className="font-bold text-white">{caseTitle}</span>
        </div>
      ) : null}

      <FormInput
        id="order-name"
        label="نام و نام خانوادگی"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <FormInput
        id="order-phone"
        label="شماره موبایل"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        dir="ltr"
        required
      />

      <FormSelect
        id="order-phone-model"
        label="مدل گوشی"
        value={phoneModel}
        onChange={(e) => setPhoneModel(e.target.value)}
        required
      >
        <option value="">انتخاب مدل</option>
        {PHONE_MODELS.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </FormSelect>

      <FormTextarea
        id="order-description"
        label={
          designType === "custom"
            ? "توضیح طرح سفارشی"
            : "توضیحات سفارش (اختیاری)"
        }
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        required={designType === "custom"}
      />

      {designType === "custom" ? (
        <ImageUploadField
          id="order-image"
          label="آپلود طرح یا تصویر مرجع"
          preview={imagePreview}
          onChange={handleImageChange}
        />
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 px-6 py-4 text-lg font-bold text-black transition hover:from-amber-400 hover:to-orange-400 disabled:opacity-60"
      >
        {loading ? "در حال ثبت..." : submitLabel}
      </button>
    </form>
  );
}
