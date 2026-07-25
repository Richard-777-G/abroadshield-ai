"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Site-wide floating background — a fixed, full-viewport layer of drifting
 * orbs and particles that sits behind ALL page content.
 *
 * Performance-tuned: 3 orbs + 12 particles + 2 geo outlines (down from
 * 5 + 24 + 3) so the dev server + Chromium can run simultaneously without
 * OOM. Still rich and alive.
 *
 * pointer-events: none so it never blocks interaction.
 */
export default function FloatingBackground() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* base deep gradient — green-tinted */}
      <div className="absolute inset-0 [background:radial-gradient(120%_100%_at_70%_20%,oklch(0.18_0.025_165),oklch(0.13_0.018_165)_55%,oklch(0.11_0.015_165))]" />

      {/* faint grid */}
      <div className="as-bg-grid absolute inset-0 opacity-40" />

      {/* drifting glow orbs — 3 (emerald, lime, mint) — the rich colour combination */}
      <Orb
        className="left-[-8%] top-[8%] h-[42vh] w-[42vh]"
        color="oklch(0.74 0.17 162 / 0.22)"
        blur="80px"
        drift={animate ? { x: [0, 40, 0], y: [0, -30, 0], dur: 22 } : undefined}
      />
      <Orb
        className="right-[-10%] top-[35%] h-[48vh] w-[48vh]"
        color="oklch(0.86 0.2 135 / 0.16)"
        blur="90px"
        drift={animate ? { x: [0, -50, 0], y: [0, 40, 0], dur: 26, delay: 2 } : undefined}
      />
      <Orb
        className="left-[25%] top-[60%] h-[36vh] w-[36vh]"
        color="oklch(0.88 0.13 175 / 0.14)"
        blur="70px"
        drift={animate ? { x: [0, 30, 0], y: [0, -40, 0], dur: 24, delay: 4 } : undefined}
      />

      {/* rotating geometric outlines — 2 for depth, very faint */}
      <GeoOutline
        className="left-[12%] top-[18%] h-64 w-64"
        shape="hex"
        rotateDur={animate ? 80 : undefined}
      />
      <GeoOutline
        className="right-[18%] top-[55%] h-56 w-56"
        shape="ring"
        rotateDur={animate ? 64 : undefined}
        reverse
      />

      {/* floating particle field — 12 motes (down from 24) */}
      {animate && (
        <div className="absolute inset-0">
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.s,
                height: p.s,
                background: `oklch(${p.c} / ${p.o})`,
                filter: `blur(${p.blur}px)`,
              }}
              animate={{
                y: [0, -p.dy, 0],
                opacity: [0, p.o, 0],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* fine film grain */}
      <div className="as-noise absolute inset-0" />

      {/* top + bottom vignette so content always reads */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--shield-ink)] to-transparent" />
    </div>
  );
}

/* ---------- orb ---------- */
function Orb({
  className,
  color,
  blur,
  drift,
}: {
  className: string;
  color: string;
  blur: string;
  drift?: { x: number[]; y: number[]; dur: number; delay?: number };
}) {
  if (!drift) {
    return (
      <div
        className={`absolute rounded-full ${className}`}
        style={{ background: color, filter: `blur(${blur})` }}
      />
    );
  }
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{ background: color, filter: `blur(${blur})` }}
      animate={{ x: drift.x, y: drift.y }}
      transition={{
        duration: drift.dur,
        repeat: Infinity,
        ease: "easeInOut",
        delay: drift.delay ?? 0,
      }}
    />
  );
}

/* ---------- geometric outline ---------- */
function GeoOutline({
  className,
  shape,
  rotateDur,
  reverse,
}: {
  className: string;
  shape: "hex" | "ring";
  rotateDur?: number;
  reverse?: boolean;
}) {
  const stroke = "oklch(0.74 0.17 162 / 0.08)";
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={`absolute ${className}`}
      fill="none"
      animate={rotateDur ? { rotate: reverse ? -360 : 360 } : undefined}
      transition={
        rotateDur
          ? { duration: rotateDur, repeat: Infinity, ease: "linear" }
          : undefined
      }
    >
      {shape === "hex" && (
        <polygon
          points="50,4 92,28 92,72 50,96 8,72 8,28"
          stroke={stroke}
          strokeWidth="0.6"
        />
      )}
      {shape === "ring" && (
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke={stroke}
          strokeWidth="0.6"
          strokeDasharray="4 3"
        />
      )}
    </motion.svg>
  );
}

/* ---------- particle config (deterministic — 12 motes) ---------- */
const PARTICLES = Array.from({ length: 12 }).map((_, i) => {
  const colors = [
    "0.85 0.19 158",
    "0.86 0.2 135",
    "0.88 0.13 175",
    "0.74 0.17 162",
  ];
  const r1 = Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1;
  const r2 = Math.abs(Math.sin(i * 23.1234 + 12.345) * 31415.926) % 1;
  const r3 = Math.abs(Math.sin(i * 7.4567 + 91.111) * 98765.432) % 1;
  const r4 = Math.abs(Math.sin(i * 3.1415 + 55.555) * 12345.678) % 1;
  const r5 = Math.abs(Math.sin(i * 9.8765 + 33.333) * 67890.123) % 1;
  return {
    x: r1 * 100,
    y: r2 * 100,
    s: 2 + r3 * 3,
    c: colors[i % colors.length],
    o: 0.25 + r4 * 0.35,
    blur: 0.5 + r5 * 1.5,
    dy: 40 + r3 * 60,
    dur: 12 + r4 * 12,
    delay: r5 * 8,
  };
});
