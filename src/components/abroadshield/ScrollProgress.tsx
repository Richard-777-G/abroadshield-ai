"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Scroll-progress bar — a thin radiant-green line fixed to the very top of
 * the viewport that fills as the user scrolls down. Sits above everything
 * (z-[100]) so it's always visible.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, oklch(0.74 0.17 162), oklch(0.86 0.2 135) 50%, oklch(0.85 0.19 158))",
        boxShadow: "0 0 12px oklch(0.74 0.17 162 / 0.6)",
      }}
    />
  );
}
