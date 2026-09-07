import Link from "next/link";
import PageShell from "@/app/components/seo/PageShell";
import { createPageMetadata } from "@/lib/seo/metadata";
import { contactPageJsonLd } from "@/lib/seo/jsonld";
import {
  SITE_ADDRESS,
  SITE_HOURS,
  SITE_PHONE,
  SITE_PHONE_DISPLAY,
  whatsAppUrl,
} from "@/lib/seo/site";
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  HeadphonesIcon,
  Wrench,
} from "lucide-react";

const PATH = "/contact";
const TITLE = "تماس با FixBazi";
const DESCRIPTION = `راه‌های ارتباطی FixBazi (فیکس‌بازی) برای مشاوره، ثبت سفارش تعمیر و پیگیری. آدرس: ${SITE_ADDRESS.streetAddress}`;

const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=پاساژ+لیلا+توپخانه+تهران&output=embed";

export const metadata = createPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    "تماس با FixBazi",
    "فیکس‌بازی",
    "پشتیبانی تعمیر کنسول",
    "شماره تماس تعمیرات",
    "آدرس FixBazi",
  ],
});

const CONTACT_SCHEMA = contactPageJsonLd({
  name: TITLE,
  description: DESCRIPTION,
  path: PATH,
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black pt-24 text-white">
      <PageShell
        currentPath={PATH}
        containerClassName="container mx-auto px-6"
        className="container mx-auto px-6 pb-14"
        jsonLd={CONTACT_SCHEMA}
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black md:text-5xl">{TITLE}</h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            برای مشاوره رایگان، ثبت سفارش تعمیر یا پیگیری وضعیت دستگاه، از
            راه‌های زیر با FixBazi در ارتباط باشید.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <a
            href={`tel:${SITE_PHONE}`}
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-cyan-500/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500 text-black">
              <Phone size={28} />
            </div>
            <div className="text-right">
              <p className="text-sm text-cyan-400">تلفن پشتیبانی</p>
              <p className="mt-1 text-xl font-bold text-white" dir="ltr">
                {SITE_PHONE_DISPLAY}
              </p>
            </div>
          </a>

          <a
            href={whatsAppUrl("سلام، می‌خواهم درباره تعمیر کنسول مشاوره بگیرم.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-6 transition-colors hover:border-green-500/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500 text-white">
              <MessageCircle size={28} />
            </div>
            <div className="text-right">
              <p className="text-sm text-green-400">واتساپ</p>
              <p className="mt-1 text-lg font-bold text-white">
                مشاوره آنلاین و ارسال عکس
              </p>
            </div>
          </a>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 text-cyan-400">
              <Clock size={28} />
            </div>
            <div className="text-right">
              <p className="text-sm text-cyan-400">ساعات کاری</p>
              <p className="mt-1 text-lg font-medium text-white">{SITE_HOURS}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 text-cyan-400">
              <MapPin size={28} />
            </div>
            <div className="text-right">
              <p className="text-sm text-cyan-400">آدرس مرکز</p>
              <p className="mt-1 text-lg font-medium text-white">
                {SITE_ADDRESS.streetAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 p-6 text-center">
          <p className="text-sm text-zinc-400">
            <HeadphonesIcon size={16} className="inline ml-2 text-cyan-500" />
            چت آنلاین از طریق ویجت گفتگو در سایت — میانگین زمان پاسخگویی{" "}
            <span className="text-cyan-400">کمتر از ۱۵ دقیقه</span>
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="موقعیت FixBazi روی نقشه — پاساژ لیلا توپخانه"
            src={MAP_EMBED_URL}
            className="h-80 w-full grayscale invert-[0.9] contrast-[0.85]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/repair"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
          >
            <Wrench size={16} />
            ثبت سفارش تعمیر
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-cyan-400/50"
          >
            سوالات متداول
          </Link>
        </div>
      </PageShell>
    </main>
  );
}
