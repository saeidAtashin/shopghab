"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { verifyZarinPalPayment } from "@/lib/payments/zarinpal";

type Props = {
  searchParams: Promise<{
    orderId?: string;
    Authority?: string;
    Status?: string;
    local?: string;
    code?: string;
  }>;
};

export default function PaymentCallbackPage({ searchParams }: Props) {
  const params = use(searchParams);
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (params.local === "1") {
        setStatus("success");
        return;
      }
      if (!params.orderId || !params.Authority) {
        setStatus("failed");
        return;
      }
      try {
        const result = await verifyZarinPalPayment(params.Authority, params.orderId);
        if (result.success) {
          setStatus("success");
          setRefId(result.refId ?? null);
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    }
    void verify();
  }, [params]);

  return (
    <div className="mx-auto max-w-lg px-4 pt-32 pb-16 text-center">
      {status === "loading" ? (
        <p className="text-muted">در حال بررسی پرداخت...</p>
      ) : status === "success" ? (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-black text-foreground">پرداخت موفق</h1>
          <p className="mt-3 text-muted">
            سفارش شما ثبت شد
            {params.code ? ` — کد: ${params.code}` : ""}
          </p>
          {refId ? <p className="mt-2 text-sm text-muted">شماره پیگیری: {refId}</p> : null}
          <Link
            href="/tracking"
            className="mt-8 inline-block rounded-xl bg-cyan-500 px-8 py-3 text-sm font-bold text-black"
          >
            پیگیری سفارش
          </Link>
        </>
      ) : (
        <>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl text-red-400">
            ✕
          </div>
          <h1 className="text-2xl font-black text-foreground">پرداخت ناموفق</h1>
          <p className="mt-3 text-muted">لطفاً دوباره تلاش کنید</p>
          <Link
            href="/checkout"
            className="mt-8 inline-block rounded-xl border border-border px-8 py-3 text-sm font-bold text-foreground"
          >
            بازگشت به تسویه
          </Link>
        </>
      )}
    </div>
  );
}
