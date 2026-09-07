"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";

type Order = {
  trackingCode: string;
  name: string;
  phone: string;
  phoneModel?: string;
  device?: string;
  designType?: string;
  caseTitle?: string;
  issue?: string;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(async (res) => {
        if (res.status === 401) {
          setOrders([]);
          return;
        }
        const data = await res.json();
        setOrders(data.orders || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl text-red-500">شما دسترسی ندارید</h1>
      </main>
    );
  }

  async function updateStatus(code: string, status: string) {
    await fetch(`/api/admin/orders/${code}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.trackingCode === code ? { ...order, status } : order,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#0c0a09] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl pt-14">
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-black text-amber-400">
            پنل مدیریت
          </h1>
          <p className="text-zinc-400">مدیریت سفارشات قاب و وضعیت آماده‌سازی</p>
        </div>

        {loading ? (
          <div className="text-zinc-400">در حال دریافت سفارشات...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            هنوز سفارشی ثبت نشده است
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.trackingCode}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-zinc-500">کد رهگیری</span>
                      <h2 className="text-2xl font-black tracking-widest text-amber-400">
                        {order.trackingCode}
                      </h2>
                    </div>

                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <span className="text-zinc-500">نام مشتری:</span>
                        <p className="mt-1 text-white">{order.name}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">شماره تماس:</span>
                        <p className="mt-1 text-white">{order.phone}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">مدل گوشی:</span>
                        <p className="mt-1 text-white">
                          {order.phoneModel || order.device}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-500">نوع سفارش:</span>
                        <p className="mt-1 text-white">
                          {order.designType === "custom"
                            ? "سفارشی"
                            : order.caseTitle || order.issue || "آماده"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[220px]">
                    <label className="mb-2 block text-sm text-zinc-400">
                      وضعیت سفارش
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.trackingCode, e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-amber-500"
                    >
                      <option value="pending">در انتظار بررسی</option>
                      <option value="reviewing">در حال بررسی</option>
                      <option value="producing">در حال تولید</option>
                      <option value="ready">آماده ارسال</option>
                      <option value="completed">تحویل شده</option>
                    </select>
                    <div className="mt-4 text-xs text-zinc-500">
                      ثبت:{" "}
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
