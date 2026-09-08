import Link from "next/link";
import { footerInfoLinks, footerQuickLinks } from "@/lib/site-nav";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-card/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-bold text-foreground">قاب‌کده</p>
            <p className="text-sm leading-7 text-muted">
              طراحی و فروش قاب موبایل اختصاصی با چاپ با کیفیت و ارسال سریع.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-cyan-400">دسترسی سریع</p>
            <div className="flex flex-wrap gap-3">
              {footerQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-cyan-400/50 hover:text-foreground"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-cyan-400">اطلاعات</p>
            <div className="flex flex-wrap gap-3">
              {footerInfoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-cyan-400/50 hover:text-foreground"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-cyan-400">ارتباط</p>
            <p className="text-sm text-muted">تلفن: ۰۹۱۰۷۷۰۱۷۰۴</p>
            <p className="text-sm text-muted">تهران، ایران</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          © {year} قاب‌کده — تمامی حقوق محفوظ است
        </p>
      </div>
    </footer>
  );
}
