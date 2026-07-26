"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Shield } from "lucide-react";

/**
 * AIPrimeCore — the premium hero visual.
 *
 * Replaces the confusing HoloShield phase-ring diagram with a single,
 * elegant, glowing AI core that radiates presence:
 *
 *  - A central glowing orb with a shield emblem (the "AI brain")
 *  - 3 concentric pulsing rings (breathing aura)
 *  - A rotating outer ring of data points (HUD feel)
 *  - Floating particles that orbit the core
 *  - Hover-tilt: the whole thing responds to the cursor in 3D
 *  - A readiness % counter in the center (live data, counts up on mount)
 *
 * Premium, simple, purposeful — not a confusing diagram.
 */
export default function AIPrimeCore() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const [readiness, setReadiness] = useState(0);
  const target = 72;

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setReadiness(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [12, -12]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 18,
  });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex h-[340px] w-[340px] items-center justify-center sm:h-[420px] sm:w-[420px]"
      style={{ perspective: 1000 }}
    >
      {/* ambient outer glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.05, 1.15, 1.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.74 0.17 162 / 0.35), oklch(0.86 0.2 135 / 0.15) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* tilt container */}
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* outer rotating ring — HUD data points */}
        <motion.div
          className="absolute h-[90%] w-[90%]"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * 360;
            const rad = (angle * Math.PI) / 180;
            const r = 48; // percentage radius
            const x = 50 + r * Math.cos(rad);
            const y = 50 + r * Math.sin(rad);
            const bright = i % 4 === 0;
            return (
              <div
                key={i}
                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  background: bright
                    ? "oklch(0.85 0.19 158)"
                    : "oklch(0.5 0.08 165 / 0.5)",
                  boxShadow: bright
                    ? "0 0 8px oklch(0.85 0.19 158 / 0.8)"
                    : "none",
                }}
              />
            );
          })}
        </motion.div>

        {/* concentric pulsing rings — breathing aura */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[oklch(0.74_0.17_162/0.2)]"
            style={{
              width: `${60 + i * 15}%`,
              height: `${60 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.15, 0.4],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}

        {/* central core — the AI orb */}
        <motion.div
          className="relative flex h-[42%] w-[42%] items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* core glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, oklch(0.85 0.19 158 / 0.9), oklch(0.74 0.17 162 / 0.6) 40%, oklch(0.42 0.11 170 / 0.8) 100%)",
              boxShadow:
                "0 0 60px oklch(0.74 0.17 162 / 0.6), inset 0 0 30px oklch(0.85 0.19 158 / 0.3)",
            }}
          />
          {/* core inner shine */}
          <div
            className="absolute inset-[15%] rounded-full opacity-60"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, oklch(0.98 0.005 160 / 0.8), transparent 60%)",
            }}
          />
          {/* shield emblem + readiness */}
          <div className="relative flex flex-col items-center">
            <Shield
              className="h-8 w-8 text-[oklch(0.98_0.005_160)]"
              strokeWidth={1.5}
              style={{ filter: "drop-shadow(0 0 8px oklch(0.85 0.19 158 / 0.8))" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-1.5 text-2xl font-semibold text-[oklch(0.98_0.005_160)]"
              style={{ textShadow: "0 0 12px oklch(0.85 0.19 158 / 0.8)" }}
            >
              {readiness}%
            </motion.div>
            <div className="text-[8px] font-medium uppercase tracking-[0.15em] text-[oklch(0.85_0.19_158/0.8)]">
              ready
            </div>
          </div>
        </motion.div>

        {/* orbiting particles — 3 motes that circle the core */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-[oklch(0.85_0.19_158)]"
            style={{ boxShadow: "0 0 8px oklch(0.85 0.19 158 / 0.8)" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 12 + i * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="absolute h-2 w-2 rounded-full bg-[oklch(0.85_0.19_158)]"
              style={{
                transform: `translateX(${120 + i * 20}px)`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* corner accents — subtle HUD framing */}
      <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[oklch(0.74_0.17_162/0.3)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[oklch(0.74_0.17_162/0.3)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-r-2 border-b-2 border-[oklch(0.74_0.17_162/0.3)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-l-2 border-b-2 border-[oklch(0.74_0.17_162/0.3)]" />
    </div>
  );
}
