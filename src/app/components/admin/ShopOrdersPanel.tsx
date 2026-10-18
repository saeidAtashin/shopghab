"use client";

import { useCallback, useEffect, useState } from "react";

import { getReadyCaseById } from "@/lib/cases/ready.static";
import { formatToman } from "@/lib/shop";
import type { AdminCustomer, PaymentMethod, PublicShopOrder, ShopOrderStatus } from "@/lib/shop/activity";
import type { CartLineItem } from "@/lib/shop/types";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  zarinpal: "زرین‌پال",
  card_to_card: "کارت به کارت",
};

const STATUS_LABEL: Record<ShopOrderStatus, string> = {
  paid: "پرداخت شده",
  receipt_uploaded: "در انتظار تایید رسید",
  confirmed: "تایید شده",
};

type ShopOrderRow = PublicShopOrder & {
  customerName: string;
  customerPhone: string;
};

function itemLabel(item: CartLineItem): string {
  if (item.kind === "ready") {
    return getReadyCaseById(item.productId)?.title ?? item.productId;
  }
  return item.title;
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fa-IR");
}

function flattenOrders(customers: AdminCustomer[]): ShopOrderRow[] {
  return customers
    .flatMap((customer) =>
      customer.orders.map((order) => ({
        ...order,
        customerName: customer.name,
        customerPhone: customer.phone,
      })),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default function ShopOrdersPanel() {
  const [orders, setOrders] = useState<ShopOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cardError, setCardError] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/customers", { credentials: "include" });
      const body = (await response.json().catch(() => ({}))) as {
        customers?: AdminCustomer[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error || "دریافت سفارش‌های فروشگاه انجام نشد");
      }
      setOrders(flattenOrders(body.customers ?? []));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت سفارش‌های فروشگاه انجام نشد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function confirmOrder(order: ShopOrderRow) {
    setCardError((current) => ({ ...current, [order.id]: "" }));
    setBusyId(order.id);
    try {
      const response = await fetch(`/api/admin/shop-orders/${order.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        order?: PublicShopOrder;
        error?: string;
      };
      if (!response.ok || !body.order) {
        throw new Error(body.error || "تایید سفارش انجام نشد");
      }
      const confirmed = body.order;
      setOrders((current) =>
        current.map((item) => (item.id === confirmed.id ? { ...item, ...confirmed } : item)),
      );
    } catch (err) {
      setCardError((current) => ({
        ...current,
        [order.id]: err instanceof Error ? err.message : "تایید سفارش انجام نشد",
      }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-black text-foreground">سفارش‌های فروشگاه</h2>
      {loading ? (
        <p className="text-muted">در حال دریافت سفارش‌های فروشگاه...</p>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">
          هنوز سفارش فروشگاهی ثبت نشده است
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-cyan-400">{order.orderCode}</p>
                  <p className="mt-1 text-foreground">{order.customerName}</p>
                  <p className="mt-1 text-sm text-muted" dir="ltr">
                    {order.customerPhone}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">{formatToman(order.amount)}</p>
              </div>
              <p className="mt-3 text-sm text-muted">
                {METHOD_LABEL[order.paymentMethod]} · {STATUS_LABEL[order.status]} · {formatWhen(order.createdAt)}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {order.items.map((item, index) => (
                  <li key={`${order.id}-${index}`}>
                    {itemLabel(item)} × {item.qty}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-foreground">{order.address}</p>
              {order.note ? <p className="mt-1 text-sm text-muted">{order.note}</p> : null}
              {order.hasReceipt ? (
                <a href={`/api/admin/shop-orders/${order.id}/receipt`} target="_blank" rel="noreferrer">
                  <img
                    src={`/api/admin/shop-orders/${order.id}/receipt`}
                    alt={`رسید سفارش ${order.orderCode}`}
                    className="mt-4 max-h-64 rounded-xl border border-border object-contain"
                  />
                </a>
              ) : null}
              {order.status === "receipt_uploaded" ? (
                <button
                  type="button"
                  disabled={busyId === order.id}
                  onClick={() => void confirmOrder(order)}
                  className="mt-4 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
                >
                  {busyId === order.id ? "در حال تایید..." : "تایید رسید"}
                </button>
              ) : null}
              {cardError[order.id] ? <p className="mt-2 text-sm text-red-300">{cardError[order.id]}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
