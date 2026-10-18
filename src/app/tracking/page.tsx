"use client";

import { useState } from "react";
import { CheckCircle2, Package, Search, Truck } from "lucide-react";

type ShopOrderStatus = "receipt_uploaded" | "paid" | "confirmed";

type TrackedOrder = {
  orderCode: string;
  status: ShopOrderStatus;
  createdAt: string;
  summary: string;
};

const STATUS_STEPS: {
  key: ShopOrderStatus;
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  iconWrapClass: string;
  iconClass: string;
}[] = [
  {
    key: "receipt_uploaded",
    title: "سفارش ثبت شد",
    description: "سفارش قاب ثبت شده و در انتظار تأیید پرداخت است.",
    icon: CheckCircle2,
    iconWrapClass: "bg-cyan-500/10",
    iconClass: "text-cyan-400",
  },
  {
    key: "paid",
    title: "در حال چاپ",
    description: "پرداخت انجام شده و قاب در حال چاپ است.",
    icon: Package,
    iconWrapClass: "bg-purple-500/10",
    iconClass: "text-purple-400",
  },
  {
    key: "confirmed",
    title: "آماده ارسال",
    description: "چاپ تأیید شده و قاب آماده ارسال است.",
    icon: Truck,
    iconWrapClass: "bg-green-500/10",
    iconClass: "text-green-400",
  },
];

const STATUS_ORDER: ShopOrderStatus[] = ["receipt_uploaded", "paid", "confirmed"];

function getStepState(step: ShopOrderStatus, current: ShopOrderStatus): "done" | "active" | "upcoming" {
  const stepIndex = STATUS_ORDER.indexOf(step);
  const currentIndex = STATUS_ORDER.indexOf(current);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

export default function TrackingPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setOrder(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("کد سفارش را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/shop/orders/track?code=${encodeURIComponent(trimmed)}`);
      const data = (await response.json()) as { success?: boolean; order?: TrackedOrder; message?: string };
      if (!response.ok || !data.success || !data.order) {
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

  return (
    <main id="main" tabIndex={-1} className="min-h-screen px-6 py-8 outline-none">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">پیگیری سفارش</h1>
          <p className="text-muted leading-8">کد سفارش را وارد کنید تا وضعیت چاپ و ارسال قاب را ببینید.</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row gap-3">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="کد سفارش"
            className="flex-1 rounded-2xl border border-border bg-surface px-5 py-4 outline-none focus:border-cyan-500 tracking-widest"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-black disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? "در حال جستجو..." : "جستجو"}
          </button>
        </form>

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
        ) : null}

        {order ? (
          <div className="rounded-3xl border border-border bg-surface backdrop-blur-xl p-8">
            <div className="mb-8">
              <span className="text-muted text-sm">کد سفارش</span>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
                <span className="text-2xl font-black tracking-widest text-cyan-400">{order.orderCode}</span>
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <div className="mb-8 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">قاب:</span>
                <p className="mt-1">{order.summary}</p>
              </div>
              <div>
                <span className="text-muted">تاریخ:</span>
                <p className="mt-1">{new Date(order.createdAt).toLocaleDateString("fa-IR")}</p>
              </div>
            </div>

            <div className="space-y-6">
              {STATUS_STEPS.map((step) => {
                const state = getStepState(step.key, order.status);
                const Icon = step.icon;
                return (
                  <div
                    key={step.key}
                    className={`flex gap-4 rounded-2xl border border-border bg-surface p-5 ${state === "upcoming" ? "opacity-50" : ""}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${step.iconWrapClass} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${step.iconClass}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted text-sm leading-7">
                        {state === "active"
                          ? step.description
                          : state === "done"
                            ? "این مرحله تکمیل شده است."
                            : "هنوز به این مرحله نرسیده‌اید."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
