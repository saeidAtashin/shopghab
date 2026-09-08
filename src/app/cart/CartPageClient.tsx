"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useShopCart } from "@/app/context/ShopCartContext";
import { getReadyCaseById } from "@/lib/cases/ready.static";
import { getBrandBySlug, getCaseTypeBySlug, getModelBySlug } from "@/lib/cases";
import { formatToman } from "@/lib/shop/format";
import { getCartItemKey } from "@/lib/shop/types";

export default function CartPageClient() {
  const { items, subtotal, incrementQty, decrementQty, removeItem } = useShopCart();

  const displayItems = useMemo(
    () =>
      items.map((item) => {
        if (item.kind === "ready") {
          const product = getReadyCaseById(item.productId);
          return product
            ? { item, key: getCartItemKey(item), title: product.title, price: product.price, image: product.image }
            : null;
        }
        return {
          item,
          key: getCartItemKey(item),
          title: item.title,
          price: item.unitPrice,
          image: item.previewUrl,
          description: item.description,
        };
      }).filter(Boolean),
    [items],
  );

  if (displayItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 text-center">
        <h1 className="text-2xl font-black text-foreground">سبد خرید خالی است</h1>
        <p className="mt-3 text-muted">یک طراحی انتخاب کن یا خودت قاب بساز</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/designs" className="rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground">
            طراحی‌های آماده
          </Link>
          <Link href="/create" className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black">
            طراحی قاب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <h1 className="text-2xl font-black text-foreground">سبد خرید</h1>
      <ul className="mt-8 space-y-4">
        {displayItems.map((entry) => {
          if (!entry) return null;
          return (
            <li
              key={entry.key}
              className="flex gap-4 rounded-2xl border border-border bg-card/60 p-4"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                {entry.image ? (
                  entry.image.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-900/40 to-purple-900/40">
                      <div className="h-14 w-7 rounded-lg border border-border bg-card" />
                    </div>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-900/40 to-purple-900/40">
                    <div className="h-14 w-7 rounded-lg border border-border bg-card" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">{entry.title}</p>
                {entry.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{entry.description}</p>
                ) : null}
                {entry.item.kind === "custom" ? (
                  <p className="mt-1 text-xs text-muted">
                    {getBrandBySlug(entry.item.brandSlug)?.name} —{" "}
                    {getModelBySlug(entry.item.brandSlug, entry.item.modelSlug)?.name} —{" "}
                    {getCaseTypeBySlug(entry.item.caseTypeSlug)?.name}
                  </p>
                ) : null}
                <p className="mt-2 font-semibold text-cyan-400">{formatToman(entry.price)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrementQty(entry.key)}
                    className="rounded-lg border border-border px-3 py-1 text-sm"
                  >
                    −
                  </button>
                  <span className="text-sm text-foreground">{entry.item.qty}</span>
                  <button
                    type="button"
                    onClick={() => incrementQty(entry.key)}
                    className="rounded-lg border border-border px-3 py-1 text-sm"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(entry.key)}
                    className="mr-auto text-xs text-red-400"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-muted">جمع کل</span>
          <span className="text-cyan-400">{formatToman(subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black"
        >
          ادامه و پرداخت
        </Link>
      </div>
    </div>
  );
}
