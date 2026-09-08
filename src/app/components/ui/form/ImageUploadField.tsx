import { Upload } from "lucide-react";

import FormField from "./FormField";

type ImageUploadFieldProps = {
  label: string;
  id: string;
  preview: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  uploadLabel?: string;
  previewAlt?: string;
  fieldClassName?: string;
  labelClassName?: string;
};

export default function ImageUploadField({
  label,
  id,
  preview,
  onChange,
  accept = "image/*",
  uploadLabel = "برای آپلود کلیک کنید",
  previewAlt = "پیش‌نمایش تصویر",
  fieldClassName,
  labelClassName,
}: ImageUploadFieldProps) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      className={fieldClassName}
      labelClassName={labelClassName}
    >
      <label
        htmlFor={id}
        className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-500/30 bg-surface transition-colors hover:border-cyan-400 hover:bg-input-bg"
      >
        <Upload className="mb-3 h-8 w-8 text-cyan-300" aria-hidden />
        <span className="text-sm font-medium text-foreground">{uploadLabel}</span>
        <input id={id} type="file" hidden accept={accept} onChange={onChange} />
      </label>

      {preview && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
          <img
            src={preview}
            alt={previewAlt}
            className="h-64 w-full object-cover"
          />
        </div>
      )}
    </FormField>
  );
}
