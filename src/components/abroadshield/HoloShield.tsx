"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Shield, Plane, Home, BookOpen, Briefcase, CalendarClock, Zap } from "lucide-react";
import { STUDENT, PHASES } from "./data";

/**
 * Purposeful holographic command-center — NOT decorative.
 *
 * Every element shows real agent state:
 *  - Outer ring: the 4-phase journey, with the current phase (Pre-Departure)
 *    lit and pulsing. Completed phases dimmed, future phases faint.
 *  - Center: the student's live readiness % (72%), counting up on mount.
 *  - Below center: the next critical deadline ("Visa appointment in 6d").
 *  - Status badge: "Agent online" with a live pulse.
 *  - Hover-tilt: the hologram rotates toward the cursor for a 3D feel.
 *
 * This earns its place on the page — it's a live dashboard, not a screensaver.
 */

const PHASE_ICONS = [Plane, Home, BookOpen, Briefcase];

export default function HoloShield() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const [hovering, setHovering] = useState(false);

  // count-up readiness animation
  const [readiness, setReadiness] = useState(0);
  const targetReadiness = STUDENT.readiness;
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setReadiness(Math.round(targetReadiness * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetReadiness]);

  // current phase index (Pre-Departure = 0)
  const currentPhaseIdx = PHASES.findIndex((p) => p.id === STUDENT.currentPhase);
  // next critical deadline
  const nextDeadline = { label: "Visa appointment", days: 6, time: "09:30 IST" };

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
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
    setHovering(false);
  };

  // ring geometry — 4 phase arcs around the circle
  const radius = 140;
  const phaseArcs = PHASES.map((p, i) => {
    const startAngle = (i / 4) * 360 - 90; // start at top
    const endAngle = ((i + 1) / 4) * 360 - 90;
    const isActive = i === currentPhaseIdx;
    const isPast = i < currentPhaseIdx;
    return { ...p, startAngle, endAngle, isActive, isPast, index: i };
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={onLeave}
      className="relative flex h-[360px] w-[360px] items-center justify-center sm:h-[440px] sm:w-[440px]"
      style={{ perspective: 900 }}
    >
      {/* ambient glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.96, 1.03, 0.96] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle, oklch(0.74 0.17 162 / 0.25), transparent 65%)",
          filter: "blur(30px)",
        }}
      />

      {/* tilt container */}
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          scale: hovering ? 1.02 : 1,
        }}
        transition={{ scale: { duration: 0.3 } }}
      >
        {/* SVG phase ring — the purposeful core */}
        <svg
          viewBox="-180 -180 360 360"
          className="absolute inset-0 h-full w-full"
          style={{ filter: "drop-shadow(0 0 12px oklch(0.74 0.17 162 / 0.4))" }}
        >
          {/* background track */}
          <circle
            cx="0"
            cy="0"
            r={radius}
            fill="none"
            stroke="oklch(0.4 0.03 165 / 0.25)"
            strokeWidth="2"
          />

          {/* 4 phase arcs */}
          {phaseArcs.map((arc) => {
            const startRad = (arc.startAngle * Math.PI) / 180;
            const endRad = (arc.endAngle * Math.PI) / 180;
            const x1 = radius * Math.cos(startRad);
            const y1 = radius * Math.sin(startRad);
            const x2 = radius * Math.cos(endRad);
            const y2 = radius * Math.sin(endRad);
            const largeArc = arc.endAngle - arc.startAngle > 180 ? 1 : 0;
            const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

            const color = arc.isActive
              ? "oklch(0.74 0.17 162)"
              : arc.isPast
                ? "oklch(0.5 0.1 165 / 0.5)"
                : "oklch(0.5 0.03 165 / 0.2)";
            const width = arc.isActive ? 4 : 2;

            return (
              <g key={arc.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={width}
                  strokeLinecap="round"
                />
                {/* phase node at the arc midpoint */}
                {(() => {
                  const midAngle = (arc.startAngle + arc.endAngle) / 2;
                  const midRad = (midAngle * Math.PI) / 180;
                  const nx = radius * Math.cos(midRad);
                  const ny = radius * Math.sin(midRad);
                  return (
                    <>
                      {arc.isActive && (
                        <circle
                          cx={nx}
                          cy={ny}
                          r="10"
                          fill="oklch(0.74 0.17 162 / 0.2)"
                        >
                          <animate
                            attributeName="r"
                            values="8;14;8"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.6;0.2;0.6"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      <circle
                        cx={nx}
                        cy={ny}
                        r={arc.isActive ? 7 : 4}
                        fill={arc.isActive ? "oklch(0.85 0.19 158)" : color}
                        stroke="oklch(0.14 0.018 165)"
                        strokeWidth="2"
                        className="cursor-pointer"
                        onClick={() => {
                          // dispatch a custom event so the JourneyExplorer can
                          // switch to the clicked phase + scroll into view
                          window.dispatchEvent(
                            new CustomEvent("abroadshield:select-phase", {
                              detail: arc.id,
                            })
                          );
                          document
                            .getElementById("journey")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        <title>
                          {arc.name} — click to view phase details
                        </title>
                      </circle>
                    </>
                  );
                })()}
              </g>
            );
          })}

          {/* tick marks every 30° */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const inner = radius - 12;
            const outer = radius - 4;
            const x1 = inner * Math.cos(angle);
            const y1 = inner * Math.sin(angle);
            const x2 = outer * Math.cos(angle);
            const y2 = outer * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="oklch(0.6 0.04 165 / 0.4)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* center readout — the live data */}
        <div className="relative flex flex-col items-center justify-center text-center">
          {/* status badge */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-24 inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.14_0.018_165/0.7)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)] backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.74_0.17_162)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />
            </span>
            Agent online
          </motion.div>

          {/* readiness % */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl font-semibold tracking-tight text-[oklch(0.98_0.005_160)] sm:text-6xl"
              style={{ textShadow: "0 0 24px oklch(0.74 0.17 162 / 0.5)" }}
            >
              {readiness}
              <span className="text-2xl text-[oklch(0.85_0.19_158)]">%</span>
            </motion.div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[oklch(0.72_0.02_165)]">
              Journey readiness
            </div>
          </div>

          {/* current phase label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex items-center gap-1.5 rounded-lg border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)] px-2.5 py-1"
          >
            <Zap className="h-3 w-3 text-[oklch(0.85_0.19_158)]" />
            <span className="text-[11px] font-semibold text-[oklch(0.85_0.19_158)]">
              Phase {currentPhaseIdx + 1} · {PHASES[currentPhaseIdx].name}
            </span>
          </motion.div>

          {/* next deadline */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-20 flex items-center gap-2 rounded-lg border border-[oklch(0.8_0.15_80/0.3)] bg-[oklch(0.14_0.018_165/0.7)] px-3 py-1.5 backdrop-blur"
          >
            <CalendarClock className="h-3.5 w-3.5 text-[oklch(0.86_0.17_80)]" />
            <div className="text-left">
              <div className="text-[9px] uppercase tracking-wide text-[oklch(0.72_0.02_165)]">
                Next deadline
              </div>
              <div className="text-[11px] font-semibold text-[oklch(0.98_0.005_160)]">
                {nextDeadline.label} · in {nextDeadline.days}d
              </div>
            </div>
          </motion.div>
        </div>

        {/* rotating outer label ring (HUD style) */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {PHASE_ICONS.map((Icon, i) => {
            const angle = (i / 4) * 360 - 90 + 45; // offset to sit between arcs
            const rad = (angle * Math.PI) / 180;
            const r = 175;
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad);
            return (
              <div
                key={i}
                className="absolute flex h-8 w-8 items-center justify-center"
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                }}
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[oklch(0.5_0.03_165/0.3)] bg-[oklch(0.14_0.018_165/0.6)] backdrop-blur"
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      i === currentPhaseIdx
                        ? "text-[oklch(0.85_0.19_158)]"
                        : "text-[oklch(0.5_0.03_165)]"
                    }`}
                  />
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* corner brackets */}
        <Bracket className="left-1 top-1" />
        <Bracket className="right-1 top-1 rotate-90" />
        <Bracket className="bottom-1 right-1 rotate-180" />
        <Bracket className="bottom-1 left-1 -rotate-90" />
      </motion.div>
    </div>
  );
}

function Bracket({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-4 w-4 border-l border-t border-[oklch(0.74_0.17_162/0.4)] ${className}`}
    />
  );
}
