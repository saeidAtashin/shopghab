import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import HeroNeonField from "@/app/components/home/hero/HeroNeonField";
import {
  HERO_CTAS,
  HERO_DESCRIPTION_LINES,
  HERO_HEADING_ACCENT,
  HERO_HEADING_LEAD,
} from "@/app/components/home/hero/hero.constants";
import { cn } from "@/lib/utils";

const LANDING_IMAGE = {
  src: "/images/landing-shopghab.jpg",
  width: 1024,
  height: 948,
  alt: "قاب‌های گل‌دار و قاب پرتره روی صحنه تیره، همراه با پنل بارگذاری طرح",
} as const;

type Props = {
  className?: string;
};

export default function HomeHero({ className }: Props) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[#05070e] text-white",
        "xl:min-h-[26rem] xl:rounded-3xl xl:border xl:border-border",
        className,
      )}
    >
      <HeroNeonField />

      <div className="relative z-10 flex flex-col items-center px-4 pb-8 pt-4 xl:block xl:min-h-[26rem] xl:px-0 xl:py-0">
        <div className="relative aspect-[1024/948] w-full xl:absolute xl:inset-y-8 xl:end-8 xl:aspect-auto xl:w-[min(46%,26rem)]">
          <Image
            src={LANDING_IMAGE.src}
            alt={LANDING_IMAGE.alt}
            fill
            preload
            sizes="(min-width: 1280px) 26rem, 100vw"
            className="hero-landing-photo object-cover object-center xl:object-contain"
          />
        </div>

        <div className="mt-5 w-full max-w-xl text-center xl:relative xl:flex xl:min-h-[26rem] xl:w-1/2 xl:max-w-none xl:flex-col xl:justify-center xl:px-10 xl:py-10 xl:text-start">
          <h1 className="font-black leading-[1.2] tracking-tight">
            <span className="block text-[1.85rem] sm:text-4xl xl:text-4xl">{HERO_HEADING_LEAD}</span>
            <span className="mt-1 block text-[2.05rem] text-[#2F6BFF] drop-shadow-[0_0_24px_rgba(47,107,255,0.45)] sm:text-5xl xl:text-5xl">
              {HERO_HEADING_ACCENT}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#c5cedf] sm:text-base xl:mx-0">
            {HERO_DESCRIPTION_LINES[0]}
            <br />
            {HERO_DESCRIPTION_LINES[1]}
          </p>
          <Link
            href={HERO_CTAS.primary.href}
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#2F6BFF] px-6 text-base font-bold text-white shadow-[0_14px_40px_-12px_rgba(47,107,255,0.95)] transition hover:bg-[#3d78ff] xl:w-auto xl:min-w-56 xl:px-8"
          >
            {HERO_CTAS.primary.label}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
