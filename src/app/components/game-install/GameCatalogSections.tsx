import GameHorizontalRow from "@/app/components/game-install/GameHorizontalRow";
import { GAME_FILTERS } from "@/lib/game-filters";
import type { GameCatalogSection } from "@/lib/rawg";

type Props = {
  consoleSlug: string;
  sections: GameCatalogSection[];
};

export default function GameCatalogSections({
  consoleSlug,
  sections,
}: Props) {
  const visible = sections.filter((s) => s.games.length > 0);

  if (visible.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-zinc-400">
        بازی‌ای برای نمایش یافت نشد.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((section) => (
        <GameHorizontalRow
          key={section.filter}
          title={GAME_FILTERS[section.filter].label}
          filter={section.filter}
          consoleSlug={consoleSlug}
          games={section.games}
        />
      ))}
    </div>
  );
}
