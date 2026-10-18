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
import type { BannerChoice, LandingTaxonomy, TaxonomyCard } from "@/lib/landing/taxonomy";

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

function cardWithBanner(card: TaxonomyCard, designId: string | undefined, choices: BannerChoice[]): TaxonomyCard {
  if (!designId) return card;
  const choice = choices.find((item) => item.id === designId && item.cardIds.includes(card.id));
  return choice ? { ...card, image: choice.image } : card;
}

export default function LandingSectionsForm({
  initial,
  items,
  choices,
}: {
  initial: LandingSections;
  items: LandingTaxonomy;
  choices: BannerChoice[];
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

  function setBanner(key: LandingSectionKey, cardId: string, designId: string | null) {
    setDraft((current) => {
      const banners = { ...(current[key].banners ?? {}) };
      if (designId) banners[cardId] = designId;
      else delete banners[cardId];
      const next = { ...current[key] };
      if (Object.keys(banners).length > 0) next.banners = banners;
      else delete next.banners;
      return { ...current, [key]: next };
    });
  }

  return (
    <form onSubmit={save} className="space-y-8">
      {KEYS.map((key) => {
        const copy = LANDING_SECTION_COPY[key];
        const section = draft[key];
        const preview = selectLandingItems(items[key], section.itemIds).map((card) =>
          cardWithBanner(card, section.banners?.[card.id], choices),
        );
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
              choices={choices}
              banners={section.banners}
              selected={new Set(chosenIds(section, items[key]))}
              query={key === "features" ? featureQuery : ""}
              onQueryChange={key === "features" ? setFeatureQuery : undefined}
              onToggle={(id, checked) => toggleItem(key, id, checked)}
              onBanner={(cardId, designId) => setBanner(key, cardId, designId)}
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
  choices,
  banners,
  selected,
  query,
  onQueryChange,
  onToggle,
  onBanner,
}: {
  sectionKey: LandingSectionKey;
  cards: TaxonomyCard[];
  choices: BannerChoice[];
  banners: Record<string, string> | undefined;
  selected: Set<string>;
  query: string;
  onQueryChange?: (value: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onBanner: (cardId: string, designId: string | null) => void;
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
                {group.cards.map((card) => {
                  const shown = selected.has(card.id)
                    ? cardWithBanner(card, banners?.[card.id], choices)
                    : card;
                  return (
                    <li key={card.id} className="rounded-xl px-2 py-1.5 hover:bg-white/5">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected.has(card.id)}
                          onChange={(event) => onToggle(card.id, event.target.checked)}
                          className="size-4 accent-cyan-400"
                        />
                        {shown.image ? (
                          <Image
                            src={designedAssetUrl(shown.image)}
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
                      {selected.has(card.id) ? (
                        <BannerPicker
                          sectionKey={sectionKey}
                          cardId={card.id}
                          choices={choices}
                          designId={banners?.[card.id]}
                          onChange={(designId) => onBanner(card.id, designId)}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BannerPicker({
  sectionKey,
  cardId,
  choices,
  designId,
  onChange,
}: {
  sectionKey: LandingSectionKey;
  cardId: string;
  choices: BannerChoice[];
  designId: string | undefined;
  onChange: (designId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mine = choices.filter((choice) => choice.cardIds.includes(cardId));
  const current = mine.find((choice) => choice.id === designId);
  const needle = query.trim();
  const shown = needle ? mine.filter((choice) => choice.title.includes(needle)) : mine;

  return (
    <div className="mt-2 ps-7">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-xs font-semibold text-cyan-300 hover:underline"
        aria-expanded={open}
      >
        بنر کارت: {current?.title ?? "خودکار"}
      </button>
      {open ? (
        <div className="mt-2 space-y-2 rounded-xl border border-border bg-background/40 p-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی طرح"
            className="w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-white/5">
            <input
              type="radio"
              name={`banner-${sectionKey}-${cardId}`}
              checked={!designId}
              onChange={() => onChange(null)}
              className="accent-cyan-400"
            />
            خودکار
          </label>
          {mine.length === 0 ? (
            <p className="px-2 text-sm text-muted">طرحی برای این کارت نیست.</p>
          ) : shown.length === 0 ? (
            <p className="px-2 text-sm text-muted">موردی پیدا نشد.</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-auto">
              {shown.map((choice) => (
                <li key={choice.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
                    <input
                      type="radio"
                      name={`banner-${sectionKey}-${cardId}`}
                      checked={designId === choice.id}
                      onChange={() => onChange(choice.id)}
                      className="accent-cyan-400"
                    />
                    <Image
                      src={designedAssetUrl(choice.image)}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-md object-cover"
                    />
                    <span className="truncate text-sm text-foreground">{choice.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
