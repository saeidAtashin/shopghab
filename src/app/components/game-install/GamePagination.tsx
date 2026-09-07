import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { gameListPath } from "@/lib/game-filters";
import type { GameFilterId } from "@/lib/game-filters";

type Props = {
  consoleSlug: string;
  filter: GameFilterId;
  page: number;
  hasNext: boolean;
  totalPages: number;
};

export default function GamePagination({
  consoleSlug,
  filter,
  page,
  hasNext,
  totalPages,
}: Props) {
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasNext ? page + 1 : null;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-4"
      aria-label="صفحه‌بندی"
    >
      {prevPage ? (
        <Link
          href={gameListPath(consoleSlug, filter, prevPage)}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-5 py-2.5 text-sm transition hover:border-cyan-400/30 hover:bg-white/5"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
          قبلی
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-white/5 px-5 py-2.5 text-sm text-zinc-600">
          <ChevronRight className="h-4 w-4" aria-hidden />
          قبلی
        </span>
      )}

      <span className="text-sm text-zinc-400">
        صفحه {page.toLocaleString("fa-IR")} از{" "}
        {totalPages.toLocaleString("fa-IR")}
      </span>

      {nextPage ? (
        <Link
          href={gameListPath(consoleSlug, filter, nextPage)}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-5 py-2.5 text-sm transition hover:border-cyan-400/30 hover:bg-white/5"
        >
          بعدی
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-white/5 px-5 py-2.5 text-sm text-zinc-600">
          بعدی
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
