import Link from "next/link";
import { developer } from "@/lib/developer";
import {
  SITE_ADDRESS_DISPLAY,
  SITE_BRAND,
  SITE_PHONE,
  SITE_PHONE_DISPLAY,
  SITE_WHATSAPP_URL,
} from "@/lib/seo/site";
import { footerInfoLinks, footerQuickLinks } from "@/lib/site-nav";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-card/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-bold text-foreground">{SITE_BRAND}</p>
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
            <a href={`tel:${SITE_PHONE}`} className="block text-sm text-muted">
              تلفن: {SITE_PHONE_DISPLAY}
            </a>
            <a href={SITE_WHATSAPP_URL} className="block text-sm text-muted" target="_blank" rel="noreferrer">
              واتساپ: {SITE_PHONE_DISPLAY}
            </a>
            <p className="text-sm text-muted">{SITE_ADDRESS_DISPLAY}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE_BRAND} — تمامی حقوق محفوظ است</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>
              {developer.creditLabel}: {developer.nameFa}
            </span>
            <a
              href={`mailto:${developer.email}`}
              className="transition-colors hover:text-cyan-400"
            >
              {developer.email}
            </a>
            <a
              href={developer.phoneHref}
              dir="ltr"
              className="transition-colors hover:text-cyan-400"
            >
              {developer.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
