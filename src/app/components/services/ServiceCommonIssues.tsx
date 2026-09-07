"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import "./rdr-common-issues.css";

type Issue = {
  slug: string;
  title: string;
};

type ServiceCommonIssuesProps = {
  issues: Issue[];
};

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: 28,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

function RdrDivider() {
  return (
    <div
      aria-hidden
      className="mt-6 flex items-center gap-3 text-[#8b3a3a]/70"
    >
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#8b3a3a]/50 to-[#c9a227]/30" />
      <span className="rdr-diamond-glow h-2 w-2 rotate-45 bg-[#b33a3a] shadow-[0_0_12px_rgba(179,58,58,0.65)]" />
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#8b3a3a]/50 to-[#c9a227]/30" />
    </div>
  );
}

function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/issues/${issue.slug}`}
        className="group relative block overflow-hidden rounded-sm border border-[#c9a227]/10 bg-[linear-gradient(135deg,rgba(28,22,18,0.96),rgba(12,10,9,0.98))] p-6 shadow-[inset_0_1px_0_rgba(232,220,196,0.04),0_12px_40px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow,transform] duration-700 hover:-translate-y-0.5 hover:border-[#b33a3a]/35 hover:shadow-[inset_0_1px_0_rgba(232,220,196,0.08),0_18px_50px_rgba(0,0,0,0.55),0_0_30px_rgba(179,58,58,0.08)]"
      >
        <div
          aria-hidden
          className="rdr-noise pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(201,162,39,0.07),transparent_45%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 start-0 top-0 w-[3px] origin-bottom scale-y-0 bg-[#b33a3a] shadow-[0_0_14px_rgba(179,58,58,0.55)] transition-transform duration-500 ease-out group-hover:scale-y-100"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          <span className="rdr-shimmer-line block h-full w-1/2 bg-gradient-to-r from-transparent via-[#e8dcc4]/25 to-transparent" />
        </div>

        <div className="relative z-10 flex items-start gap-5">
          <div className="mt-1 flex shrink-0 flex-col items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center border border-[#b33a3a]/30 bg-[#b33a3a]/10 shadow-[inset_0_0_12px_rgba(179,58,58,0.12)] transition-colors duration-500 group-hover:border-[#b33a3a]/55 group-hover:bg-[#b33a3a]/18"
            >
              <span className="h-2 w-2 rotate-45 bg-[#b33a3a] shadow-[0_0_8px_rgba(179,58,58,0.6)]" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a227]/45">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-[#8b6914]/80">
              Field Note
            </span>
            <h3 className="text-lg font-bold leading-8 text-[#e8dcc4] transition-colors duration-500 group-hover:text-[#f5ead8]">
              {issue.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#a89880]/90 transition-colors duration-500 group-hover:text-[#c4b59c]">
              جزئیات عیب‌یابی، علت احتمالی و راهکار تعمیر این مورد را بخوانید.
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#b33a3a]/80 transition-all duration-500 group-hover:gap-3 group-hover:text-[#d44a4a]">
              <span>مشاهده پرونده</span>
              <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ServiceCommonIssues({
  issues,
}: ServiceCommonIssuesProps) {
  return (
    <section className="relative overflow-hidden border-y border-[#c9a227]/10 bg-[#0a0908]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(179,58,58,0.06),transparent_55%),radial-gradient(ellipse_at_top,rgba(201,162,39,0.05),transparent_50%)]"
      />
      <div
        aria-hidden
        className="rdr-noise pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.65)]"
      />

      <div className="container relative mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 max-w-3xl"
        >
          <span className="mb-3 inline-block text-[11px] uppercase tracking-[0.34em] text-[#b33a3a]/85">
            Journal / Field Notes
          </span>
          <h2 className="text-3xl font-black tracking-tight text-[#f0e6d6] md:text-4xl">
            مشکلات رایج این کنسول
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#a89880]">
            مانند دفترچه مأموریت‌های غربی؛ هر مورد یک پرونده جداگانه از
            علائم، علت و مسیر تعمیر است.
          </p>
          <RdrDivider />
        </motion.div>

        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-4 md:grid-cols-2"
        >
          {issues.map((issue, index) => (
            <IssueCard key={issue.slug} issue={issue} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
