import Link from "next/link";
import { GENERIC_CUSTOM_MODEL } from "@/lib/cases/generic-model";
import { PhoneBackSvg } from "./PhoneBackSvg";

type Props = {
  query: string;
};

export default function ModelSearchNotFound({ query }: Props) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-card/60 p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground">
        مدل «{query}» دقیقاً در لیست ما پیدا نشد
      </h2>
      <p className="mt-2 text-sm leading-7 text-muted">
        نگران نباشید — می‌توانید همین حالا قاب طراحی کنید. اگر تفاوت دوربین یا ابعاد
        گوشی شما زیاد باشد، قبل از چاپ با شما هماهنگ می‌کنیم.
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex h-44 w-24 shrink-0 items-center justify-center rounded-xl border border-border bg-input-bg p-3">
          <PhoneBackSvg
            model={GENERIC_CUSTOM_MODEL}
            className="h-full w-auto max-w-full drop-shadow-lg"
          />
        </div>
        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
          <p className="text-center text-xs text-muted sm:text-right">
            نمونه پشت گوشی — برای طراحی قاب سفارشی
          </p>
          <Link
            href="/create/other/custom"
            className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-cyan-400 sm:w-auto"
          >
            طراحی قاب برای مدل من
          </Link>
        </div>
      </div>
    </div>
  );
}
