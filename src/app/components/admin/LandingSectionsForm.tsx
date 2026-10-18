"use client";

import { useState, type FormEvent } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import TaxonomyCards from "@/app/components/home/taxonomy/TaxonomyCards";
import {
  LANDING_CARD_STYLES,
  LANDING_SECTION_COPY,
  type LandingSectionKey,
  type LandingSections,
} from "@/lib/landing/sections";
import type { LandingTaxonomy } from "@/lib/landing/taxonomy";

const KEYS: LandingSectionKey[] = ["categories", "features", "collections"];

export default function LandingSectionsForm({
  initial,
  items,
}: {
  initial: LandingSections;
  items: LandingTaxonomy;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const saved = await adminJson<LandingSections>("/api/admin/landing", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setDraft(saved);
      setNotice("تنظیمات لندینگ ذخیره شد.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-8">
      {KEYS.map((key) => {
        const copy = LANDING_SECTION_COPY[key];
        const section = draft[key];
        return (
          <section key={key} className="rounded-3xl border border-border bg-card/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-foreground">{copy.title}</h2>
                <p className="mt-1 text-sm text-muted">{copy.description}</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [key]: { ...current[key], visible: event.target.checked },
                    }))
                  }
                  className="size-4 accent-cyan-400"
                />
                نمایش در صفحه اصلی
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm text-muted">استایل کارت</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANDING_CARD_STYLES.map((style) => {
                  const active = section.style === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          [key]: { ...current[key], style: style.id },
                        }))
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        active
                          ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                          : "border-border text-muted hover:text-foreground"
                      }`}
                      aria-pressed={active}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 max-h-[32rem] overflow-auto rounded-2xl border border-border bg-[#050816] p-4">
              <p className="mb-3 text-xs text-muted">پیش‌نمایش استایل انتخاب‌شده</p>
              {items[key].length === 0 ? (
                <p className="text-sm text-muted">موردی برای نمایش نیست.</p>
              ) : (
                <TaxonomyCards items={items[key]} style={section.style} contained={section.style === "bento"} />
              )}
            </div>
          </section>
        );
      })}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {notice ? <p className="text-sm text-cyan-300">{notice}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
      >
        {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>
    </form>
  );
}
