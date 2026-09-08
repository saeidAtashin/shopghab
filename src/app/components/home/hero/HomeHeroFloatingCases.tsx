"use client";

import Image from "next/image";

import type { CaseTemplate } from "@/lib/design/types";
import HomeHeroGlassCard from "./HomeHeroGlassCard";
import { HERO_FLOATING_POSITIONS } from "./hero.constants";

type Props = {
  templates: CaseTemplate[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function HomeHeroFloatingCases({
  templates,
  activeIndex,
  onSelect,
}: Props) {
  return (
    <>
      {HERO_FLOATING_POSITIONS.map((position, index) => {
        const template = templates[index];
        if (!template) return null;

        const isActive = activeIndex === index;

        return (
          <div
            key={template.id}
            className={`absolute z-10 ${position.hideOnMobile ? "hidden sm:block" : ""}`}
            style={{
              top: "top" in position ? position.top : undefined,
              bottom: "bottom" in position ? position.bottom : undefined,
              left: "left" in position ? position.left : undefined,
              right: "right" in position ? position.right : undefined,
            }}
          >
            <HomeHeroGlassCard
              animateY={[0, -8 - index * 2, 0]}
              duration={position.duration}
              delay={position.delay}
              onClick={() => onSelect(index)}
              ariaLabel={`نمایش طراحی ${template.title}`}
              className={isActive ? "border-cyan-500/40 ring-1 ring-cyan-500/30" : undefined}
            >
              <Image
                src={template.thumbnail}
                alt=""
                width={52}
                height={52}
                className="rounded-xl object-contain"
              />
              <p className="mt-1.5 max-w-[72px] truncate text-[10px] font-medium text-muted">
                {template.title}
              </p>
            </HomeHeroGlassCard>
          </div>
        );
      })}
    </>
  );
}
