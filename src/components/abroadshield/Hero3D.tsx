"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowDown, BrainCircuit, MapPin } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import AIPrimeCore from "./AIPrimeCore";
import { HERO_STRINGS, type LocaleId } from "./data";

const DESTINATIONS = ["France", "United Kingdom", "Canada", "Germany", "Australia", "Netherlands", "United States", "Ireland", "New Zealand", "Singapore"];
const PHASE_VISUALS = [
  { name: "Pre-Departure", image: "/phases/pre-departure.png", signal: "Requirements → documents → approval" },
  { name: "Arrival", image: "/phases/arrival.png", signal: "Landing → housing → registration" },
  { name: "Studying & Part-Time", image: "/phases/studying.png", signal: "Study → work → stay compliant" },
  { name: "Job Success", image: "/phases/job-success.png", signal: "Roles → applications → career" },
];

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const [destinationIndex, setDestinationIndex] = useState(0);
  const [visualIndex, setVisualIndex] = useState(0);
  const t = HERO_STRINGS[locale];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDestinationIndex((current) => (current + 1) % DESTINATIONS.length);
      setVisualIndex((current) => (current + 1) % PHASE_VISUALS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const visual = PHASE_VISUALS[visualIndex];

  return <section id="top" className="relative min-h-[92svh] w-full overflow-hidden bg-transparent">
    <div aria-hidden className="pointer-events-none absolute right-[8%] top-[10%] h-[55vh] w-[55vh] rounded-full [background:radial-gradient(circle,oklch(0.74_0.17_162/0.2),transparent_65%)] blur-3xl" />
    <div aria-hidden className="pointer-events-none absolute bottom-[5%] left-[15%] h-[38vh] w-[38vh] rounded-full [background:radial-gradient(circle,oklch(0.86_0.2_135/0.11),transparent_65%)] blur-3xl" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />

    <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col px-6 sm:px-10">
      <div className="mt-24 flex items-center justify-between gap-3 sm:mt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.22_0.025_165/0.6)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[oklch(0.85_0.19_158)] backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />{t.eyebrow}</span>
        <LanguageToggle locale={locale} onChange={setLocale} />
      </div>

      <div className="mt-10 grid flex-1 items-center gap-10 lg:mt-6 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[oklch(0.68_0.02_165)]">
            <MapPin className="h-3.5 w-3.5 text-[oklch(0.78_0.09_165)]" />
            <span>Built for students, wherever they are headed</span>
          </div>

          <h1 className="text-balance text-[2.45rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[var(--shield-text)] sm:text-6xl lg:text-[4.1rem]">{t.titleOne} <span className="as-shimmer">{t.titleMemory}</span><br />{t.titleFour} <span className="as-text-gradient-amber">{t.titleFinish}</span></h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[oklch(0.78_0.01_220)] sm:text-base lg:text-[17px]">{t.subtitle}</p>

          <div className="mt-7 flex items-center gap-2 text-sm text-[var(--shield-text-dim)]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.5_0.015_165)]">Country context</span>
            <AnimatePresence mode="wait">
              <motion.span key={DESTINATIONS[destinationIndex]} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="font-semibold text-[oklch(0.86_0.08_165)]">
                {DESTINATIONS[destinationIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="h-1 w-1 rounded-full bg-[oklch(0.74_0.17_162)]" />
            <span>country-aware workflow</span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigate?.("journey")} className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><Shield className="h-4 w-4" />{t.ctaExplore}<ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-0.5" /></button>
            <button onClick={() => onNavigate?.("agent")} className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.6_0.04_165/0.22)] px-5 py-3 text-sm font-semibold text-[oklch(0.88_0.005_180)] backdrop-blur transition hover:border-[oklch(0.6_0.03_235/0.4)] hover:bg-[oklch(0.24_0.028_165/0.5)] hover:-translate-y-0.5"><BrainCircuit className="h-4 w-4 text-[oklch(0.78_0.09_165)]" />{t.ctaAgent}</button>
          </div>

          <div className="mt-8 flex items-center gap-3 text-[11px] text-[oklch(0.55_0.02_165)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.35)]" />
            <span>One platform. One memory. Four phases.</span>
          </div>
        </motion.div>

        <div className="relative flex min-h-[430px] items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={visual.image} initial={{ opacity: 0, scale: 1.04, x: 18 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.98, x: -18 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-4 overflow-hidden rounded-[2rem] border border-[oklch(0.74_0.17_162/0.18)] bg-[oklch(0.12_0.018_165/0.75)] shadow-2xl">
              <img src={visual.image} alt="" className="h-full w-full object-cover opacity-35" loading="eager" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[oklch(0.12_0.018_165/0.98)] via-[oklch(0.12_0.018_165/0.5)] to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,oklch(0.74_0.17_162/0.14),transparent_50%)]" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.78_0.09_165)]">Current phase</div>
                  <AnimatePresence mode="wait"><motion.div key={visual.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }} className="mt-1 text-xl font-semibold text-[var(--shield-text)]">{visual.name}</motion.div></AnimatePresence>
                  <div className="mt-1 text-xs text-[var(--shield-text-dim)]">{visual.signal}</div>
                </div>
                <div className="hidden rounded-xl border border-[oklch(0.74_0.17_162/0.25)] bg-[oklch(0.12_0.018_165/0.65)] px-3 py-2 text-right backdrop-blur sm:block"><div className="text-[9px] uppercase tracking-[0.15em] text-[oklch(0.55_0.02_165)]">System</div><div className="mt-1 text-xs font-semibold text-[oklch(0.84_0.08_165)]">Context in sync</div></div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10"><AIPrimeCore /></div>
          <FloatingLabel className="left-[-2%] top-[12%]" label="Documents" value="11 / 13 verified" />
          <FloatingLabel className="right-[-2%] top-[22%]" label="Drafts ready" value="5 awaiting you" />
          <FloatingLabel className="bottom-[8%] right-[2%]" label="Visa runway" value="94 days" />
        </div>
      </div>
    </div>
  </section>;
}

function FloatingLabel({className,label,value}:{className?:string;label:string;value:string}) { return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={`absolute hidden rounded-xl border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.16_0.02_165/0.75)] px-3 py-2 text-[oklch(0.85_0.19_158)] backdrop-blur-md md:block ${className}`}><div className="text-[9px] font-medium uppercase tracking-[0.15em] opacity-80">{label}</div><div className="mt-0.5 text-xs font-semibold">{value}</div></motion.div> }
