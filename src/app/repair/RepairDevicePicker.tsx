"use client";

import Image from "next/image";

import FormField from "../components/ui/form/FormField";
import { consoleIds, type ConsoleId } from "../../lib/console-catalog";
import {
  consoleRepairIcons,
  getRepairDeviceLabel,
} from "../../lib/repair-links";
import { cn } from "../../lib/utils";

type Props = {
  value: ConsoleId | "";
  onChange: (id: ConsoleId) => void;
  error?: string | null;
};

export default function RepairDevicePicker({ value, onChange, error }: Props) {
  return (
    <FormField
      label="نوع دستگاه *"
      htmlFor="repair-device"
      error={error}
      className="relative mx-auto mt-5 w-full max-w-lg"
      labelClassName="text-center text-sm font-medium"
      errorClassName="text-center text-sm"
    >
      <p className="mb-3 text-center text-sm text-zinc-400">
        {value ? getRepairDeviceLabel(value) : "دستگاه خود را انتخاب کنید"}
      </p>
      <div
        id="repair-device"
        role="radiogroup"
        aria-label="نوع دستگاه"
        aria-invalid={!!error}
        aria-describedby={error ? "repair-device-error" : undefined}
        className="grid grid-cols-3 gap-3"
      >
        {consoleIds.map((id) => {
          const active = value === id;
          const label = getRepairDeviceLabel(id);

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => onChange(id)}
              className={cn(
                "group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border px-2 py-4 backdrop-blur-md transition-[color,box-shadow,border-color] duration-300",
                active
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.35)]"
                  : "border-white/15 bg-black/40 text-zinc-300 hover:border-cyan-400/35 hover:text-zinc-100 hover:shadow-[0_0_18px_rgba(34,211,238,0.12)]",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-400/55 bg-cyan-500/20 shadow-[inset_0_0_24px_rgba(34,211,238,0.15)]"
                />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.22),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <Image
                src={consoleRepairIcons[id]}
                alt=""
                width={48}
                height={48}
                className={cn(
                  "relative invert text-white z-10 h-20 w-20 object-contain transition-all duration-300",
                  active
                    ? "drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                    : "opacity-75 group-hover:opacity-95",
                )}
              />
              <span className="relative z-10 text-center text-xs font-bold leading-tight sm:text-sm">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
