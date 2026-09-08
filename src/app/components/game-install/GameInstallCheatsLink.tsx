import Link from "next/link";
import { ChevronLeft, Gamepad2 } from "lucide-react";

import {
  cheatGamePath,
  cheatHubPath,
  getCheatGamesForInstallConsole,
} from "@/lib/blog-cheats";
import { GAME_INSTALL_CONSOLE_META } from "@/lib/game-install-meta";

type Props = {
  consoleSlug: string;
};

export default function GameInstallCheatsLink({ consoleSlug }: Props) {
  const meta = GAME_INSTALL_CONSOLE_META[consoleSlug];
  const games = getCheatGamesForInstallConsole(consoleSlug, 6);

  if (!meta || games.length === 0) return null;

  return (
    <section className="mb-12 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-violet-400" aria-hidden />
          <h2 className="text-xl font-black text-violet-200">
            رمز و چیت بازی‌های {meta.label}
          </h2>
        </div>
        <Link
          href={cheatHubPath()}
          className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
        >
          همه ۴۰ بازی
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      <p className="mb-4 text-sm text-muted">
        کدهای تقلب و ترفندهای مخفی محبوب‌ترین بازی‌های {meta.label} — قبل یا
        بعد از نصب، از این راهنما استفاده کنید.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {games.map((game) => (
          <li key={game.gameSlug}>
            <Link
              href={cheatGamePath(game.gameSlug)}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground transition hover:border-violet-500/40 hover:text-violet-200"
            >
              <span>{game.name}</span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
