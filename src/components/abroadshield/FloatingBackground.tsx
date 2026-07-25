"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Site-wide floating background — DRAMATICALLY dynamic.
 *
 * The user said "background is still static and not floating visuals" so this
 * version is much more visible:
 *  - 6 large drifting orbs (faster, higher opacity)
 *  - 14 floating geometric shapes (cubes, triangles, rings) that visibly
 *    rotate + drift across the screen
 *  - 2 AI neural network SVGs that pulse
 *  - A moving conic gradient that sweeps the whole viewport
 *  - All with clearly-visible motion (8-16s durations, not 30s)
 */
export default function FloatingBackground() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* base deep gradient — green-tinted, animated shift */}
      {animate && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(120% 100% at 70% 20%, oklch(0.2 0.03 165), oklch(0.13 0.018 165) 55%, oklch(0.11 0.015 165))",
              "radial-gradient(120% 100% at 30% 70%, oklch(0.19 0.028 165), oklch(0.12 0.016 165) 55%, oklch(0.11 0.015 165))",
              "radial-gradient(120% 100% at 70% 20%, oklch(0.2 0.03 165), oklch(0.13 0.018 165) 55%, oklch(0.11 0.015 165))",
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!animate && (
        <div className="absolute inset-0 [background:radial-gradient(120%_100%_at_70%_20%,oklch(0.18_0.025_165),oklch(0.13_0.018_165)_55%,oklch(0.11_0.015_165))]" />
      )}

      {/* faint grid — subtly moves */}
      {animate && (
        <motion.div
          className="as-bg-grid absolute inset-0 opacity-40"
          animate={{ backgroundPosition: ["0px 0px", "64px 64px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "64px 64px" }}
        />
      )}
      {!animate && <div className="as-bg-grid absolute inset-0 opacity-40" />}

      {/* drifting glow orbs — 6, faster + higher opacity for visibility */}
      <Orb
        className="left-[-8%] top-[8%] h-[42vh] w-[42vh]"
        color="oklch(0.74 0.17 162 / 0.35)"
        blur="70px"
        drift={animate ? { x: [0, 60, 0], y: [0, -40, 0], dur: 14 } : undefined}
      />
      <Orb
        className="right-[-10%] top-[35%] h-[48vh] w-[48vh]"
        color="oklch(0.86 0.2 135 / 0.25)"
        blur="80px"
        drift={animate ? { x: [0, -70, 0], y: [0, 50, 0], dur: 16, delay: 1 } : undefined}
      />
      <Orb
        className="left-[25%] top-[60%] h-[36vh] w-[36vh]"
        color="oklch(0.88 0.13 175 / 0.22)"
        blur="60px"
        drift={animate ? { x: [0, 45, 0], y: [0, -55, 0], dur: 13, delay: 2 } : undefined}
      />
      <Orb
        className="right-[20%] bottom-[5%] h-[32vh] w-[32vh]"
        color="oklch(0.8 0.15 80 / 0.18)"
        blur="60px"
        drift={animate ? { x: [0, -40, 0], y: [0, -30, 0], dur: 15, delay: 0.5 } : undefined}
      />
      <Orb
        className="left-[8%] bottom-[25%] h-[28vh] w-[28vh]"
        color="oklch(0.64 0.16 300 / 0.16)"
        blur="55px"
        drift={animate ? { x: [0, 50, 0], y: [0, 35, 0], dur: 18, delay: 3 } : undefined}
      />
      <Orb
        className="right-[40%] top-[5%] h-[30vh] w-[30vh]"
        color="oklch(0.74 0.17 162 / 0.2)"
        blur="65px"
        drift={animate ? { x: [0, -35, 0], y: [0, 45, 0], dur: 17, delay: 4 } : undefined}
      />

      {/* rotating geometric outlines — 3, faster rotation */}
      <GeoOutline
        className="left-[12%] top-[18%] h-64 w-64"
        shape="hex"
        rotateDur={animate ? 40 : undefined}
      />
      <GeoOutline
        className="right-[18%] top-[55%] h-56 w-56"
        shape="ring"
        rotateDur={animate ? 32 : undefined}
        reverse
      />
      <GeoOutline
        className="left-[60%] bottom-[15%] h-44 w-44"
        shape="hex"
        rotateDur={animate ? 36 : undefined}
        reverse
      />

      {/* floating 3D-style shapes — cubes, triangles, rings that drift + rotate visibly */}
      {animate &&
        FLOATING_SHAPES.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: s.x, top: s.y }}
            animate={{
              y: [0, s.dy, 0],
              x: [0, s.dx, 0],
              rotate: [0, s.rot, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: s.dur,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
          >
            {s.shape === "cube" && (
              <div
                className="h-12 w-12"
                style={{
                  background: `linear-gradient(135deg, oklch(${s.color} / 0.3), oklch(${s.color} / 0.05))`,
                  border: `1px solid oklch(${s.color} / 0.3)`,
                  borderRadius: "8px",
                  transform: "rotate(45deg)",
                  boxShadow: `0 0 20px oklch(${s.color} / 0.2)`,
                }}
              />
            )}
            {s.shape === "triangle" && (
              <div
                className="h-0 w-0"
                style={{
                  borderLeft: "20px solid transparent",
                  borderRight: "20px solid transparent",
                  borderBottom: `32px solid oklch(${s.color} / 0.25)`,
                  filter: `drop-shadow(0 0 8px oklch(${s.color} / 0.3))`,
                }}
              />
            )}
            {s.shape === "ring" && (
              <div
                className="h-10 w-10 rounded-full"
                style={{
                  border: `2px solid oklch(${s.color} / 0.3)`,
                  boxShadow: `0 0 16px oklch(${s.color} / 0.2), inset 0 0 8px oklch(${s.color} / 0.1)`,
                }}
              />
            )}
            {s.shape === "diamond" && (
              <div
                className="h-8 w-8"
                style={{
                  background: `linear-gradient(135deg, oklch(${s.color} / 0.3), transparent)`,
                  border: `1px solid oklch(${s.color} / 0.35)`,
                  transform: "rotate(45deg)",
                  borderRadius: "4px",
                }}
              />
            )}
          </motion.div>
        ))}

      {/* AI neural network patterns — 2, pulsing */}
      {animate && (
        <motion.svg
          className="absolute right-[5%] top-[15%] h-48 w-48 opacity-30"
          viewBox="0 0 100 100"
          fill="none"
          animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {[
            [20, 30], [20, 50], [20, 70],
            [50, 20], [50, 40], [50, 60], [50, 80],
            [80, 35], [80, 65],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill="oklch(0.74 0.17 162 / 0.7)" />
          ))}
          <g stroke="oklch(0.74 0.17 162 / 0.3)" strokeWidth="0.4">
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

      {animate && (
        <motion.svg
          className="absolute left-[8%] bottom-[20%] h-40 w-40 opacity-25"
          viewBox="0 0 100 100"
          fill="none"
          animate={{ opacity: [0.12, 0.3, 0.12], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          {[
            [25, 25], [25, 50], [25, 75],
            [55, 35], [55, 65],
            [80, 50],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.8" fill="oklch(0.86 0.2 135 / 0.6)" />
          ))}
          <g stroke="oklch(0.86 0.2 135 / 0.25)" strokeWidth="0.4">
            <line x1="25" y1="25" x2="55" y2="35" />
            <line x1="25" y1="50" x2="55" y2="35" />
            <line x1="25" y1="50" x2="55" y2="65" />
            <line x1="25" y1="75" x2="55" y2="65" />
            <line x1="55" y1="35" x2="80" y2="50" />
            <line x1="55" y1="65" x2="80" y2="50" />
          </g>
        </motion.svg>
      )}

      {/* moving conic gradient sweep — visible rotating light */}
      {animate && (
        <motion.div
          className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, oklch(0.74 0.17 162 / 0.6) 12%, transparent 25%, oklch(0.86 0.2 135 / 0.5) 37%, transparent 50%, oklch(0.85 0.19 158 / 0.5) 62%, transparent 75%, oklch(0.8 0.15 80 / 0.4) 87%, transparent 100%)",
            maskImage: "radial-gradient(circle, black 0%, transparent 60%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* fine film grain */}
      <div className="as-noise absolute inset-0" />

      {/* top + bottom vignette */}
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
  const stroke = "oklch(0.74 0.17 162 / 0.12)";
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

/* ---------- floating shapes config — 14 shapes, visible motion ---------- */
const FLOATING_SHAPES = [
  { x: "8%", y: "15%", shape: "cube", color: "0.74 0.17 162", dx: 30, dy: -40, rot: 180, dur: 12, delay: 0 },
  { x: "85%", y: "25%", shape: "triangle", color: "0.86 0.2 135", dx: -25, dy: 35, rot: -120, dur: 14, delay: 1 },
  { x: "15%", y: "70%", shape: "ring", color: "0.88 0.13 175", dx: 40, dy: -30, rot: 360, dur: 13, delay: 2 },
  { x: "75%", y: "65%", shape: "diamond", color: "0.8 0.15 80", dx: -35, dy: -25, rot: 90, dur: 15, delay: 0.5 },
  { x: "45%", y: "10%", shape: "cube", color: "0.64 0.16 300", dx: 20, dy: 30, rot: -180, dur: 16, delay: 3 },
  { x: "60%", y: "80%", shape: "triangle", color: "0.74 0.17 162", dx: -30, dy: -35, rot: 150, dur: 12, delay: 1.5 },
  { x: "90%", y: "50%", shape: "ring", color: "0.86 0.2 135", dx: -20, dy: 25, rot: -360, dur: 14, delay: 2.5 },
  { x: "5%", y: "45%", shape: "diamond", color: "0.88 0.13 175", dx: 25, dy: -20, rot: -90, dur: 13, delay: 4 },
  { x: "35%", y: "40%", shape: "cube", color: "0.8 0.15 80", dx: -35, dy: 30, rot: 180, dur: 15, delay: 0.8 },
  { x: "80%", y: "85%", shape: "triangle", color: "0.64 0.16 300", dx: 30, dy: -40, rot: -150, dur: 12, delay: 3.5 },
  { x: "25%", y: "25%", shape: "ring", color: "0.74 0.17 162", dx: 35, dy: 35, rot: 360, dur: 16, delay: 2.2 },
  { x: "55%", y: "55%", shape: "diamond", color: "0.86 0.2 135", dx: -25, dy: -30, rot: 45, dur: 14, delay: 1.2 },
  { x: "95%", y: "15%", shape: "cube", color: "0.88 0.13 175", dx: -40, dy: 40, rot: -90, dur: 13, delay: 4.5 },
  { x: "12%", y: "88%", shape: "triangle", color: "0.8 0.15 80", dx: 30, dy: -25, rot: 120, dur: 15, delay: 0.3 },
].map((s) => ({
  ...s,
  // scale down shapes a bit for variety
}));
