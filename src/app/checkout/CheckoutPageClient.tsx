"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PhoneVerificationModal from "@/app/components/auth/PhoneVerificationModal";
import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import { usePhoneVerifiedSubmit, VerificationCancelledError } from "@/app/hooks/usePhoneVerifiedSubmit";
import { normalizeIranPhone } from "@/lib/phone";
import { requestZarinPalPayment } from "@/lib/payments/zarinpal";
import { formatToman, submitShopOrder } from "@/lib/shop";
import { getReadyCaseById } from "@/lib/cases/ready.static";
import { getCartItemKey } from "@/lib/shop/types";

export default function CheckoutPageClient() {
  const { user } = useAuth();
  const { requestSubmit, verifying, modalProps } = usePhoneVerifiedSubmit();
  const { items, subtotal, clearCart } = useShopCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accountPhone = user?.phone_number ?? user?.phone ?? "";

  useEffect(() => {
    if (accountPhone) setPhone(accountPhone);
  }, [accountPhone]);

  const displayItems = useMemo(
    () =>
      items.map((item) => {
        if (item.kind === "ready") {
          const product = getReadyCaseById(item.productId);
          return product ? { item, product, key: getCartItemKey(item) } : null;
        }
        return { item, key: getCartItemKey(item), product: null };
      }).filter(Boolean),
    [items],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("نام و نام خانوادگی الزامی است.");
      return;
    }
    const normalizedPhone = normalizeIranPhone(phone);
    if (!normalizedPhone) {
      setError("شماره موبایل معتبر نیست.");
      return;
    }
    if (!address.trim()) {
      setError("آدرس ارسال الزامی است.");
      return;
    }
    if (displayItems.length === 0) {
      setError("سبد خرید خالی است.");
      return;
    }

    const payload = {
      name: name.trim(),
      phone: normalizedPhone,
      address: address.trim(),
      note: note.trim() || undefined,
      items,
    };

    setLoading(true);
    try {
      await requestSubmit(normalizedPhone, async () => {
        const order = await submitShopOrder(payload);

        try {
          const callbackUrl = `${window.location.origin}/payment/callback?orderId=${order.orderId}`;
          const payment = await requestZarinPalPayment({
            orderId: order.orderId,
            amount: order.amount || subtotal,
            callbackUrl,
          });
          clearCart();
          window.location.href = payment.paymentUrl;
        } catch {
          clearCart();
          window.location.href = `/payment/callback?orderId=${order.orderId}&local=1&code=${order.orderCode}`;
        }
      });
    } catch (err) {
      if (err instanceof VerificationCancelledError) return;
      setError(err instanceof Error ? err.message : "خطا در ثبت سفارش.");
    } finally {
      setLoading(false);
    }
  }

  if (displayItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 text-center">
        <h1 className="text-2xl font-black text-foreground">سبد خرید خالی است</h1>
        <Link href="/cart" className="mt-4 inline-block text-cyan-400">
          بازگشت به سبد
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <h1 className="text-2xl font-black text-foreground">تسویه حساب</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-6">
          <label className="block space-y-1">
            <span className="text-sm text-muted">نام و نام خانوادگی</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-muted">شماره موبایل</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              dir="ltr"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-muted">آدرس کامل</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-muted">یادداشت (اختیاری)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <p className="mb-4 font-bold text-foreground">خلاصه سفارش</p>
          <ul className="space-y-2 text-sm text-muted">
            {displayItems.map((entry) =>
              entry ? (
                <li key={entry.key} className="flex justify-between">
                  <span>
                    {entry.item.kind === "ready"
                      ? entry.product?.title
                      : entry.item.title}{" "}
                    × {entry.item.qty}
                  </span>
                </li>
              ) : null,
            )}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-bold">
            <span className="text-muted">مبلغ قابل پرداخت</span>
            <span className="text-cyan-400">{formatToman(subtotal)}</span>
          </div>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || verifying}
          className="w-full rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black disabled:opacity-50"
        >
          {loading || verifying ? "در حال پردازش..." : "پرداخت با زرین‌پال"}
        </button>
      </form>

      <PhoneVerificationModal {...modalProps} />
    </div>
  );
}
