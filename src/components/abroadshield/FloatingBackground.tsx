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

      {/* drifting glow orbs — 5 for richer colour combination (emerald, lime, mint, amber, violet) */}
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
      <Orb
        className="right-[20%] bottom-[5%] h-[32vh] w-[32vh]"
        color="oklch(0.8 0.15 80 / 0.1)"
        blur="70px"
        drift={animate ? { x: [0, -25, 0], y: [0, -20, 0], dur: 28, delay: 1 } : undefined}
      />
      <Orb
        className="left-[8%] bottom-[25%] h-[28vh] w-[28vh]"
        color="oklch(0.64 0.16 300 / 0.09)"
        blur="60px"
        drift={animate ? { x: [0, 35, 0], y: [0, 25, 0], dur: 30, delay: 5 } : undefined}
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

      {/* AI neural network pattern — subtle, conveys "AI agent" identity */}
      {animate && (
        <motion.svg
          className="absolute right-[5%] top-[15%] h-48 w-48 opacity-20"
          viewBox="0 0 100 100"
          fill="none"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* nodes */}
          {[
            [20, 30], [20, 50], [20, 70],
            [50, 20], [50, 40], [50, 60], [50, 80],
            [80, 35], [80, 65],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill="oklch(0.74 0.17 162 / 0.6)" />
          ))}
          {/* connections */}
          <g stroke="oklch(0.74 0.17 162 / 0.25)" strokeWidth="0.4">
            <line x1="20" y1="30" x2="50" y2="20" />
            <line x1="20" y1="30" x2="50" y2="40" />
            <line x1="20" y1="50" x2="50" y2="40" />
            <line x1="20" y1="50" x2="50" y2="60" />
            <line x1="20" y1="70" x2="50" y2="60" />
            <line x1="20" y1="70" x2="50" y2="80" />
            <line x1="50" y1="20" x2="80" y2="35" />
            <line x1="50" y1="40" x2="80" y2="35" />
            <line x1="50" y1="60" x2="80" y2="65" />
            <line x1="50" y1="80" x2="80" y2="65" />
          </g>
        </motion.svg>
      )}

      {/* second neural net — bottom left, different position */}
      {animate && (
        <motion.svg
          className="absolute left-[8%] bottom-[20%] h-40 w-40 opacity-15"
          viewBox="0 0 100 100"
          fill="none"
          animate={{ opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          {[
            [25, 25], [25, 50], [25, 75],
            [55, 35], [55, 65],
            [80, 50],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.8" fill="oklch(0.86 0.2 135 / 0.5)" />
          ))}
          <g stroke="oklch(0.86 0.2 135 / 0.2)" strokeWidth="0.4">
            <line x1="25" y1="25" x2="55" y2="35" />
            <line x1="25" y1="50" x2="55" y2="35" />
            <line x1="25" y1="50" x2="55" y2="65" />
            <line x1="25" y1="75" x2="55" y2="65" />
            <line x1="55" y1="35" x2="80" y2="50" />
            <line x1="55" y1="65" x2="80" y2="50" />
          </g>
        </motion.svg>
      )}

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
