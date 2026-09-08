import FadeUp from "@/app/components/animations/FadeUp";
import type { BlogGameSection } from "@/app/data/blog";

import BlogCheatGameBlock from "./BlogCheatGameBlock";

type Props = {
  section: BlogGameSection;
  index: number;
  postSlug?: string;
};

export default function BlogCheatSection({ section, index, postSlug }: Props) {
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

      <div className="mt-8 flex flex-col gap-6">
        {section.games.map((game, gameIndex) => (
          <BlogCheatGameBlock
            key={`${section.id}-${game.slug ?? game.name}`}
            game={game}
            index={gameIndex}
            postSlug={postSlug}
          />
        ))}
      </div>
    </section>
  );
}
