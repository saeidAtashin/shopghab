import Link from "next/link";

type Props = {
  heading: string;
  intro: string;
  showCtas?: boolean;
};

export default function CatalogSeoIntro({ heading, intro, showCtas = true }: Props) {
  return (
    <header className="mt-4">
      <h1 className="text-2xl font-black text-foreground sm:text-3xl">{heading}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-8 text-muted sm:text-base">{intro}</p>
      {showCtas ? (
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          <Link href="/create" className="text-cyan-600 hover:underline dark:text-cyan-400">
            طراحی قاب اختصاصی
          </Link>
          <Link href="/phones/apple" className="text-cyan-600 hover:underline dark:text-cyan-400">
            خرید قاب آیفون
          </Link>
          <Link href="/phones/samsung" className="text-cyan-600 hover:underline dark:text-cyan-400">
            خرید قاب سامسونگ
          </Link>
          <Link href="/designs" className="text-cyan-600 hover:underline dark:text-cyan-400">
            همه طرح‌های آماده
          </Link>
        </p>
      ) : null}
    </header>
  );
}
