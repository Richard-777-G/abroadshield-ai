"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Site-wide floating background — a fixed, full-viewport layer of drifting
 * orbs, particles, and geometric shapes that sits behind ALL page content.
 *
 * Design intent (Gen-Z cool, radiant green, rich):
 *  - 5 large drifting glow orbs (emerald, lime, mint, amber, violet) — the
 *    "rich combination colours" the user asked for, blurred and slow.
 *  - A fine floating-particle field (~24 motes) drifting upward.
 *  - 3 large rotating geometric outlines (hexagon / triangle / ring) at very
 *    low opacity for depth.
 *  - A subtle conic gradient sweep that rotates every 40s.
 *  - All fixed-positioned so it covers the whole viewport regardless of scroll.
 *  - Honors prefers-reduced-motion (renders static).
 *
 * pointer-events: none so it never blocks interaction.
 */
export default function FloatingBackground() {
  const reduce = useReducedMotion();
  // useReducedMotion returns false on the server and the actual value on the
  // client. To avoid hydration mismatch we always render the structure; the
  // motion `animate` prop is only applied when motion is allowed.
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

      {/* drifting glow orbs — the rich colour combination */}
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
        className="right-[15%] bottom-[5%] h-[40vh] w-[40vh]"
        color="oklch(0.8 0.15 80 / 0.1)"
        blur="80px"
        drift={animate ? { x: [0, -35, 0], y: [0, -25, 0], dur: 28, delay: 1 } : undefined}
      />
      <Orb
        className="left-[5%] bottom-[20%] h-[34vh] w-[34vh]"
        color="oklch(0.64 0.16 300 / 0.1)"
        blur="70px"
        drift={animate ? { x: [0, 45, 0], y: [0, 30, 0], dur: 30, delay: 5 } : undefined}
      />

      {/* rotating geometric outlines — depth, very faint */}
      <GeoOutline
        className="left-[12%] top-[18%] h-64 w-64"
        shape="hex"
        rotateDur={animate ? 80 : undefined}
      />
      <GeoOutline
        className="right-[18%] top-[55%] h-56 w-56"
        shape="triangle"
        rotateDur={animate ? 64 : undefined}
        reverse
      />
      <GeoOutline
        className="left-[55%] top-[75%] h-48 w-48"
        shape="ring"
        rotateDur={animate ? 50 : undefined}
      />

      {/* floating particle field */}
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
                x: [0, p.dx, 0],
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

      {/* slow conic gradient sweep — very faint, full viewport */}
      {animate && (
        <motion.div
          className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, oklch(0.74 0.17 162 / 0.5) 12%, transparent 25%, oklch(0.86 0.2 135 / 0.4) 37%, transparent 50%, oklch(0.85 0.19 158 / 0.4) 62%, transparent 75%, oklch(0.8 0.15 80 / 0.3) 87%, transparent 100%)",
            maskImage: "radial-gradient(circle, black 0%, transparent 60%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
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
  shape: "hex" | "triangle" | "ring";
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
      {shape === "triangle" && (
        <polygon points="50,6 94,92 6,92" stroke={stroke} strokeWidth="0.6" />
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

/* ---------- particle config (deterministic — no Math.random, to avoid SSR hydration mismatch) ---------- */
const PARTICLES = Array.from({ length: 24 }).map((_, i) => {
  const colors = [
    "0.85 0.19 158",
    "0.86 0.2 135",
    "0.88 0.13 175",
    "0.8 0.15 80",
    "0.74 0.17 162",
  ];
  // deterministic pseudo-random via sine — stable across SSR + client
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
    dx: (r2 - 0.5) * 30,
    dy: 40 + r3 * 60,
    dur: 12 + r4 * 12,
    delay: r5 * 8,
  };
});
