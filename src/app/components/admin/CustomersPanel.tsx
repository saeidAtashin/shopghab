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

function itemLabel(item: CartLineItem): string {
  if (item.kind === "ready") {
    return getReadyCaseById(item.productId)?.title ?? item.productId;
  }
  if (item.kind === "catalog") return `طرح پیش‌ساخته: ${item.title}`;
  return item.title;
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fa-IR");
}

export default function CustomersPanel() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
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
        throw new Error(body.error || "دریافت کاربران انجام نشد");
      }
      setCustomers(body.customers ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "دریافت کاربران انجام نشد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function confirmOrder(order: PublicShopOrder) {
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
      setCustomers((current) =>
        current.map((customer) => ({
          ...customer,
          orders: customer.orders.map((item) => (item.id === confirmed.id ? confirmed : item)),
        })),
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

  if (loading) {
    return <p className="text-muted">در حال دریافت کاربران...</p>;
  }

  if (error) {
    return <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">{error}</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">
        هنوز کاربری آنلاین نیست و سفارشی ثبت نشده است
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {customers.map((customer) => (
        <article key={customer.phone} className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-black text-foreground">{customer.name}</p>
              <p className="mt-1 text-sm text-muted" dir="ltr">
                {customer.phone}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                customer.online ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-muted"
              }`}
            >
              {customer.online ? "آنلاین" : "آفلاین"}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">آخرین بازدید: {formatWhen(customer.lastSeenAt)}</p>

          {customer.orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">سفارشی ثبت نشده است</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {customer.orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-border bg-background/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-cyan-400">{order.orderCode}</p>
                    <p className="text-sm text-foreground">{formatToman(order.amount)}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted">
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
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
