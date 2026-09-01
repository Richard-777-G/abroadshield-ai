"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, CalendarClock, FileCheck2, BrainCircuit } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import AIPrimeCore from "./AIPrimeCore";
import { HERO_STRINGS, type LocaleId } from "./data";

const DESTINATIONS = ["United Kingdom", "France", "Germany", "Netherlands", "Canada", "Australia", "Ireland", "United States"];

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const [destinationIndex, setDestinationIndex] = useState(0);
  const t = HERO_STRINGS[locale];
  const destination = DESTINATIONS[destinationIndex];

  return <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-transparent">
    <motion.div aria-hidden className="as-aurora pointer-events-none absolute right-[8%] top-[10%] h-[55vh] w-[55vh] rounded-full [background:radial-gradient(circle,oklch(0.74_0.17_162/0.25),transparent_65%)] blur-3xl" />
    <motion.div aria-hidden className="as-aurora pointer-events-none absolute bottom-[5%] left-[15%] h-[38vh] w-[38vh] rounded-full [background:radial-gradient(circle,oklch(0.86_0.2_135/0.15),transparent_65%)] blur-3xl [animation-delay:6s]" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />

    <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 sm:px-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mt-24 flex items-center justify-between sm:mt-28">
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.78_0.08_165)]"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />The AI workspace for your move abroad</span>
        <LanguageToggle locale={locale} onChange={setLocale} />
      </motion.div>

      <div className="mt-8 grid flex-1 items-center gap-10 pb-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <h1 className="max-w-3xl text-balance text-[2.65rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--shield-text)] sm:text-6xl lg:text-[4.35rem]">Plan the move.<br /><span className="as-shimmer">Protect the journey.</span><br />Let the agent execute.</h1>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-[oklch(0.76_0.015_220)] sm:text-[17px]">AbroadShield AI brings your applications, deadlines, documents, decisions and career moves into one persistent workspace—then helps you act on them.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => onNavigate?.("agent")} className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><BrainCircuit className="h-4 w-4" />Start with the agent<ArrowRight className="h-3.5 w-3.5" /></button>
            <button onClick={() => onNavigate?.("journey")} className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.6_0.04_165/0.22)] px-5 py-3 text-sm font-semibold text-[oklch(0.88_0.005_180)] transition hover:-translate-y-0.5 hover:bg-[oklch(0.24_0.028_165/0.5)]"><CalendarClock className="h-4 w-4" />See the journey</button>
          </div>
          <button onClick={() => setDestinationIndex(i => (i + 1) % DESTINATIONS.length)} className="mt-7 text-left text-[11px] uppercase tracking-[0.16em] text-[oklch(0.52_0.015_165)] hover:text-[oklch(0.72_0.02_165)]">Built for wherever your journey takes you <span className="ml-1 normal-case tracking-normal text-[13px] text-[oklch(0.72_0.02_165)]">· {destination}</span></button>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.35 }} className="relative flex min-h-[420px] items-center justify-center">
          <AIPrimeCore />
          <FloatingLabel className="left-[-2%] top-[12%]" label="Documents" value="11 / 13 verified" tone="emerald" />
          <FloatingLabel className="right-[0%] top-[22%]" label="Next action" value="Review application" tone="amber" />
          <FloatingLabel className="right-[3%] bottom-[12%]" label="Visa runway" value="94 days" tone="cyan" />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Shield} value="Protected" label="Your decisions stay yours" />
        <StatCard icon={CalendarClock} value="Live" label="Deadlines & milestones" />
        <StatCard icon={FileCheck2} value="Verified" label="Documents & requirements" />
        <StatCard icon={BrainCircuit} value="Persistent" label="Agent context across the journey" />
      </motion.div>
    </div>
  </section>;
}

const TONE: Record<string, string> = { emerald: "text-[oklch(0.85_0.19_158)] border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.08)]", amber: "text-[oklch(0.86_0.17_80)] border-[oklch(0.8_0.15_80/0.4)] bg-[oklch(0.8_0.15_80/0.08)]", cyan: "text-[oklch(0.82_0.13_210)] border-[oklch(0.74_0.13_210/0.4)] bg-[oklch(0.74_0.13_210/0.08)]" };

function FloatingLabel({ className, label, value, tone }: { className?: string; label: string; value: string; tone: keyof typeof TONE }) {
  return <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }} transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} className={`absolute hidden rounded-xl border px-3 py-2 backdrop-blur-md md:block ${TONE[tone]} ${className}`}><div className="text-[9px] font-medium uppercase tracking-[0.15em] opacity-80">{label}</div><div className="mt-0.5 text-xs font-semibold">{value}</div></motion.div>;
}

function StatCard({ icon: Icon, value, label }: { icon: typeof Shield; value: string; label: string }) {
  return <div className="as-card-hover flex items-center gap-3 rounded-2xl border border-[oklch(0.6_0.04_165/0.16)] as-glass px-4 py-3.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.1)]"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></span><div><div className="text-sm font-semibold text-[oklch(0.98_0.005_160)]">{value}</div><div className="mt-0.5 text-[10px] leading-tight text-[oklch(0.68_0.02_165)]">{label}</div></div></div>;
}
