"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

/**
 * Holographic shield visual — replaces the heavy 3D canvas.
 *
 * Design intent:
 *  - Compact (~340px), not a giant object.
 *  - Layered translucent rings that rotate at different speeds (depth).
 *  - A central shield silhouette with a soft holographic glow.
 *  - Iridescent shimmer sweep (jade → cyan → violet → back).
 *  - Subtle scan-line texture for the "hologram" feel.
 *  - Floating particles done with pure CSS (no canvas, no GPU cost).
 *  - Everything moves — but slowly and deliberately, not bouncy.
 */
export default function HoloShield() {
  return (
    <div className="relative flex h-[340px] w-[340px] items-center justify-center sm:h-[420px] sm:w-[420px]">
      {/* ambient glow behind the whole hologram */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.09 165 / 0.28), oklch(0.58 0.12 295 / 0.1) 45%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* outer ring — slow clockwise, holographic conic gradient */}
      <motion.div
        aria-hidden
        className="absolute h-[88%] w-[88%] rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, oklch(0.62 0.09 165 / 0.5) 18%, transparent 36%, oklch(0.7 0.08 215 / 0.4) 54%, transparent 72%, oklch(0.58 0.12 295 / 0.4) 88%, transparent 100%)",
          maskImage: "radial-gradient(circle, transparent 58%, black 60%, black 62%, transparent 64%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 60%, black 62%, transparent 64%)",
        }}
      />

      {/* mid ring — counter-rotating, thinner, brighter */}
      <motion.div
        aria-hidden
        className="absolute h-[64%] w-[64%] rounded-full border border-[oklch(0.78_0.11_165/0.35)]"
        animate={{ rotate: -360 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        style={{
          boxShadow:
            "inset 0 0 24px oklch(0.62 0.09 165 / 0.18), 0 0 32px oklch(0.62 0.09 165 / 0.22)",
        }}
      >
        {/* tick marks on the mid ring */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-[6px] w-[1px] origin-[0_0]"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-46%)`,
              transformOrigin: "center",
              background:
                i % 3 === 0
                  ? "oklch(0.78 0.11 165 / 0.8)"
                  : "oklch(0.6 0.01 220 / 0.5)",
            }}
          />
        ))}
      </motion.div>

      {/* inner ring — fastest, faint */}
      <motion.div
        aria-hidden
        className="absolute h-[46%] w-[46%] rounded-full border border-dashed border-[oklch(0.7 0.08 215/0.4)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      {/* shimmer sweep — a diagonal light bar that crosses the shield */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-full w-full overflow-hidden rounded-full"
        animate={{ opacity: [0, 0.7, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
      >
        <motion.div
          className="absolute -inset-y-4 left-0 w-[40%]"
          animate={{ x: ["-20%", "260%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3.3 }}
          style={{
            background:
              "linear-gradient(100deg, transparent, oklch(0.82 0.06 180 / 0.35), transparent)",
            filter: "blur(8px)",
          }}
        />
      </motion.div>

      {/* central shield emblem */}
      <motion.div
        className="relative flex h-[30%] w-[30%] items-center justify-center"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* shield backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.09 165 / 0.18), transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        {/* shield glyph */}
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-[oklch(0.78_0.11_165/0.5)] bg-[oklch(0.16_0.012_235/0.6)] backdrop-blur-md">
          <Shield
            className="h-1/2 w-1/2 text-[oklch(0.85_0.08_170)]"
            strokeWidth={1.4}
          />
          {/* iridescent border sweep */}
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-2xl opacity-60"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.11 165 / 0.2), transparent 30%, oklch(0.7 0.08 215 / 0.18) 60%, oklch(0.58 0.12 295 / 0.16))",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </motion.div>

      {/* scan-line overlay — holographic CRT texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, oklch(0.8 0.05 180 / 0.08) 3px, transparent 4px)",
          maskImage: "radial-gradient(circle, black 55%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 70%)",
        }}
      />

      {/* floating data motes — pure CSS, lightweight */}
      {MOTES.map((m, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute h-1 w-1 rounded-full bg-[oklch(0.78_0.11_165/0.7)]"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
          animate={{
            y: [0, m.dy, 0],
            opacity: [0, 1, 0],
            scale: [0.6, 1, 0.6],
          }}
          transition={{
            duration: m.dur,
            repeat: Infinity,
            delay: m.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* corner brackets — HUD framing */}
      <Bracket className="left-0 top-0" />
      <Bracket className="right-0 top-0 rotate-90" />
      <Bracket className="bottom-0 right-0 rotate-180" />
      <Bracket className="bottom-0 left-0 -rotate-90" />
    </div>
  );
}

const MOTES = [
  { x: 20, y: 30, dy: -18, dur: 7, delay: 0 },
  { x: 75, y: 25, dy: -14, dur: 6.5, delay: 1.2 },
  { x: 30, y: 70, dy: -16, dur: 8, delay: 0.6 },
  { x: 80, y: 65, dy: -12, dur: 7.2, delay: 2 },
  { x: 50, y: 18, dy: -20, dur: 9, delay: 1.8 },
  { x: 60, y: 80, dy: -10, dur: 6.8, delay: 0.3 },
  { x: 15, y: 55, dy: -15, dur: 7.5, delay: 2.4 },
];

function Bracket({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-5 w-5 border-l border-t border-[oklch(0.62_0.09_165/0.5)] ${className}`}
    />
  );
}
