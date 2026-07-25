"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowDown, Globe2 } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { HERO_STRINGS, type LocaleId } from "./data";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-32 w-32 rounded-full border border-[oklch(0.5_0.02_235/0.25)] border-t-[oklch(0.62_0.09_165)] animate-spin" />
    </div>
  ),
});

export default function Hero3D() {
  const [locale, setLocale] = useState<LocaleId>("en");
  const t = HERO_STRINGS[locale];

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--shield-ink)]"
    >
      {/* ---------- atmospheric background layers ---------- */}
      {/* base radial vignette — depth without noise */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_70%_30%,oklch(0.2_0.02_235),oklch(0.13_0.008_235)_55%,oklch(0.11_0.006_235))]" />
      {/* drifting aurora glow behind the artifact (right) */}
      <div className="as-aurora pointer-events-none absolute right-[-10%] top-[8%] h-[60vh] w-[60vh] rounded-full [background:radial-gradient(circle,oklch(0.62_0.09_165/0.22),transparent_65%)] blur-3xl" />
      <div className="as-aurora pointer-events-none absolute bottom-[-15%] left-[20%] h-[40vh] w-[40vh] rounded-full [background:radial-gradient(circle,oklch(0.74_0.11_75/0.1),transparent_65%)] blur-3xl [animation-delay:6s]" />
      {/* fine grid, masked to fade at edges */}
      <div className="as-bg-grid pointer-events-none absolute inset-0 opacity-70" />
      {/* film grain */}
      <div className="as-noise pointer-events-none absolute inset-0" />
      {/* top + bottom vignettes for the sticky header / footer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--shield-ink)] to-transparent" />

      {/* ---------- 3D canvas (right half on desktop, full on mobile) ---------- */}
      <div className="absolute inset-0 lg:left-[46%]">
        <Hero3DScene />
      </div>

      {/* ---------- overlay content ---------- */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 sm:px-10">
        {/* top row: eyebrow + language toggle */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 flex items-center justify-between gap-3 sm:mt-28"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.02_235/0.2)] bg-[oklch(0.185_0.014_235/0.6)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[oklch(0.82_0.03_180)] backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.62_0.09_165)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.09_165)]" />
            </span>
            {t.eyebrow}
          </span>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>

        {/* headline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-8 max-w-2xl lg:max-w-xl"
        >
          <h1
            key={`title-${locale}`}
            className="text-balance text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--shield-text)] sm:text-6xl lg:text-[4.5rem] lg:tracking-[-0.035em]"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={locale}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="block"
              >
                {t.titleOne}{" "}
                <span className="as-text-gradient">{t.titleMemory}</span>
                <br />
                {t.titleFour}{" "}
                <span className="as-text-gradient-amber">{t.titleFinish}</span>
              </motion.span>
            </AnimatePresence>
          </h1>

          {/* subtitle with generous breathing room */}
          <p
            key={`sub-${locale}`}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-[oklch(0.78_0.01_220)] sm:text-base lg:text-[17px]"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={locale}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32 }}
              >
                {t.subtitle}
              </motion.span>
            </AnimatePresence>
          </p>
        </motion.div>

        {/* CTAs — refined: solid primary (muted) + ghost secondary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <a
            href="#journey"
            className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.97_0.003_180)] px-5 py-3 text-sm font-semibold text-[oklch(0.145_0.012_235)] transition hover:-translate-y-0.5 hover:bg-white"
          >
            <Shield className="h-4 w-4" />
            {t.ctaExplore}
            <ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-0.5" />
          </a>
          <a
            href="#agent"
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.02_235/0.22)] px-5 py-3 text-sm font-semibold text-[oklch(0.88_0.005_180)] backdrop-blur transition hover:border-[oklch(0.6_0.03_235/0.4)] hover:bg-[oklch(0.2_0.014_235/0.5)] hover:-translate-y-0.5"
          >
            <Globe2 className="h-4 w-4 text-[oklch(0.78_0.09_165)]" />
            {t.ctaAgent}
          </a>
        </motion.div>

        {/* trust strip — muted destination wordmarks (social proof, restrained) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[oklch(0.5_0.012_220)]">
            Built for journeys to
          </span>
          {["Manchester", "Toronto", "Berlin", "Sydney", "Boston"].map((city) => (
            <span
              key={city}
              className="text-[13px] font-medium tracking-tight text-[oklch(0.62_0.012_220)] transition hover:text-[oklch(0.85_0.005_180)]"
            >
              {city}
            </span>
          ))}
        </motion.div>

        {/* bottom stats strip — refined, more breathing room */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-auto mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[oklch(0.5_0.02_235/0.14)] bg-[oklch(0.185_0.014_235/0.55)] backdrop-blur sm:grid-cols-4"
        >
          {[
            { k: t.stat1V, v: t.stat1L },
            { k: t.stat2V, v: t.stat2L },
            { k: t.stat3V, v: t.stat3L },
            { k: t.stat4V, v: t.stat4L },
          ].map((s, i) => (
            <div key={i} className="px-5 py-4">
              <div className="text-2xl font-semibold tracking-tight text-[oklch(0.97_0.003_180)] sm:text-3xl">
                {s.k}
              </div>
              <div className="mt-1 text-[11px] leading-tight tracking-wide text-[oklch(0.62_0.012_220)]">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
