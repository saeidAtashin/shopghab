"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";

type Order = {
  trackingCode: string;
  name: string;
  phone: string;
  device: string;
  issue: string;
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
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
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
      body: JSON.stringify({
        status,
      }),
    });

    setOrders((prev) =>
      prev.map((order) =>
        order.trackingCode === code ? { ...order, status } : order,
      ),
    );
  }

  return (
    <main className="min-h-screen  bg-[#050816] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto pt-14">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-cyan-400 mb-3">پنل مدیریت</h1>

          <p className="text-zinc-400">
            مدیریت سفارشات تعمیر و وضعیت دستگاه‌ها
          </p>
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
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-zinc-500 text-sm">کد رهگیری</span>

                      <h2 className="text-2xl font-black text-cyan-400 tracking-widest">
                        {order.trackingCode}
                      </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500">نام مشتری:</span>

                        <p className="mt-1 text-white">{order.name}</p>
                      </div>

                      <div>
                        <span className="text-zinc-500">شماره تماس:</span>

                        <p className="mt-1 text-white">{order.phone}</p>
                      </div>

                      <div>
                        <span className="text-zinc-500">دستگاه:</span>

                        <p className="mt-1 text-white">{order.device}</p>
                      </div>

                      <div>
                        <span className="text-zinc-500">مشکل:</span>

                        <p className="mt-1 text-white">{order.issue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[220px]">
                    <label className="block text-sm text-zinc-400 mb-2">
                      وضعیت سفارش
                    </label>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.trackingCode, e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-cyan-500"
                    >
                      <option value="pending">در انتظار بررسی</option>

                      <option value="checking">در حال بررسی</option>

                      <option value="repairing">در حال تعمیر</option>

                      <option value="completed">آماده تحویل</option>
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


// tets cmnts