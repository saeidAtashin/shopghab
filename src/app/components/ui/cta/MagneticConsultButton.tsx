"use client";

import { motion, useSpring } from "framer-motion";
import { Phone } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { SITE_PHONE } from "../../../../lib/seo/site";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const MAGNETIC_RADIUS = 140;
const MAGNETIC_STRENGTH = 0.42;
const ORBIT_RADIUS = 52;

export default function MagneticConsultButton() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const x = useSpring(0, { stiffness: 180, damping: 18, mass: 0.12 });
  const y = useSpring(0, { stiffness: 180, damping: 18, mass: 0.12 });
  const orbitX = useSpring(0, { stiffness: 220, damping: 22, mass: 0.08 });
  const orbitY = useSpring(0, { stiffness: 220, damping: 22, mass: 0.08 });

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);

      if (distance < MAGNETIC_RADIUS) {
        const pull = 1 - distance / MAGNETIC_RADIUS;
        const strength = MAGNETIC_STRENGTH * pull;
        x.set(dx * strength);
        y.set(dy * strength);

        const angle = Math.atan2(dy, dx);
        orbitX.set(Math.cos(angle) * ORBIT_RADIUS);
        orbitY.set(Math.sin(angle) * ORBIT_RADIUS);
        setActive(true);
      } else {
        x.set(0);
        y.set(0);
        orbitX.set(0);
        orbitY.set(0);
        setActive(false);
      }
    },
    [reducedMotion, x, y, orbitX, orbitY],
  );

  useEffect(() => {
    if (reducedMotion) return;
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove, reducedMotion]);

  const telHref = `tel:${SITE_PHONE.replace(/\s/g, "")}`;

  return (
    <div className="relative flex-1 w-full md:w-auto">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -m-6 rounded-[2rem] bg-cyan-500/10 blur-2xl"
        animate={{ opacity: active ? 1 : 0, scale: active ? 1.05 : 0.9 }}
        transition={{ duration: 0.35 }}
      />

      <motion.a
        ref={ref}
        href={telHref}
        style={{ x, y }}
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-cyan-400/25 bg-white/[0.06] px-6 py-2 text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-cyan-400/45 hover:shadow-[0_12px_48px_rgba(34,211,238,0.18)]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="h-[7.5rem] w-[7.5rem] rounded-full border border-dashed border-cyan-400/20 transition-opacity duration-300 group-hover:border-cyan-400/35" />
        </span>

        <motion.span
          aria-hidden
          style={{ x: orbitX, y: orbitY }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 -ml-1.5 -mt-1.5"
        >
          <span
            className={`block h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_16px_#22d3ee] transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
          />
        </motion.span>

        <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/25 to-blue-600/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/50">
          <span className="absolute inset-0 rounded-xl bg-cyan-400/20 opacity-0 transition group-hover:opacity-100" />
          <Phone
            className="relative h-5 w-5 text-cyan-300"
            strokeWidth={2.25}
          />
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
        </span>

        <span className="relative z-10 w-full shrink text-right">
          <span className="block text-lg font-bold tracking-tight">مشاوره</span>
          <span className="mt-0.5 block text-sm text-cyan-200/70">
            تماس فوری با کارشناس
          </span>
        </span>
      </motion.a>
    </div>
  );
}
