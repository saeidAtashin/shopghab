"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

import { adminJson } from "@/app/components/admin/AdminShell";
import TaxonomyCards from "@/app/components/home/taxonomy/TaxonomyCards";
import { designedAssetUrl } from "@/lib/designed-assets";
import {
  LANDING_CARD_STYLES,
  LANDING_SECTION_COPY,
  selectLandingItems,
  type LandingSectionKey,
  type LandingSectionSetting,
  type LandingSections,
} from "@/lib/landing/sections";
import type { LandingTaxonomy, TaxonomyCard } from "@/lib/landing/taxonomy";

const KEYS: LandingSectionKey[] = ["categories", "features", "collections"];

function chosenIds(section: LandingSectionSetting, cards: TaxonomyCard[]): string[] {
  return section.itemIds ?? cards.map((card) => card.id);
}

function groupedCards(cards: TaxonomyCard[]): { name: string; cards: TaxonomyCard[] }[] {
  const groups: { name: string; cards: TaxonomyCard[] }[] = [];
  for (const card of cards) {
    const name = card.group ?? "";
    const existing = groups.find((group) => group.name === name);
    if (existing) existing.cards.push(card);
    else groups.push({ name, cards: [card] });
  }
  return groups;
}

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
  const [featureQuery, setFeatureQuery] = useState("");

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

  function toggleItem(key: LandingSectionKey, id: string, checked: boolean) {
    setDraft((current) => {
      const base = chosenIds(current[key], items[key]);
      const next = checked ? (base.includes(id) ? base : [...base, id]) : base.filter((itemId) => itemId !== id);
      return { ...current, [key]: { ...current[key], itemIds: next } };
    });
  }

  return (
    <form onSubmit={save} className="space-y-8">
      {KEYS.map((key) => {
        const copy = LANDING_SECTION_COPY[key];
        const section = draft[key];
        const preview = selectLandingItems(items[key], section.itemIds);
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

            <ItemPicker
              sectionKey={key}
              cards={items[key]}
              selected={new Set(chosenIds(section, items[key]))}
              query={key === "features" ? featureQuery : ""}
              onQueryChange={key === "features" ? setFeatureQuery : undefined}
              onToggle={(id, checked) => toggleItem(key, id, checked)}
            />

            <div className="mt-6 max-h-[32rem] overflow-auto rounded-2xl border border-border bg-[#050816] p-4">
              <p className="mb-3 text-xs text-muted">پیش‌نمایش موارد انتخاب‌شده</p>
              {preview.length === 0 ? (
                <p className="text-sm text-muted">موردی برای نمایش نیست.</p>
              ) : (
                <TaxonomyCards items={preview} style={section.style} contained={section.style === "bento"} />
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

function ItemPicker({
  sectionKey,
  cards,
  selected,
  query,
  onQueryChange,
  onToggle,
}: {
  sectionKey: LandingSectionKey;
  cards: TaxonomyCard[];
  selected: Set<string>;
  query: string;
  onQueryChange?: (value: string) => void;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const needle = query.trim();
  const visible = needle
    ? cards.filter((card) => `${card.title} ${card.group ?? ""}`.includes(needle))
    : cards;
  const groups = groupedCards(visible);
  const selectedCount = cards.filter((card) => selected.has(card.id)).length;

  return (
    <div className="mt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {selectedCount.toLocaleString("fa-IR")} از {cards.length.toLocaleString("fa-IR")} مورد برای لندینگ
        </p>
        {onQueryChange ? (
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="جستجوی ویژگی"
            className="w-full max-w-xs rounded-2xl border border-border bg-input-bg px-4 py-2 text-sm outline-none focus:border-cyan-500"
          />
        ) : null}
      </div>
      <div className="max-h-80 space-y-4 overflow-auto rounded-2xl border border-border p-3">
        {visible.length === 0 ? (
          <p className="text-sm text-muted">موردی پیدا نشد.</p>
        ) : (
          groups.map((group) => (
            <div key={`${sectionKey}-${group.name || "all"}`}>
              {group.name ? <h3 className="mb-2 text-sm font-black text-foreground">{group.name}</h3> : null}
              <ul className="space-y-1">
                {group.cards.map((card) => (
                  <li key={card.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={selected.has(card.id)}
                        onChange={(event) => onToggle(card.id, event.target.checked)}
                        className="size-4 accent-cyan-400"
                      />
                      {card.image ? (
                        <Image
                          src={designedAssetUrl(card.image)}
                          alt=""
                          width={40}
                          height={40}
                          className="size-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="size-10 shrink-0 rounded-lg bg-white/10" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{card.title}</span>
                        <span className="text-xs text-muted">{card.count.toLocaleString("fa-IR")} طرح</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
