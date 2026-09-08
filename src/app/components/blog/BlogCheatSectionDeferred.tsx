"use client";

import { useEffect, useRef, useState } from "react";

import type { BlogGameSection } from "@/app/data/blog";

import BlogCheatGameBlock from "./BlogCheatGameBlock";

type Props = {
  section: BlogGameSection;
  index: number;
  postSlug?: string;
};

export default function BlogCheatSectionDeferred({
  section,
  index,
  postSlug,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(index === 0);

  useEffect(() => {
    if (index === 0) return;

    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [index]);

  const visibleGames = isNearViewport
    ? section.games
    : section.games.slice(0, 1);

  return (
    <section
      ref={sectionRef}
      id={section.id}
      className="scroll-mt-28 border-t border-border py-14 first:border-t-0 first:pt-0"
      aria-labelledby={`blog-section-${section.id}`}
    >
      <div>
        <h2
          id={`blog-section-${section.id}`}
          className="text-2xl font-black md:text-3xl"
        >
          {section.title}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
          {section.description}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {visibleGames.map((game, gameIndex) => (
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
