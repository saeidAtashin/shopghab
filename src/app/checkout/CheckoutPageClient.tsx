"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PendingButtonLabel from "@/app/components/auth/PendingButtonLabel";
import PhoneVerificationModal from "@/app/components/auth/PhoneVerificationModal";
import { useAuth } from "@/app/context/AuthContext";
import { useShopCart } from "@/app/context/ShopCartContext";
import { usePhoneVerifiedSubmit, VerificationCancelledError } from "@/app/hooks/usePhoneVerifiedSubmit";
import { IRAN_MOBILE_CANONICAL, normalizeIranPhone, sanitizeCanonicalMobileInput } from "@/lib/phone";
import { requestZarinPalPayment } from "@/lib/payments/zarinpal";
import { CARD_TO_CARD, formatCardNumber, type PaymentMethod } from "@/lib/shop/activity";
import { formatToman, submitShopOrder } from "@/lib/shop";
import { getReadyCaseById } from "@/lib/cases/ready.static";
import { getCartItemKey } from "@/lib/shop/types";

export default function CheckoutPageClient() {
  const { user } = useAuth();
  const { requestSubmit, verifying, modalOpen, modalProps } = usePhoneVerifiedSubmit();
  const { items, subtotal, clearCart } = useShopCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("zarinpal");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const accountPhone = user?.phone_number ?? user?.phone ?? "";

  useEffect(() => {
    const canonical = accountPhone ? normalizeIranPhone(accountPhone) : null;
    if (canonical) setPhone(canonical);
  }, [accountPhone]);

  useEffect(() => {
    if (!receipt) {
      setReceiptPreview(null);
      return;
    }
    const url = URL.createObjectURL(receipt);
    setReceiptPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receipt]);

  async function copyCardNumber() {
    try {
      await navigator.clipboard.writeText(CARD_TO_CARD.number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

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
    const normalizedPhone = IRAN_MOBILE_CANONICAL.test(phone) ? phone : null;
    if (!normalizedPhone) {
      setError("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
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
    if (paymentMethod === "card_to_card" && !receipt) {
      setError("تصویر رسید پرداخت الزامی است.");
      return;
    }

    const payload = {
      name: name.trim(),
      phone: normalizedPhone,
      address: address.trim(),
      note: note.trim() || undefined,
      items,
    };

    try {
      await requestSubmit(normalizedPhone, async () => {
        setLoading(true);
        if (paymentMethod === "card_to_card" && receipt) {
          const body = new FormData();
          body.set("name", payload.name);
          body.set("phone", payload.phone);
          body.set("address", payload.address ?? "");
          if (payload.note) body.set("note", payload.note);
          body.set("items", JSON.stringify(payload.items));
          body.set("receipt", receipt);
          const response = await fetch("/api/shop/card-orders", { method: "POST", body });
          const result = (await response.json().catch(() => ({}))) as {
            orderId?: string;
            orderCode?: string;
            error?: string;
          };
          if (!response.ok || !result.orderCode) {
            throw new Error(result.error || "ثبت سفارش انجام نشد.");
          }
          clearCart();
          window.location.href = `/payment/callback?orderId=${result.orderId ?? ""}&local=1&code=${result.orderCode}&method=card`;
          return;
        }

        const order = await submitShopOrder(payload);
        const recordResponse = await fetch("/api/shop/orders/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.orderId,
            orderCode: order.orderCode,
            ...payload,
          }),
        });
        if (!recordResponse.ok) {
          const recordResult = (await recordResponse.json().catch(() => ({}))) as { error?: string };
          throw new Error(recordResult.error || "ثبت سفارش انجام نشد.");
        }

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
      <main id="main" tabIndex={-1} className="mx-auto max-w-2xl px-4 pt-28 pb-16 text-center outline-none">
        <h1 className="text-2xl font-black text-foreground">سبد خرید خالی است</h1>
        <Link href="/cart" className="mt-4 inline-block text-cyan-400">
          بازگشت به سبد
        </Link>
      </main>
    );
  }

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 pt-28 pb-16 outline-none">
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
              onChange={(e) => {
                e.currentTarget.setCustomValidity("");
                setPhone(sanitizeCanonicalMobileInput(e.target.value));
              }}
              onInvalid={(e) => {
                e.currentTarget.setCustomValidity("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
              }}
              inputMode="numeric"
              maxLength={11}
              pattern="09[0-9]{9}"
              placeholder="09123456789"
              autoComplete="tel"
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

        <fieldset className="space-y-4 rounded-2xl border border-border bg-card/60 p-6">
          <legend className="px-1 font-bold text-foreground">روش پرداخت</legend>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
            <input
              type="radio"
              name="paymentMethod"
              value="zarinpal"
              checked={paymentMethod === "zarinpal"}
              onChange={() => setPaymentMethod("zarinpal")}
            />
            پرداخت با زرین‌پال
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
            <input
              type="radio"
              name="paymentMethod"
              value="card_to_card"
              checked={paymentMethod === "card_to_card"}
              onChange={() => setPaymentMethod("card_to_card")}
            />
            کارت به کارت
          </label>

          {paymentMethod === "card_to_card" ? (
            <div className="space-y-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div>
                <p className="text-xs text-muted">به نام</p>
                <p className="mt-1 font-bold text-foreground">{CARD_TO_CARD.holder}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">شماره کارت</p>
                  <p className="mt-1 font-mono text-lg tracking-wide text-foreground" dir="ltr">
                    {formatCardNumber(CARD_TO_CARD.number)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyCardNumber()}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground"
                >
                  {copied ? "کپی شد" : "کپی"}
                </button>
              </div>
              <label className="block space-y-2">
                <span className="text-sm text-muted">تصویر رسید پرداخت</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(event) => setReceipt(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-muted file:ml-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-sm file:font-bold file:text-black"
                />
              </label>
              {receiptPreview ? (
                <img
                  src={receiptPreview}
                  alt="پیش‌نمایش رسید پرداخت"
                  className="max-h-48 rounded-lg border border-border object-contain"
                />
              ) : null}
            </div>
          ) : null}
        </fieldset>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || verifying || modalOpen}
          aria-busy={loading || verifying}
          className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-black disabled:opacity-50"
        >
          <PendingButtonLabel
            pending={loading || verifying}
            pendingLabel="در حال پردازش..."
            idle={
              paymentMethod === "card_to_card"
                ? "ثبت سفارش و ارسال رسید"
                : "پرداخت با زرین‌پال"
            }
          />
        </button>
      </form>

      <PhoneVerificationModal {...modalProps} />
    </main>
  );
}
