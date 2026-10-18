"use client";

import { useAuth } from "@/app/context/AuthContext";
import { AdminNav } from "@/app/components/admin/AdminShell";
import ShopOrdersPanel from "@/app/components/admin/ShopOrdersPanel";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();

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

  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-[#050816] text-foreground p-6 md:p-10">
      <div className="max-w-7xl mx-auto pt-14">
        <div className="mb-10">
          <AdminNav />
          <h1 className="text-4xl font-black text-cyan-400 mb-3">پنل مدیریت</h1>
          <p className="text-muted">مدیریت سفارش‌های قاب و چاپ</p>
        </div>
        <ShopOrdersPanel />
      </div>
    </main>
  );
}
