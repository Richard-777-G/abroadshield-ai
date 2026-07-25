"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Shield, ArrowDown, Globe2 } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import HoloShield from "./HoloShield";
import { HERO_STRINGS, type LocaleId } from "./data";

export default function Hero3D() {
  const [locale, setLocale] = useState<LocaleId>("en");
  const t = HERO_STRINGS[locale];

  // subtle parallax on the hologram as the user scrolls
  const { scrollY } = useScroll();
  const holoY = useTransform(scrollY, [0, 600], [0, -60]);
  const holoScale = useTransform(scrollY, [0, 600], [1, 0.94]);
  const holoOpacity = useTransform(scrollY, [0, 500], [1, 0.4]);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-transparent"
    >
      {/* ---------- atmospheric background (hero-local, sits above the global floating layer) ---------- */}
      <motion.div
        aria-hidden
        className="as-aurora pointer-events-none absolute right-[8%] top-[10%] h-[55vh] w-[55vh] rounded-full [background:radial-gradient(circle,oklch(0.74_0.17_162/0.22),transparent_65%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        className="as-aurora pointer-events-none absolute bottom-[5%] left-[15%] h-[38vh] w-[38vh] rounded-full [background:radial-gradient(circle,oklch(0.86_0.2_135/0.12),transparent_65%)] blur-3xl [animation-delay:6s]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 sm:px-10">
        {/* top row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-24 flex items-center justify-between gap-3 sm:mt-28"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.22_0.025_165/0.6)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[oklch(0.85_0.19_158)] backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.74_0.17_162)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />
            </span>
            {t.eyebrow}
          </span>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>

        {/* hero body: text left, hologram right */}
        <div className="mt-10 grid flex-1 items-center gap-8 lg:mt-6 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* ---- text column ---- */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              key={`title-${locale}`}
              className="text-balance text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.025em] text-[var(--shield-text)] sm:text-6xl lg:text-[4rem] lg:tracking-[-0.035em]"
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

            <p
              key={`sub-${locale}`}
              className="mt-6 max-w-md text-[15px] leading-relaxed text-[oklch(0.78_0.01_220)] sm:text-base lg:text-[17px]"
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

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
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

            {/* trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[oklch(0.5_0.012_220)]">
                Built for journeys to
              </span>
              {["Manchester", "Toronto", "Berlin", "Sydney", "Boston"].map(
                (city, i) => (
                  <motion.span
                    key={city}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="text-[13px] font-medium tracking-tight text-[oklch(0.62_0.012_220)] transition hover:text-[oklch(0.85_0.005_180)]"
                  >
                    {city}
                  </motion.span>
                )
              )}
            </motion.div>
          </motion.div>

          {/* ---- hologram column ---- */}
          <motion.div
            style={{ y: holoY, scale: holoScale, opacity: holoOpacity }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            <HoloShield />

            {/* floating label cards around the hologram — HUD-style */}
            <FloatingLabel
              className="left-[-8%] top-[12%]"
              label="Agent"
              value="online"
              tone="emerald"
              delay={1.2}
            />
            <FloatingLabel
              className="right-[-6%] top-[28%]"
              label="Phase"
              value="01 / 04"
              tone="amber"
              delay={1.5}
            />
            <FloatingLabel
              className="bottom-[14%] left-[-4%]"
              label="Deadlines"
              value="27 tracked"
              tone="cyan"
              delay={1.8}
            />
          </motion.div>
        </div>

        {/* bottom stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[oklch(0.5_0.02_235/0.14)] bg-[oklch(0.185_0.014_235/0.55)] backdrop-blur sm:grid-cols-4"
        >
          {[
            { k: t.stat1V, v: t.stat1L },
            { k: t.stat2V, v: t.stat2L },
            { k: t.stat3V, v: t.stat3L },
            { k: t.stat4V, v: t.stat4L },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              className="px-5 py-4"
            >
              <div className="text-2xl font-semibold tracking-tight text-[oklch(0.97_0.003_180)] sm:text-3xl">
                {s.k}
              </div>
              <div className="mt-1 text-[11px] leading-tight tracking-wide text-[oklch(0.62_0.012_220)]">
                {s.v}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- floating HUD label ---------- */
const TONE: Record<string, string> = {
  emerald: "text-[oklch(0.78_0.11_165)] border-[oklch(0.62_0.09_165/0.4)] bg-[oklch(0.62_0.09_165/0.08)]",
  amber: "text-[oklch(0.8_0.1_75)] border-[oklch(0.74_0.11_75/0.4)] bg-[oklch(0.74_0.11_75/0.08)]",
  cyan: "text-[oklch(0.78_0.07_215)] border-[oklch(0.7_0.08_215/0.4)] bg-[oklch(0.7_0.08_215/0.08)]",
};

function FloatingLabel({
  className,
  label,
  value,
  tone,
  delay,
}: {
  className?: string;
  label: string;
  value: string;
  tone: keyof typeof TONE;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -5, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`absolute hidden rounded-xl border px-3 py-2 backdrop-blur-md md:block ${TONE[tone]} ${className}`}
    >
      <div className="text-[9px] font-medium uppercase tracking-[0.15em] opacity-80">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold">{value}</div>
    </motion.div>
  );
}
