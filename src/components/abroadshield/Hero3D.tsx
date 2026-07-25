"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Shield, ArrowDown, Sparkles, Globe2 } from "lucide-react";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-40 w-40 rounded-full border-2 border-[oklch(0.72_0.15_165/0.3)] border-t-[oklch(0.72_0.15_165)] animate-spin" />
    </div>
  ),
});

export default function Hero3D() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--shield-ink)]"
    >
      {/* layered background */}
      <div className="pointer-events-none absolute inset-0 as-bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 as-radial-emerald" />
      <div className="pointer-events-none absolute inset-0 as-noise" />
      {/* top vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />
      {/* bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--shield-ink)] to-transparent" />

      {/* 3D canvas */}
      <div className="absolute inset-0">
        <Hero3DScene />
      </div>

      {/* overlay content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 sm:px-8">
        {/* top eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-24 flex items-center gap-2 sm:mt-28"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.72_0.15_165/0.4)] bg-[oklch(0.72_0.15_165/0.08)] px-3 py-1 text-[11px] font-medium tracking-wide text-[oklch(0.82_0.16_165)]">
            <Sparkles className="h-3 w-3" />
            AbroadShield AI · Agentic Student Companion
          </span>
        </motion.div>

        {/* headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-3xl"
        >
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--shield-text)] sm:text-6xl lg:text-7xl">
            One AI.{" "}
            <span className="as-text-gradient">One memory.</span>
            <br />
            Four phases,{" "}
            <span className="as-text-gradient-amber">start to finish.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--shield-text-dim)] sm:text-lg">
            The one relationship every student going abroad can count on for the
            entire journey — not a tool used once and dropped, but a presence that
            grows more valuable the longer it stays with someone.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href="#journey"
            className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.72_0.15_165)] px-5 py-3 text-sm font-semibold text-[oklch(0.16_0.02_220)] transition hover:bg-[oklch(0.82_0.16_165)] as-glow-emerald"
          >
            <Shield className="h-4 w-4" />
            Explore the journey
            <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
          </a>
          <a
            href="#agent"
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.24_0.03_220/0.5)] px-5 py-3 text-sm font-semibold text-[var(--shield-text)] backdrop-blur transition hover:border-[oklch(0.72_0.15_165/0.5)] hover:bg-[oklch(0.24_0.03_220/0.8)]"
          >
            <Globe2 className="h-4 w-4" />
            Talk to the agent
          </a>
        </motion.div>

        {/* bottom stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-auto mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--shield-border)] as-glass sm:grid-cols-4"
        >
          {[
            { k: "4", v: "Phases, end to end" },
            { k: "27", v: "Deadlines tracked" },
            { k: "13", v: "Docs gap-checked" },
            { k: "1", v: "Memory, never reset" },
          ].map((s) => (
            <div
              key={s.v}
              className="bg-[oklch(0.2_0.03_220/0.4)] px-4 py-4 backdrop-blur"
            >
              <div className="text-2xl font-semibold text-[oklch(0.82_0.16_165)] sm:text-3xl">
                {s.k}
              </div>
              <div className="mt-1 text-xs text-[var(--shield-text-dim)]">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
