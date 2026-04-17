"use client";

import { AnimatePresence, motion, animate, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export const EASE_OUT_QUART: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
export const SPRING_SMOOTH = { type: "spring", stiffness: 280, damping: 28 };

export const STAGGER_CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const SLIDE_UP_ITEM = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE_OUT_QUART },
  },
};

export const FADE_ITEM = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: EASE_OUT_QUART },
  },
};

// Re-export for convenience in pages
export { motion, AnimatePresence };

/* ── Stagger list container ── */

interface StaggerListProps {
  children: ReactNode;
  className?: string;
}

export function StaggerList({ children, className }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/* ── Single fade + slide-up item ── */

interface FadeSlideProps {
  children: ReactNode;
  className?: string;
}

export function FadeSlide({ children, className }: FadeSlideProps) {
  return (
    <motion.div className={className} variants={SLIDE_UP_ITEM}>
      {children}
    </motion.div>
  );
}

/* ── Cross-fade wrapper for state transitions (skeleton → content) ── */

interface CrossFadeProps {
  children: ReactNode;
  stateKey: string;
  className?: string;
}

export function CrossFade({ children, stateKey, className }: CrossFadeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stateKey}
        className={className}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32, ease: EASE_OUT_QUART }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Animated counter (counts from 0 to value on mount) ── */

interface AnimatedCounterProps {
  value: number;
  format: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({ value, format, className }: AnimatedCounterProps) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(() => format(0));
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(formatRef.current(v)),
    });
    return () => controls.stop();
  }, [value, motionVal]);

  return <span className={className}>{display}</span>;
}
