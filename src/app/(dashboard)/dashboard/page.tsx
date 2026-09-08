"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Search, Palette, ShoppingBag } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { SITE_PHONE } from "@/lib/seo/site";
import { apiRequest, ApiError } from "@/lib/api-client";

type Order = {
  orderCode: string;
  status: string;
  amount: number;
  createdAt: string;
};

const DISPLAY_PHONE = "09107701704";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await apiRequest<{ orders?: Order[] }>("/shop/orders");
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      router.replace("/admin");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user || user.role !== "user") return;
    void loadOrders();
  }, [authLoading, user, loadOrders]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted">در حال بارگذاری...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <h1 className="text-3xl text-red-500">شما دسترسی ندارید</h1>
      </main>
    );
  }

  if (user.role === "admin") return null;

  return (
    <main className="min-h-screen bg-[#030510] pt-24 pb-16 text-foreground">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-10">
          <p className="text-sm text-cyan-400">پنل کاربری</p>
          <h1 className="mt-2 text-4xl font-black">سلام {user.name}</h1>
          {user.phone ? (
            <p className="mt-2 text-muted" dir="ltr">
              {user.phone}
            </p>
          ) : null}
        </header>

        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href={`tel:${SITE_PHONE}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-bold text-black"
          >
            <Phone className="h-5 w-5" />
            پشتیبانی ({DISPLAY_PHONE})
          </a>
          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3 font-bold"
          >
            <Search className="h-5 w-5 text-cyan-400" />
            پیگیری سفارش
          </Link>
          <Link
            href="/dashboard/designs"
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 font-bold text-cyan-300"
          >
            <Palette className="h-5 w-5" />
            طراحی‌های من
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-2xl border border-border px-6 py-3 font-bold"
          >
            <ShoppingBag className="h-5 w-5 text-cyan-400" />
            طراحی جدید
          </Link>
        </div>

        <section>
          <h2 className="mb-6 text-2xl font-bold text-cyan-400">سفارشات من</h2>
          {ordersLoading ? (
            <div className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">
              در حال دریافت سفارشات...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-border bg-surface p-10 text-center">
              <p className="text-lg text-muted">سفارشی ثبت نشده است</p>
              <Link href="/create" className="mt-4 inline-block text-cyan-400">
                شروع طراحی قاب
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article
                  key={order.orderCode}
                  className="rounded-3xl border border-border bg-surface p-6"
                >
                  <p className="text-xs text-muted">کد سفارش</p>
                  <p className="text-xl font-black text-cyan-400">{order.orderCode}</p>
                  <p className="mt-2 text-sm text-muted">{order.status}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
