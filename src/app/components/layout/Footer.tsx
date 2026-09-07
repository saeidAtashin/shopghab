import Link from "next/link";
import { footerInfoLinks, footerQuickLinks } from "@/lib/site-nav";
import {
  SITE_ADDRESS,
  SITE_NAME,
  SITE_PHONE,
  SITE_PHONE_DISPLAY,
} from "@/lib/seo/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-lg font-bold text-white">{SITE_NAME}</p>
            <p className="text-sm leading-7 text-zinc-400">
              مرکز تخصصی تعمیرات پلی‌استیشن، ایکس‌باکس و دسته بازی با پشتیبانی
              سریع.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-cyan-400">دسترسی سریع</p>
            <div className="flex flex-wrap gap-3">
              {footerQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-cyan-400/50 hover:text-white"
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
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-cyan-400/50 hover:text-white"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-cyan-400">ارتباط</p>
            <a
              href={`tel:${SITE_PHONE}`}
              className="block text-sm text-zinc-400 transition-colors hover:text-cyan-400"
              dir="ltr"
            >
              تلفن: {SITE_PHONE_DISPLAY}
            </a>
            <p className="text-sm text-zinc-400">
              آدرس: {SITE_ADDRESS.streetAddress}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/2 p-4">
          <p className="text-sm font-semibold text-cyan-400">مجوز های ما</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex h-16 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xs text-zinc-500"
              >
                جای لوگو
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-zinc-500">
          {`© ${year} FixBazi. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
