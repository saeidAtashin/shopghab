"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api-client";
import {
  buildDeviceNameMap,
  fetchProblemTypeNameMap,
  fetchRepairDevices,
  fetchRepairRequests,
  mapRepairRequestToAdminOrder,
} from "@/lib/repair/api";
import {
  BACKEND_REPAIR_STATUSES,
  getRepairStatusLabel,
} from "@/lib/repair-status";

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
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || user.role !== "admin") return;

    async function loadOrders() {
      try {
        const [requests, devices] = await Promise.all([
          fetchRepairRequests(),
          fetchRepairDevices(),
        ]);

        const deviceNames = buildDeviceNameMap(devices);
        const problemNames = await fetchProblemTypeNameMap(
          requests.map((request) => request.device_type),
        );

        setOrders(
          requests.map((request, index) =>
            mapRepairRequestToAdminOrder(
              request,
              index,
              deviceNames,
              problemNames,
            ),
          ),
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setOrders([]);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted">در حال بارگذاری...</p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <h1 className="text-3xl text-red-500">شما دسترسی ندارید</h1>
      </main>
    );
  }

  async function updateStatus(code: string, status: string) {
    try {
      await apiRequest(`/api/admin/orders/${code}`, {
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
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen  bg-[#050816] text-foreground p-6 md:p-10">
      <div className="max-w-7xl mx-auto pt-14">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-cyan-400 mb-3">پنل مدیریت</h1>

          <p className="text-muted">
            مدیریت سفارشات تعمیر و وضعیت دستگاه‌ها
          </p>
        </div>

        {loading ? (
          <div className="text-muted">در حال دریافت سفارشات...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">
            هنوز سفارشی ثبت نشده است
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.trackingCode}
                className="rounded-3xl border border-border bg-surface backdrop-blur-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted text-sm">شناسه درخواست</span>

                      <h2 className="text-2xl font-black text-cyan-400 tracking-widest">
                        {order.trackingCode}
                      </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted">نام مشتری:</span>

                        <p className="mt-1 text-foreground">{order.name}</p>
                      </div>

                      <div>
                        <span className="text-muted">شماره تماس:</span>

                        <p className="mt-1 text-foreground">{order.phone}</p>
                      </div>

                      <div>
                        <span className="text-muted">دستگاه:</span>

                        <p className="mt-1 text-foreground">{order.device}</p>
                      </div>

                      <div>
                        <span className="text-muted">مشکل:</span>

                        <p className="mt-1 text-foreground">{order.issue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[220px]">
                    <label className="block text-sm text-muted mb-2">
                      وضعیت سفارش
                    </label>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.trackingCode, e.target.value)
                      }
                      className="w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500"
                    >
                      {BACKEND_REPAIR_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {getRepairStatusLabel(status)}
                        </option>
                      ))}
                    </select>

                    {order.createdAt && (
                      <div className="mt-4 text-xs text-muted">
                        ثبت:{" "}
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </div>
                    )}
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
