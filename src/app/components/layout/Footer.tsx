import Link from "next/link";
import { footerInfoLinks, footerQuickLinks } from "@/lib/site-nav";
import {
  BRAND_SHORT,
  SITE_ADDRESS,
  SITE_PHONE,
  SITE_PHONE_DISPLAY,
} from "@/lib/seo/site";
import SiteLogo from "../ui/SiteLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <SiteLogo imageClassName="h-14 w-40" />
            <p className="text-sm leading-7 text-zinc-400">
              فروشگاه قاب گوشی آماده و طراحی سفارشی با چاپ باکیفیت و ارسال سریع.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-amber-400">دسترسی سریع</p>
            <div className="flex flex-wrap gap-3">
              {footerQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-amber-400/50 hover:text-white"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-amber-400">اطلاعات</p>
            <div className="flex flex-wrap gap-3">
              {footerInfoLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-amber-400/50 hover:text-white"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-amber-400">ارتباط</p>
            <a
              href={`tel:${SITE_PHONE}`}
              className="block text-sm text-zinc-400 transition-colors hover:text-amber-400"
              dir="ltr"
            >
              تلفن: {SITE_PHONE_DISPLAY}
            </a>
            <p className="text-sm text-zinc-400">
              آدرس: {SITE_ADDRESS.streetAddress}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-zinc-500">
          {`© ${year} ${BRAND_SHORT}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
