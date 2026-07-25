"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowDown, Sparkles, Globe2 } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { HERO_STRINGS, type LocaleId } from "./data";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-40 w-40 rounded-full border-2 border-[oklch(0.72_0.15_165/0.3)] border-t-[oklch(0.72_0.15_165)] animate-spin" />
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
      {/* layered background */}
      <div className="pointer-events-none absolute inset-0 as-bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 as-radial-emerald" />
      <div className="pointer-events-none absolute inset-0 as-noise" />
      {/* top vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />
      {/* bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--shield-ink)] to-transparent" />
      {/* left-side darkening so text always reads clean (desktop) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] bg-gradient-to-r from-[var(--shield-ink)] via-[oklch(0.16_0.02_220/0.6)] to-transparent lg:block" />

      {/* 3D canvas — right portion on desktop, full-bleed background on mobile */}
      <div className="absolute inset-0 lg:left-[44%]">
        <Hero3DScene />
      </div>

      {/* overlay content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 sm:px-8">
        {/* top row: eyebrow + language toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-24 flex items-center justify-between gap-3 sm:mt-28"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.72_0.15_165/0.4)] bg-[oklch(0.72_0.15_165/0.08)] px-3 py-1 text-[11px] font-medium tracking-wide text-[oklch(0.82_0.16_165)] backdrop-blur">
            <Sparkles className="h-3 w-3" />
            {t.eyebrow}
          </span>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>

        {/* headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mt-6 max-w-xl lg:max-w-md"
        >
          {/* readability backdrop behind headline (desktop) */}
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 hidden rounded-3xl bg-gradient-to-r from-[oklch(0.16_0.02_220/0.85)] via-[oklch(0.16_0.02_220/0.45)] to-transparent lg:block" />
          <h1
            key={`title-${locale}`}
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--shield-text)] sm:text-5xl lg:text-6xl [text-shadow:0_2px_30px_oklch(0.16_0.02_220/0.9),0_1px_3px_oklch(0.16_0.02_220/0.8)]"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={locale}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {t.titleOne}{" "}
                <span className="as-text-gradient">{t.titleMemory}</span>
                <br />
                {t.titleFour}{" "}
                <span className="as-text-gradient-amber">{t.titleFinish}</span>
              </motion.span>
            </AnimatePresence>
          </h1>
          <p
            key={`sub-${locale}`}
            className="mt-5 max-w-md text-base leading-relaxed text-[oklch(0.85_0.005_180)] sm:text-lg [text-shadow:0_1px_16px_oklch(0.16_0.02_220/0.9)]"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={locale}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {t.subtitle}
              </motion.span>
            </AnimatePresence>
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
            className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.72_0.15_165)] px-5 py-3 text-sm font-semibold text-[oklch(0.16_0.02_220)] transition hover:bg-[oklch(0.82_0.16_165)] hover:-translate-y-0.5 as-glow-emerald"
          >
            <Shield className="h-4 w-4" />
            {t.ctaExplore}
            <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
          </a>
          <a
            href="#agent"
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.5_0.04_200/0.3)] bg-[oklch(0.24_0.03_220/0.5)] px-5 py-3 text-sm font-semibold text-[var(--shield-text)] backdrop-blur transition hover:border-[oklch(0.72_0.15_165/0.5)] hover:bg-[oklch(0.24_0.03_220/0.8)] hover:-translate-y-0.5"
          >
            <Globe2 className="h-4 w-4" />
            {t.ctaAgent}
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
            { k: t.stat1V, v: t.stat1L },
            { k: t.stat2V, v: t.stat2L },
            { k: t.stat3V, v: t.stat3L },
            { k: t.stat4V, v: t.stat4L },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[oklch(0.2_0.03_220/0.55)] px-4 py-4 backdrop-blur"
            >
              <div className="text-2xl font-semibold text-[oklch(0.82_0.16_165)] sm:text-3xl">
                {s.k}
              </div>
              <div className="mt-1 text-xs text-[oklch(0.82_0.005_180/0.85)]">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
