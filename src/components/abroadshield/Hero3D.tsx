"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, FileText, Globe2, Network, Sparkles, Target } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { HERO_STRINGS, type LocaleId } from "./data";

const DESTINATIONS = ["United Kingdom", "France", "Germany", "Netherlands", "Canada", "Australia", "Ireland", "United States"];

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const t = HERO_STRINGS[locale];

  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-transparent">
      <motion.div aria-hidden className="pointer-events-none absolute right-[5%] top-[7%] h-[48vh] w-[48vh] rounded-full [background:radial-gradient(circle,oklch(0.74_0.17_162/0.24),transparent_68%)] blur-3xl" animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.95, 1.06, 0.95] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="pointer-events-none absolute bottom-[2%] left-[8%] h-[34vh] w-[34vh] rounded-full [background:radial-gradient(circle,oklch(0.82_0.13_210/0.10),transparent_70%)] blur-3xl" animate={{ x: [0, 25, 0], y: [0, -12, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--shield-ink)] to-transparent" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .1 }} className="mt-24 flex items-center justify-between sm:mt-28">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[oklch(0.78_0.08_165)]"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />{t.eyebrow}</span>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>
        <div className="mt-8 grid flex-1 items-center gap-12 pb-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-14 lg:pb-14">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.24)] bg-[oklch(0.74_0.17_162/0.06)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.16em] text-[oklch(0.85_0.19_158)]"><Sparkles className="h-3 w-3" />Study abroad → career</div>
            <h1 className="max-w-3xl text-balance text-[2.75rem] font-semibold leading-[.99] tracking-[-0.045em] text-[var(--shield-text)] sm:text-6xl lg:text-[4.45rem]">Your move abroad is a journey.<br /><span className="as-shimmer">Your AI should see the whole thing.</span></h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[oklch(0.76_0.015_220)] sm:text-[17px]">AbroadShield connects your study decision, country strategy, applications, preparation, networking and eventual full-time job into one evolving plan — instead of making you manage a dozen disconnected tools.</p>
            <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate?.("journey")} className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><BrainCircuit className="h-4 w-4" />See how the agent works<ArrowRight className="h-3.5 w-3.5" /></button><button type="button" onClick={() => onNavigate?.("journey")} className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.6_0.04_165/0.22)] px-5 py-3 text-sm font-semibold text-[oklch(0.88_0.005_180)] transition hover:-translate-y-0.5 hover:bg-[oklch(0.24_0.028_165/0.5)]"><Target className="h-4 w-4" />Explore the blueprint</button></div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[.14em] text-[oklch(0.55_0.015_165)]">{DESTINATIONS.slice(0, 4).map((item) => <span key={item}>{item}</span>)}<span>+ more destinations</span></div>
          </motion.div>
          <HeroProductVisual />
        </div>
      </div>
    </section>
  );
}

function HeroProductVisual() {
  const nodes = [
    { icon: FileText, title: "Profile + CV", text: "Understand the student", x: "left-[3%] top-[9%]", delay: 0 },
    { icon: Globe2, title: "Destination strategy", text: "Country + study fit", x: "right-[0%] top-[20%]", delay: .12 },
    { icon: BrainCircuit, title: "AI reasoning layer", text: "Prioritize what matters", x: "left-[0%] bottom-[22%]", delay: .24 },
    { icon: Network, title: "Career network", text: "Skills + people + roles", x: "right-[3%] bottom-[8%]", delay: .36 },
  ];
  return <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .25 }} className="relative mx-auto flex min-h-[470px] w-full max-w-[640px] items-center justify-center"><div className="absolute inset-x-[8%] top-[7%] h-[82%] rounded-[36px] border border-[oklch(0.74_0.17_162/0.13)] bg-[oklch(0.12_0.016_165/0.6)] shadow-[0_40px_120px_oklch(0.05_0.02_165/0.55)] backdrop-blur-xl"/><div className="absolute inset-x-[12%] top-[13%] h-[70%] rounded-[30px] border border-[oklch(0.74_0.17_162/0.12)] bg-[linear-gradient(145deg,oklch(0.16_0.02_165/.86),oklch(0.10_0.013_165/.78))]"/><div className="relative z-10 h-[340px] w-[340px] sm:h-[390px] sm:w-[390px]"><motion.div className="absolute inset-[17%] rounded-full border border-[oklch(0.74_0.17_162/0.25)]" animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}/><motion.div className="absolute inset-[25%] rounded-full border border-dashed border-[oklch(0.74_0.17_162/0.16)]" animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}/><motion.div className="absolute inset-[32%] rounded-full" animate={{ scale: [1, 1.06, 1], opacity: [.65, 1, .65] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ background: "radial-gradient(circle at 35% 30%, oklch(0.86 0.2 158 / .95), oklch(0.74 0.17 162 / .55) 45%, transparent 74%)", boxShadow: "0 0 80px oklch(0.74 0.17 162 / .35)" }}/><div className="absolute inset-0 flex items-center justify-center"><div className="relative w-[62%] rounded-[28px] border border-[oklch(0.98_0.005_160/.14)] bg-[oklch(0.08_0.012_165/.72)] p-5 shadow-2xl backdrop-blur-2xl"><div className="flex items-center justify-between"><div className="text-[8px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">AbroadShield agent</div><span className="flex items-center gap-1 text-[8px] font-semibold text-[oklch(0.85_0.19_158)]"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]"/>active</span></div><div className="mt-4 text-base font-semibold leading-tight">Building your path from study choice to full-time role.</div><div className="mt-4 space-y-2">{["Understand profile", "Map the journey", "Identify next leverage", "Prepare the next action"].map((item, index) => <motion.div key={item} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .65 + index * .12 }} className="flex items-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/.6)] px-3 py-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.74_0.17_162/.13)] text-[8px] font-bold text-[oklch(0.85_0.19_158)]">{String(index + 1).padStart(2, "0")}</span><span className="text-[9px] text-[var(--shield-text-dim)]">{item}</span></motion.div>)}</div></div></div></div>{nodes.map(({ icon: Icon, title, text, x, delay }) => <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: [0, -5, 0] }} transition={{ opacity: { duration: .5, delay: .4 + delay }, y: { duration: 4.5 + delay, repeat: Infinity, ease: "easeInOut", delay } }} className={`absolute z-20 ${x} hidden w-[178px] rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/.86)] p-3 backdrop-blur-xl sm:block`}><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.26)] bg-[oklch(0.74_0.17_162/0.08)]"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]"/></span><div><div className="text-[10px] font-semibold">{title}</div><div className="text-[9px] text-[var(--shield-text-faint)]">{text}</div></div></div></motion.div>)}</motion.div>;
}
