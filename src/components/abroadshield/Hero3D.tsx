"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowDown, BrainCircuit } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import AIPrimeCore from "./AIPrimeCore";
import { HERO_STRINGS, type LocaleId } from "./data";

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const t = HERO_STRINGS[locale];
  return <section id="top" className="relative min-h-[92svh] w-full overflow-hidden bg-transparent">
    <div aria-hidden className="pointer-events-none absolute right-[8%] top-[10%] h-[55vh] w-[55vh] rounded-full [background:radial-gradient(circle,oklch(0.74_0.17_162/0.2),transparent_65%)] blur-3xl" />
    <div aria-hidden className="pointer-events-none absolute bottom-[5%] left-[15%] h-[38vh] w-[38vh] rounded-full [background:radial-gradient(circle,oklch(0.86_0.2_135/0.11),transparent_65%)] blur-3xl" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />
    <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col px-6 sm:px-10">
      <div className="mt-24 flex items-center justify-between gap-3 sm:mt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.22_0.025_165/0.6)] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[oklch(0.85_0.19_158)] backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />{t.eyebrow}</span>
        <LanguageToggle locale={locale} onChange={setLocale} />
      </div>
      <div className="mt-10 grid flex-1 items-center gap-10 lg:mt-6 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <h1 className="text-balance text-[2.45rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[var(--shield-text)] sm:text-6xl lg:text-[4.1rem]">{t.titleOne} <span className="as-shimmer">{t.titleMemory}</span><br />{t.titleFour} <span className="as-text-gradient-amber">{t.titleFinish}</span></h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[oklch(0.78_0.01_220)] sm:text-base lg:text-[17px]">{t.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => onNavigate?.("journey")} className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><Shield className="h-4 w-4" />{t.ctaExplore}<ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-0.5" /></button>
            <button onClick={() => onNavigate?.("agent")} className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.6_0.04_165/0.22)] px-5 py-3 text-sm font-semibold text-[oklch(0.88_0.005_180)] backdrop-blur transition hover:border-[oklch(0.6_0.03_235/0.4)] hover:bg-[oklch(0.24_0.028_165/0.5)] hover:-translate-y-0.5"><BrainCircuit className="h-4 w-4 text-[oklch(0.78_0.09_165)]" />{t.ctaAgent}</button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"><span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[oklch(0.5_0.015_165)]">Built for journeys to</span>{["Manchester","Toronto","Berlin","Sydney","Boston"].map(city => <span key={city} className="text-[13px] font-medium tracking-tight text-[oklch(0.68_0.02_165)]">{city}</span>)}</div>
        </motion.div>
        <div className="relative flex items-center justify-center"><AIPrimeCore /><FloatingLabel className="left-[-6%] top-[8%]" label="Documents" value="11 / 13 verified" /><FloatingLabel className="right-[-4%] top-[20%]" label="Drafts ready" value="5 awaiting you" /><FloatingLabel className="bottom-[10%] right-[-2%]" label="Visa runway" value="94 days" /></div>
      </div>
    </div>
  </section>;
}

function FloatingLabel({className,label,value}:{className?:string;label:string;value:string}) { return <div className={`absolute hidden rounded-xl border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.16_0.02_165/0.75)] px-3 py-2 text-[oklch(0.85_0.19_158)] backdrop-blur-md md:block ${className}`}><div className="text-[9px] font-medium uppercase tracking-[0.15em] opacity-80">{label}</div><div className="mt-0.5 text-xs font-semibold">{value}</div></div> }
