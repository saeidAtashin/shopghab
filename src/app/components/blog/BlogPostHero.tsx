"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

import type { BlogPost } from "@/app/data/blog";

import BlogFloatingOrbs from "./BlogFloatingOrbs";
import "./blog-animations.css";

type Props = {
  post: BlogPost;
};

export default function BlogPostHero({ post }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const publishedLabel = new Date(post.publishedAt).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="blog-scene relative mb-12 overflow-hidden rounded-[32px] border border-border bg-card/40">
      <BlogFloatingOrbs />

      <div className="relative grid gap-8 p-6 md:grid-cols-[1fr_280px] md:p-10 lg:grid-cols-[1fr_320px]">
        <div className="relative z-10 flex flex-col justify-center">
          {/* <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-4 flex flex-wrap gap-2"
          >
            {(post.kind === "cheats" ? post.sections : post.sections.slice(0, 3)).map(
              (section) => (
                <span
                  key={section.id}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted backdrop-blur-sm"
                >
                  {section.title.split(" ").slice(0, 5).join(" ")}
                </span>
              ),
            )}
          </motion.div> */}

          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-3xl font-black leading-tight md:text-4xl lg:text-5xl"
          >
            {post.title}
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 text-lg text-muted"
          >
            {post.excerpt}
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted"
          >
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-cyan-400" aria-hidden />
              <time dateTime={post.publishedAt}>{publishedLabel}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-violet-400" aria-hidden />
              {post.readTimeMinutes} دقیقه مطالعه
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="blog-tilt-frame blog-tilt relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl border border-border shadow-[0_24px_60px_-12px_rgba(34,211,238,0.2)]"
        >
          <Image
            src={post.coverImage}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
            aria-hidden
          />
        </motion.div>
      </div>
    </header>
  );
}
