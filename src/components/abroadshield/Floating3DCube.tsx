"use client";

import { motion } from "framer-motion";

/**
 * A pure-CSS 3D rotating cube — adds genuine 3D depth to the page without
 * any 3D library. Each face is a translucent glass panel with emerald tint.
 * Floats gently + rotates continuously on Y and X axes.
 *
 * No WebGL, no Three.js — just CSS transforms + Framer Motion.
 */
export default function Floating3DCube({
  size = 120,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const half = size / 2;
  const faces = [
    { transform: `translateZ(${half}px)`, label: "AI" },
    { transform: `rotateY(180deg) translateZ(${half}px)`, label: "4" },
    { transform: `rotateY(90deg) translateZ(${half}px)`, label: "🛡️" },
    { transform: `rotateY(-90deg) translateZ(${half}px)`, label: "27" },
    { transform: `rotateX(90deg) translateZ(${half}px)`, label: "13" },
    { transform: `rotateX(-90deg) translateZ(${half}px)`, label: "✦" },
  ];

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size, perspective: 600 }}
    >
      <motion.div
        className="relative"
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: 360, rotateX: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {faces.map((face, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.4)]"
            style={{
              width: size,
              height: size,
              transform: face.transform,
              background:
                "linear-gradient(135deg, oklch(0.22 0.028 165 / 0.6), oklch(0.18 0.022 165 / 0.4))",
              backdropFilter: "blur(8px)",
              boxShadow: "inset 0 0 20px oklch(0.74 0.17 162 / 0.15)",
            }}
          >
            <span className="text-lg font-semibold text-[oklch(0.85_0.19_158)]">
              {face.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
