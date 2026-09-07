"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Package,
  Palette,
  Search,
  Truck,
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "reviewing"
  | "producing"
  | "ready"
  | "completed";

type Order = {
  trackingCode: string;
  name: string;
  phone: string;
  phoneModel?: string;
  device?: string;
  designType?: string;
  caseTitle?: string;
  issue?: string;
  status: OrderStatus | string;
  createdAt: string;
};

const STATUS_STEPS: {
  key: OrderStatus;
  title: string;
  description: string;
  icon: typeof CheckCircle2;
}[] = [
  {
    key: "pending",
    title: "سفارش ثبت شد",
    description: "سفارش شما با موفقیت ثبت شده است.",
    icon: CheckCircle2,
  },
  {
    key: "reviewing",
    title: "در حال بررسی",
    description: "جزئیات سفارش و طرح در حال بررسی است.",
    icon: Clock3,
  },
  {
    key: "producing",
    title: "در حال تولید",
    description: "قاب در حال چاپ و آماده‌سازی است.",
    icon: Palette,
  },
  {
    key: "ready",
    title: "آماده ارسال",
    description: "سفارش آماده ارسال یا تحویل است.",
    icon: Package,
  },
  {
    key: "completed",
    title: "تحویل شده",
    description: "سفارش به شما تحویل داده شده است.",
    icon: Truck,
  },
];

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "reviewing",
  "producing",
  "ready",
  "completed",
];

function normalizeStatus(status: string): OrderStatus {
  if (status === "checking") return "reviewing";
  if (status === "repairing") return "producing";
  if (STATUS_ORDER.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }
  return "pending";
}

function getStepState(
  step: OrderStatus,
  current: OrderStatus,
): "done" | "active" | "upcoming" {
  const stepIndex = STATUS_ORDER.indexOf(step);
  const currentIndex = STATUS_ORDER.indexOf(current);

  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

export default function TrackingPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("کد رهگیری را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${trimmed}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "سفارش پیدا نشد");
        return;
      }

      setOrder(data.order);
    } catch {
      setError("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }

  const currentStatus = order ? normalizeStatus(order.status) : null;

  return (
    <div className="min-h-screen px-6 py-8 pt-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/10">
            <Search className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="text-4xl font-black text-white">پیگیری سفارش</h1>
          <p className="mt-3 text-zinc-400">
            کد رهگیری سفارش قاب خود را وارد کنید
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-10 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد رهگیری"
            dir="ltr"
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-amber-500 px-8 py-4 font-bold text-black transition hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? "در حال جستجو..." : "جستجو"}
          </button>
        </form>

        {error ? (
          <p className="mb-6 text-center text-red-400">{error}</p>
        ) : null}

        {order && currentStatus ? (
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-zinc-500">کد رهگیری</p>
              <p className="mt-1 text-2xl font-black tracking-widest text-amber-400">
                {order.trackingCode}
              </p>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-zinc-500">نام: </span>
                  {order.name}
                </p>
                <p>
                  <span className="text-zinc-500">مدل: </span>
                  {order.phoneModel || order.device}
                </p>
                <p>
                  <span className="text-zinc-500">نوع: </span>
                  {order.designType === "custom"
                    ? "سفارشی"
                    : order.caseTitle || order.issue || "آماده"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {STATUS_STEPS.map((step) => {
                const state = getStepState(step.key, currentStatus);
                const Icon = step.icon;
                return (
                  <div
                    key={step.key}
                    className={`flex gap-4 rounded-2xl border p-4 ${
                      state === "active"
                        ? "border-amber-400/40 bg-amber-500/10"
                        : state === "done"
                          ? "border-white/10 bg-white/5"
                          : "border-white/5 bg-transparent opacity-50"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
