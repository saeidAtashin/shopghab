"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/app/context/AuthContext";

const LINKS = [
  { href: "/admin", label: "سفارش‌ها" },
  { href: "/admin/designs", label: "طرح‌ها" },
  { href: "/admin/categories", label: "دسته‌ها" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="بخش‌های مدیریت" className="mb-8 flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              active
                ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-300"
                : "border-border text-muted hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-foreground">
        <p className="text-muted">در حال بارگذاری...</p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-foreground">
        <h1 className="text-3xl text-red-500">شما دسترسی ندارید</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] p-6 text-foreground md:p-10">
      <div className="mx-auto max-w-7xl pt-14">
        <AdminNav />
        <h1 className="mb-3 text-4xl font-black text-cyan-400">{title}</h1>
        {description ? <p className="mb-8 text-muted">{description}</p> : null}
        {children}
      </div>
    </main>
  );
}

export async function adminJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || "درخواست انجام نشد");
  }
  return body;
}
