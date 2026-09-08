"use client";

import { useSpring } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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

type Options = {
  radius?: number;
  strength?: number;
};

export function useMagneticRef<T extends HTMLElement>(options: Options = {}) {
  const { radius = 140, strength = 0.42 } = options;
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const x = useSpring(0, { stiffness: 180, damping: 18, mass: 0.12 });
  const y = useSpring(0, { stiffness: 180, damping: 18, mass: 0.12 });

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);

      if (distance < radius) {
        const pull = 1 - distance / radius;
        const magneticStrength = strength * pull;
        x.set(dx * magneticStrength);
        y.set(dy * magneticStrength);
        setActive(true);
      } else {
        x.set(0);
        y.set(0);
        setActive(false);
      }
    },
    [reducedMotion, radius, strength, x, y],
  );

  useEffect(() => {
    if (reducedMotion) return;
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove, reducedMotion]);

  return { ref, x, y, active, reducedMotion };
}
