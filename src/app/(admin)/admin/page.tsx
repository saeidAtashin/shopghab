"use client";

import { useAuth } from "@/app/context/AuthContext";
import { AdminNav } from "@/app/components/admin/AdminShell";
import ShopOrdersPanel from "@/app/components/admin/ShopOrdersPanel";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import {
  buildDeviceNameMap,
  fetchAllRepairRequests,
  fetchProblemTypeNameMap,
  fetchRepairDevices,
  mapRepairRequestToAdminOrder,
  updateRepairRequest,
  type AdminRepairOrder,
  type RepairRequestStatus,
} from "@/lib/repair/api";
import {
  BACKEND_REPAIR_STATUSES,
  getRepairStatusLabel,
} from "@/lib/repair-status";

type Draft = {
  estimated: string;
  finalPrice: string;
  note: string;
};

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

function draftFromOrder(order: AdminRepairOrder): Draft {
  return {
    estimated: order.estimatedPrice == null ? "" : String(order.estimatedPrice),
    finalPrice: order.finalPrice == null ? "" : String(order.finalPrice),
    note: order.adminNote,
  };
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("قیمت باید عدد صفر یا بزرگ‌تر باشد");
  }
  return parsed;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function repairImageSrc(image: string): string {
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/")) return `https://api.k3isonfire.ir${image}`;
  return image;
}

function applyUpdatedOrder(
  current: AdminRepairOrder,
  updated: Awaited<ReturnType<typeof updateRepairRequest>>,
): AdminRepairOrder {
  return {
    ...current,
    status: updated.status ?? current.status,
    estimatedPrice: updated.estimated_price ?? null,
    finalPrice: updated.final_price ?? null,
    adminNote: updated.admin_note ?? "",
    description: updated.description?.trim() || current.description,
    image: updated.image?.trim() ? updated.image : current.image,
  };
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AdminRepairOrder[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cardError, setCardError] = useState<Record<string, string>>({});
  const [cardNotice, setCardNotice] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading || !user || user.role !== "admin") return;

    async function loadOrders() {
      try {
        const [requests, devices] = await Promise.all([
          fetchAllRepairRequests(),
          fetchRepairDevices(),
        ]);

        const deviceNames = buildDeviceNameMap(devices);
        const problemNames = await fetchProblemTypeNameMap(
          requests.map((request) => request.device_type),
        );

        const nextOrders = requests.map((request, index) =>
          mapRepairRequestToAdminOrder(request, index, deviceNames, problemNames),
        );
        setOrders(nextOrders);
        setDrafts(Object.fromEntries(nextOrders.map((order) => [order.trackingCode, draftFromOrder(order)])));
        setLoadError("");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setOrders([]);
          setLoadError("برای دیدن سفارش‌ها باید با حساب مدیر وارد شده باشید.");
        } else {
          setLoadError(errorMessage(error, "دریافت سفارش‌ها انجام نشد"));
        }
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted">در حال بارگذاری...</p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <h1 className="text-3xl text-red-500">شما دسترسی ندارید</h1>
      </main>
    );
  }

  function patchDraft(code: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [code]: { ...(current[code] ?? { estimated: "", finalPrice: "", note: "" }), ...patch },
    }));
  }

  async function updateStatus(order: AdminRepairOrder, status: RepairRequestStatus) {
    if (order.id == null) return;
    setCardError((current) => ({ ...current, [order.trackingCode]: "" }));
    setCardNotice((current) => ({ ...current, [order.trackingCode]: "" }));
    setBusyId(order.id);
    try {
      const updated = await updateRepairRequest(order.id, { status });
      setOrders((prev) =>
        prev.map((item) =>
          item.trackingCode === order.trackingCode ? applyUpdatedOrder(item, updated) : item,
        ),
      );
      setCardNotice((current) => ({ ...current, [order.trackingCode]: "وضعیت ذخیره شد." }));
    } catch (error) {
      setCardError((current) => ({
        ...current,
        [order.trackingCode]: errorMessage(error, "ذخیره وضعیت انجام نشد"),
      }));
    } finally {
      setBusyId(null);
    }
  }

  async function saveDetails(order: AdminRepairOrder) {
    if (order.id == null) return;
    const draft = drafts[order.trackingCode] ?? draftFromOrder(order);
    setCardError((current) => ({ ...current, [order.trackingCode]: "" }));
    setCardNotice((current) => ({ ...current, [order.trackingCode]: "" }));
    setBusyId(order.id);
    try {
      const updated = await updateRepairRequest(order.id, {
        estimated_price: parsePrice(draft.estimated),
        final_price: parsePrice(draft.finalPrice),
        admin_note: draft.note.trim() ? draft.note.trim() : null,
      });
      const next = applyUpdatedOrder(order, updated);
      setOrders((prev) =>
        prev.map((item) => (item.trackingCode === order.trackingCode ? next : item)),
      );
      setDrafts((current) => ({ ...current, [order.trackingCode]: draftFromOrder(next) }));
      setCardNotice((current) => ({ ...current, [order.trackingCode]: "قیمت و یادداشت ذخیره شد." }));
    } catch (error) {
      setCardError((current) => ({
        ...current,
        [order.trackingCode]: errorMessage(error, "ذخیره جزئیات انجام نشد"),
      }));
    } finally {
      setBusyId(null);
    }
  }

  const visible =
    statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter);

  return (
    <main id="main" tabIndex={-1} className="min-h-screen  bg-[#050816] text-foreground p-6 md:p-10">
      <div className="max-w-7xl mx-auto pt-14">
        <div className="mb-10">
          <AdminNav />
          <h1 className="text-4xl font-black text-cyan-400 mb-3">پنل مدیریت</h1>
          <p className="text-muted">مدیریت سفارشات فروشگاه، تعمیر و وضعیت دستگاه‌ها</p>
        </div>

        <ShopOrdersPanel />

        <h2 className="mb-6 text-2xl font-black text-foreground">سفارشات تعمیر</h2>

        <label className="mb-6 block max-w-xs text-sm text-muted">
          فیلتر وضعیت
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} mt-2`}
          >
            <option value="all">همه وضعیت‌ها</option>
            {BACKEND_REPAIR_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getRepairStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        {loading ? (
          <div className="text-muted">در حال دریافت سفارشات...</div>
        ) : loadError ? (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">{loadError}</div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface p-10 text-center text-muted">
            {orders.length === 0 ? "هنوز سفارشی ثبت نشده است" : "سفارشی با این وضعیت نیست"}
          </div>
        ) : (
          <div className="grid gap-6">
            {visible.map((order) => {
              const draft = drafts[order.trackingCode] ?? draftFromOrder(order);
              const locked = order.id == null || busyId === order.id;
              return (
                <div
                  key={order.trackingCode}
                  className="rounded-3xl border border-border bg-surface backdrop-blur-xl p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <span className="text-muted text-sm">شناسه درخواست</span>
                        <h2 className="text-2xl font-black text-cyan-400 tracking-widest">
                          {order.trackingCode}
                        </h2>
                      </div>

                      <div className="grid gap-4 text-sm sm:grid-cols-2">
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

                      {order.description ? (
                        <div className="text-sm">
                          <span className="text-muted">توضیحات:</span>
                          <p className="mt-1 whitespace-pre-wrap text-foreground">{order.description}</p>
                        </div>
                      ) : null}

                      {order.image ? (
                        <img
                          src={repairImageSrc(order.image)}
                          alt=""
                          className="h-28 w-28 rounded-2xl border border-border object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="grid min-w-[240px] gap-3 lg:w-72">
                      <label className="block text-sm text-muted">
                        وضعیت سفارش
                        <select
                          value={order.status}
                          disabled={locked}
                          onChange={(event) =>
                            void updateStatus(order, event.target.value as RepairRequestStatus)
                          }
                          className={`${inputClass} mt-2 disabled:opacity-60`}
                        >
                          {BACKEND_REPAIR_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {getRepairStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm text-muted">
                        قیمت برآورد
                        <input
                          value={draft.estimated}
                          inputMode="decimal"
                          disabled={locked}
                          onChange={(event) =>
                            patchDraft(order.trackingCode, { estimated: event.target.value })
                          }
                          className={`${inputClass} mt-2 disabled:opacity-60`}
                        />
                      </label>
                      <label className="block text-sm text-muted">
                        قیمت نهایی
                        <input
                          value={draft.finalPrice}
                          inputMode="decimal"
                          disabled={locked}
                          onChange={(event) =>
                            patchDraft(order.trackingCode, { finalPrice: event.target.value })
                          }
                          className={`${inputClass} mt-2 disabled:opacity-60`}
                        />
                      </label>
                      <label className="block text-sm text-muted">
                        یادداشت مدیر
                        <textarea
                          value={draft.note}
                          rows={3}
                          disabled={locked}
                          onChange={(event) => patchDraft(order.trackingCode, { note: event.target.value })}
                          className={`${inputClass} mt-2 disabled:opacity-60`}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => void saveDetails(order)}
                        className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black disabled:opacity-60"
                      >
                        {busyId === order.id ? "در حال ذخیره..." : "ذخیره"}
                      </button>
                      {order.id == null ? (
                        <p className="text-xs text-red-300">این درخواست شناسه ندارد و قابل ویرایش نیست.</p>
                      ) : null}
                      {cardNotice[order.trackingCode] ? (
                        <p className="text-xs text-cyan-300">{cardNotice[order.trackingCode]}</p>
                      ) : null}
                      {cardError[order.trackingCode] ? (
                        <p className="text-xs text-red-300">{cardError[order.trackingCode]}</p>
                      ) : null}
                      {order.createdAt ? (
                        <div className="text-xs text-muted">
                          ثبت: {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
