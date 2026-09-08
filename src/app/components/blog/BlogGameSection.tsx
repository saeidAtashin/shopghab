import FadeUp from "@/app/components/animations/FadeUp";
import type { BlogGameSection } from "@/app/data/blog";

import BlogGameCard from "./BlogGameCard";

type Props = {
  section: BlogGameSection;
  index: number;
};

export default function BlogGameSectionBlock({ section, index }: Props) {
  return (
    <section
      id={section.id}
      className="scroll-mt-28 border-t border-border py-14 first:border-t-0 first:pt-0"
      aria-labelledby={`blog-section-${section.id}`}
    >
      <FadeUp delay={index * 0.05}>
        <h2
          id={`blog-section-${section.id}`}
          className="text-2xl font-black md:text-3xl"
        >
          {section.title}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          {section.description}
        </p>
      </FadeUp>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {section.games.map((game, gameIndex) => (
          <BlogGameCard
            key={`${section.id}-${game.name}`}
            game={game}
            index={gameIndex}
            className="sm:w-full"
          />
        ))}
      </div>
    </section>
  );
}
