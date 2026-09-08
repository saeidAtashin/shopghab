"use client";

import { useState } from "react";
import { CheckCircle2, Cpu, Wrench, Clock3, Search } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api-client";

type RepairStatus = "pending" | "checking" | "repairing" | "completed";

type Order = {
  trackingCode: string;
  name: string;
  phone: string;
  device: string;
  issue: string;
  status: RepairStatus;
  createdAt: string;
};

const STATUS_STEPS: {
  key: RepairStatus;
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  iconWrapClass: string;
  iconClass: string;
}[] = [
  {
    key: "pending",
    title: "درخواست ثبت شد",
    description: "درخواست شما با موفقیت در سیستم ثبت شده است.",
    icon: CheckCircle2,
    iconWrapClass: "bg-cyan-500/10",
    iconClass: "text-cyan-400",
  },
  {
    key: "checking",
    title: "در انتظار بررسی",
    description: "کارشناسان ما دستگاه شما را بررسی خواهند کرد.",
    icon: Clock3,
    iconWrapClass: "bg-yellow-500/10",
    iconClass: "text-yellow-400",
  },
  {
    key: "repairing",
    title: "در حال تعمیر",
    description: "دستگاه در حال تعمیر توسط تیم فنی است.",
    icon: Wrench,
    iconWrapClass: "bg-purple-500/10",
    iconClass: "text-purple-400",
  },
  {
    key: "completed",
    title: "آماده تحویل",
    description: "دستگاه آماده تحویل است.",
    icon: Cpu,
    iconWrapClass: "bg-green-500/10",
    iconClass: "text-green-400",
  },
];

const STATUS_ORDER: RepairStatus[] = [
  "pending",
  "checking",
  "repairing",
  "completed",
];

function getStepState(
  step: RepairStatus,
  current: RepairStatus,
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
      const data = await apiRequest<{ success?: boolean; order?: Order; message?: string }>(
        `/api/repair/orders/${trimmed}`,
      );

      if (!data.success || !data.order) {
        setError(data.message || "سفارش پیدا نشد");
        return;
      }

      setOrder(data.order);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("خطا در دریافت اطلاعات");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-8 min-h-screen">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-cyan-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4">پیگیری تعمیر</h1>

          <p className="text-muted leading-8">
            کد رهگیری خود را وارد کنید تا وضعیت دستگاه را ببینید.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-8 flex flex-col sm:flex-row gap-3"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="کد رهگیری"
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

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {order && (
          <div className="rounded-3xl border border-border bg-surface backdrop-blur-xl p-8">
            <div className="mb-8">
              <span className="text-muted text-sm">کد رهگیری</span>

              <div className="mt-3 flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
                <span className="text-2xl font-black tracking-widest text-cyan-400">
                  {order.trackingCode}
                </span>

                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <div className="mb-8 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted">دستگاه:</span>
                <p className="mt-1">{order.device}</p>
              </div>
              <div>
                <span className="text-muted">مشکل:</span>
                <p className="mt-1">{order.issue || "—"}</p>
              </div>
            </div>

            <div className="space-y-6">
              {STATUS_STEPS.map((step) => {
                const state = getStepState(step.key, order.status);
                const Icon = step.icon;
                const isUpcoming = state === "upcoming";

                return (
                  <div
                    key={step.key}
                    className={`flex gap-4 rounded-2xl border border-border bg-surface p-5 ${
                      isUpcoming ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${step.iconWrapClass} flex items-center justify-center`}
                    >
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
        )}
      </div>
    </div>
  );
}
