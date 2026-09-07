"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, GitBranch } from "lucide-react";

import type { BranchNode } from "../../lib/breadcrumb-tree-data";
import {
  getTrailCrumbs,
  nodeHasBranches,
  pathForBreadcrumbMatch,
  type TrailCrumb,
} from "../../lib/breadcrumb-tree-utils";

function branchKey(node: BranchNode, prefix: string) {
  return `${prefix}-${node.title}-${node.href ?? "n"}`;
}

function BranchPanel({
  siblings,
  childBranches,
  selfHref,
  selfTitle,
  onNavigate,
}: {
  siblings: BranchNode[];
  childBranches: BranchNode[];
  selfHref?: string;
  selfTitle: string;
  onNavigate: () => void;
}) {
  const hasSiblings = siblings.length > 0;
  const hasChildren = childBranches.length > 0;

  if (!hasSiblings && !hasChildren && !selfHref) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="
        absolute right-0 top-[calc(100%+6px)] z-50 min-w-[180px]
        overflow-hidden rounded-xl border border-cyan-400/20
        bg-[#0b1622]/95 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      "
      role="menu"
    >
      {selfHref && (
        <div className="px-2 pt-1 pb-1">
          <Link
            href={selfHref}
            role="menuitem"
            onClick={onNavigate}
            className="
              flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2
              text-right text-[11px] font-semibold text-cyan-200
              transition hover:bg-cyan-400/15
            "
          >
            <span className="truncate">صفحه {selfTitle}</span>
            <ChevronLeft size={10} className="shrink-0" />
          </Link>
        </div>
      )}

      {selfHref && (hasSiblings || hasChildren) && (
        <div className="mx-2 border-t border-cyan-400/10" />
      )}

      {hasSiblings && (
        <div className="px-2 pt-1">
          <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-wide text-cyan-400/70">
            شاخه‌های دیگر
          </p>
          <ul>
            {siblings.map((item) => (
              <li key={branchKey(item, "s")}>
                <BranchLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasSiblings && hasChildren && (
        <div className="mx-2 my-1 border-t border-cyan-400/10" />
      )}

      {hasChildren && (
        <div className="px-2 pb-1">
          {hasSiblings && (
            <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-wide text-cyan-400/70">
              زیرمجموعه
            </p>
          )}
          <ul>
            {childBranches.map((item) => (
              <li key={branchKey(item, "c")}>
                <BranchLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function BranchLink({
  item,
  onNavigate,
}: {
  item: BranchNode;
  onNavigate: () => void;
}) {
  const className =
    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-right text-[11px] text-zinc-200 transition hover:bg-cyan-400/10 hover:text-cyan-100";

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={className}
        role="menuitem"
        onClick={onNavigate}
      >
        <span className="truncate">{item.title}</span>
        <ChevronLeft size={10} className="shrink-0 text-cyan-400/60" />
      </Link>
    );
  }

  return (
    <span className={`${className} cursor-default opacity-60`} role="menuitem">
      {item.title}
    </span>
  );
}

function TrailCrumbItem({
  crumb,
  isOpen,
  onToggle,
  onClose,
}: {
  crumb: TrailCrumb;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const hasBranches = nodeHasBranches(crumb);
  const { node, siblings, children, isCurrent } = crumb;
  const href = node.href;

  const labelClass = `
    flex items-center gap-1 rounded-lg border px-2.5 py-1
    text-[11px] font-medium backdrop-blur-xl transition-all duration-200
    ${
      isCurrent
        ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-50"
        : "border-cyan-400/15 bg-[#0b1622]/90 text-white hover:border-cyan-400/35 hover:bg-cyan-400/10"
    }
  `;

  const inner = (
    <>
      {hasBranches && (
        <GitBranch
          size={10}
          className={`
            shrink-0 transition-opacity duration-200
            ${
              isOpen
                ? "text-cyan-300 opacity-100"
                : "text-cyan-400/40 opacity-70 group-hover:text-cyan-400/90 group-hover:opacity-100"
            }
          `}
          aria-hidden
        />
      )}
      <span className="truncate whitespace-nowrap">{node.title}</span>
    </>
  );

  return (
    <li className="relative flex items-center">
      <div className="group relative">
        {hasBranches ? (
          <button
            type="button"
            onClick={onToggle}
            className={`${labelClass} cursor-pointer`}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-current={isCurrent ? "page" : undefined}
          >
            {inner}
          </button>
        ) : href ? (
          <Link
            href={href}
            className={labelClass}
            aria-current={isCurrent ? "page" : undefined}
            onClick={onClose}
          >
            {inner}
          </Link>
        ) : (
          <span
            className={labelClass}
            aria-current={isCurrent ? "page" : undefined}
          >
            {inner}
          </span>
        )}

        <AnimatePresence>
          {isOpen && hasBranches && (
            <BranchPanel
              siblings={siblings}
              childBranches={children}
              selfHref={href}
              selfTitle={node.title}
              onNavigate={onClose}
            />
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

type Props = {
  className?: string;
  currentPath?: string;
};

export default function FuturisticBreadcrumbTree({
  className = "",
  currentPath: currentPathProp,
}: Props) {
  const pathname = usePathname();
  const currentPath = pathForBreadcrumbMatch(
    currentPathProp ?? pathname ?? "/",
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const crumbs = useMemo(() => getTrailCrumbs(currentPath), [currentPath]);

  const closeMenu = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <nav
      ref={navRef}
      dir="rtl"
      aria-label="مسیر صفحه"
      className={`relative ${className}`}
    >
      <motion.ol
        key={currentPath}
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap items-center gap-1.5"
      >
        {crumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb.node.title}-${index}`}>
            {index > 0 && (
              <li aria-hidden className="flex items-center px-0.5">
                <ChevronLeft size={11} className="text-cyan-500/40" />
              </li>
            )}
            <TrailCrumbItem
              crumb={crumb}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((prev) => (prev === index ? null : index))
              }
              onClose={closeMenu}
            />
          </React.Fragment>
        ))}
      </motion.ol>
    </nav>
  );
}
