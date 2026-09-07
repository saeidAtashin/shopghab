"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Search, Smartphone, Palette } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import CaseOrderForm from "@/app/components/orders/CaseOrderForm";
import { getOrderStatusLabel } from "@/lib/repair-status";
import { SITE_PHONE, SITE_PHONE_DISPLAY } from "@/lib/seo/site";

type Order = {
  trackingCode: string;
  name: string;
  phone: string;
  phoneModel?: string;
  device?: string;
  designType?: string;
  caseTitle?: string;
  issue?: string;
  description: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showForm, setShowForm] = useState<"predesigned" | "custom" | null>(
    null,
  );

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/dashboard/orders");
      if (res.status === 401) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(data.orders ?? []);
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

    let cancelled = false;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/dashboard/orders");
        if (cancelled) return;
        if (res.status === 401) {
          setOrders([]);
          return;
        }
        const data = await res.json();
        setOrders(data.orders ?? []);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">در حال بارگذاری...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl text-red-500">شما دسترسی ندارید</h1>
      </main>
    );
  }

  if (user.role === "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0c0a09] pb-16 pt-24 text-white">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-10">
          <p className="text-sm text-amber-400">پنل کاربری</p>
          <h1 className="mt-2 text-4xl font-black text-white">
            سلام {user.name}
          </h1>
          {user.phone && (
            <p className="mt-2 text-zinc-400" dir="ltr">
              {user.phone}
            </p>
          )}
        </header>

        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href={`tel:${SITE_PHONE}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-bold text-black transition hover:from-amber-400 hover:to-orange-400"
          >
            <Phone className="h-5 w-5" />
            تماس با پشتیبانی ({SITE_PHONE_DISPLAY})
          </a>

          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:border-amber-500/40 hover:bg-white/10"
          >
            <Search className="h-5 w-5 text-amber-400" />
            پیگیری با کد رهگیری
          </Link>

          <Link
            href="/cases"
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 font-bold text-amber-300 transition hover:bg-amber-500/20"
          >
            <Smartphone className="h-5 w-5" />
            قاب‌های آماده
          </Link>

          <button
            type="button"
            onClick={() =>
              setShowForm((prev) => (prev === "custom" ? null : "custom"))
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-3 font-bold text-rose-300 transition hover:bg-rose-500/20"
          >
            <Palette className="h-5 w-5" />
            {showForm === "custom" ? "بستن فرم" : "سفارش سفارشی"}
          </button>
        </div>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-amber-400">
            سفارشات من
          </h2>

          {ordersLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
              در حال دریافت سفارشات...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
              <p className="text-lg text-zinc-300">سفارشی ثبت نشده است</p>
              <p className="mt-2 text-sm text-zinc-500">
                از قاب‌های آماده یا فرم سفارشی اولین سفارش خود را ثبت کنید.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article
                  key={order.trackingCode}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-zinc-500">کد رهگیری</span>
                        <p className="text-2xl font-black tracking-widest text-amber-400">
                          {order.trackingCode}
                        </p>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <span className="text-zinc-500">مدل:</span>
                          <p className="mt-1 text-white">
                            {order.phoneModel || order.device}
                          </p>
                        </div>
                        <div>
                          <span className="text-zinc-500">نوع:</span>
                          <p className="mt-1 text-white">
                            {order.designType === "custom"
                              ? "سفارشی"
                              : order.caseTitle || order.issue || "آماده"}
                          </p>
                        </div>
                      </div>

                      {order.description && (
                        <p className="text-sm text-zinc-400">
                          {order.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-300">
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <p className="mt-3 text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {showForm === "custom" && (
          <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <CaseOrderForm
              designType="custom"
              submitLabel="ثبت سفارش سفارشی"
            />
            <button
              type="button"
              className="mt-4 text-sm text-zinc-400"
              onClick={() => {
                void loadOrders();
                setShowForm(null);
              }}
            >
              بستن و بروزرسانی لیست
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
