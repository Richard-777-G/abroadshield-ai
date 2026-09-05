"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, BrainCircuit, BriefcaseBusiness, FileText, Globe2, Network, Sparkles, Target } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { HERO_STRINGS, type LocaleId } from "./data";

const DESTINATIONS = ["UK", "France", "Germany", "Netherlands", "Canada", "Australia"];
const FLOW = [
  { label: "Understand", detail: "Profile + CV", icon: FileText },
  { label: "Map", detail: "Country + study", icon: Globe2 },
  { label: "Prioritize", detail: "Next best move", icon: BrainCircuit },
  { label: "Build", detail: "Skills + role", icon: BriefcaseBusiness },
];

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const t = HERO_STRINGS[locale];
  const reducedMotion = useReducedMotion();
  const reveal = { hidden: { opacity: 0, y: 24 }, show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : .7, delay, ease: [0.22, 1, 0.36, 1] } }) };

  return (
    <section id="top" className="relative isolate min-h-[92svh] overflow-hidden border-b border-[var(--shield-border)] bg-[radial-gradient(circle_at_76%_27%,oklch(0.28_0.05_162/.32),transparent_34%),radial-gradient(circle_at_18%_88%,oklch(0.30_0.055_135/.18),transparent_28%),var(--shield-ink)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 as-bg-grid opacity-80" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[oklch(0.18_0.022_165/.62)] to-transparent" />
      <motion.div aria-hidden className="pointer-events-none absolute -right-28 top-12 h-[34rem] w-[34rem] rounded-full bg-[oklch(0.74_0.17_162/.11)] blur-3xl" animate={reducedMotion ? undefined : { x: [0, 24, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div aria-hidden className="pointer-events-none absolute left-[9%] top-[62%] h-56 w-56 rounded-full bg-[oklch(0.86_0.2_135/.07)] blur-3xl" animate={reducedMotion ? undefined : { x: [0, 18, 0], y: [0, -10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div initial="hidden" animate="show" custom={.05} variants={reveal} className="flex items-center justify-between pt-24 sm:pt-28">
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.24em] text-[oklch(0.82_0.11_165)]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.85_0.19_158)]" />{t.eyebrow}</div>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>

        <div className="grid min-h-[calc(92svh-92px)] items-center gap-10 pb-10 pt-12 lg:grid-cols-[.88fr_1.12fr] lg:gap-14 lg:pt-4">
          <div>
            <motion.div initial="hidden" animate="show" custom={.13} variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/.24)] bg-[oklch(0.74_0.17_162/.06)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-[oklch(0.88_0.2_158)]"><Sparkles className="h-3 w-3" />Study abroad × career OS</motion.div>
            <motion.h1 initial="hidden" animate="show" custom={.2} variants={reveal} className="mt-5 max-w-2xl text-balance text-[clamp(3.1rem,7vw,5.7rem)] font-semibold leading-[.92] tracking-[-.06em] text-[var(--shield-text)]"><span className="block">From choosing</span><span className="block as-text-gradient">the move</span><span className="block">to landing the role.</span></motion.h1>
            <motion.p initial="hidden" animate="show" custom={.31} variants={reveal} className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--shield-text-dim)] sm:text-[17px]">AbroadShield keeps your profile, destination, documents and career goal in one evolving context—so the agent can decide what matters next, not just answer what you ask right now.</motion.p>
            <motion.div initial="hidden" animate="show" custom={.41} variants={reveal} className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate?.("journey")} className="group inline-flex items-center gap-2 rounded-full bg-[var(--shield-text)] px-5 py-3 text-sm font-semibold text-[var(--shield-ink)] shadow-[0_14px_40px_oklch(0.74_0.17_162/.14)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_oklch(0.74_0.17_162/.2)]"><BrainCircuit className="h-4 w-4" />See the agent in action<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></button><button type="button" onClick={() => onNavigate?.("journey")} className="inline-flex items-center gap-2 rounded-full border border-[var(--shield-border-strong)] bg-[oklch(0.15_0.02_165/.45)] px-5 py-3 text-sm font-semibold text-[var(--shield-text)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[oklch(0.2_0.025_165/.65)]">Explore the route<Target className="h-3.5 w-3.5" /></button></motion.div>
            <motion.div initial="hidden" animate="show" custom={.5} variants={reveal} className="mt-8 flex flex-wrap gap-2">{DESTINATIONS.map((item) => <span key={item} className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.1_0.013_165/.55)] px-3 py-1.5 text-[9px] font-semibold text-[var(--shield-text-faint)]">{item}</span>)}<span className="px-1 py-1.5 text-[9px] font-semibold text-[var(--shield-text-faint)]">+ more routes</span></motion.div>
          </div>
          <HeroProductVisual reducedMotion={!!reducedMotion} />
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 hidden -translate-x-1/2 text-[8px] font-semibold uppercase tracking-[.28em] text-[var(--shield-text-faint)] lg:block">scroll to see the journey</div>
    </section>
  );
}

function HeroProductVisual({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(2);
  const px = useMotionValue(0); const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-.5, .5], [4, -4]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-.5, .5], [-6, 6]), { stiffness: 100, damping: 20 });
  const shift = useTransform(px, [-.5, .5], [-10, 10]);
  function handleMove(event: React.PointerEvent<HTMLDivElement>) { const rect = ref.current?.getBoundingClientRect(); if (!rect || reducedMotion) return; px.set((event.clientX - rect.left) / rect.width - .5); py.set((event.clientY - rect.top) / rect.height - .5); }

  return <motion.div ref={ref} onPointerMove={handleMove} onPointerLeave={() => { px.set(0); py.set(0); }} className="relative mx-auto h-[500px] w-full max-w-[660px] sm:h-[560px]" style={{ perspective: 1500 }} initial={{ opacity: 0, scale: .96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 1, delay: .18, ease: [0.22, 1, 0.36, 1] }}>
    <motion.div aria-hidden className="absolute inset-[6%_7%_5%_8%] rounded-[38px] border border-[oklch(0.74_0.17_162/.15)] bg-[oklch(0.11_0.014_165/.48)] shadow-[0_40px_120px_oklch(0.04_0.01_165/.55)] backdrop-blur-2xl" style={{ x: shift }} />
    <motion.div aria-hidden className="absolute inset-[11%_12%_10%_13%] rounded-[32px] border border-[oklch(0.74_0.17_162/.12)] bg-[linear-gradient(145deg,oklch(0.18_0.022_165/.88),oklch(0.09_0.012_165/.88))]" style={{ x: useTransform(px, [-.5, .5], [-5, 5]) }} />
    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-[10%] [transform-style:preserve-3d]">
      <motion.div aria-hidden className="absolute inset-[4%_6%_6%_4%] rounded-[34px] border border-[oklch(0.86_0.2_135/.12)]" animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 42, repeat: Infinity, ease: "linear" }} style={{ transform: "translateZ(-30px)" }} />
      <motion.div aria-hidden className="absolute inset-[10%_12%_12%_10%] rounded-full border border-dashed border-[oklch(0.74_0.17_162/.12)]" animate={reducedMotion ? undefined : { rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ transform: "translateZ(-14px)" }} />
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <motion.div style={{ transform: "translateZ(62px)" }} className="absolute left-1/2 top-1/2 w-[min(64%,360px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[oklch(0.98_0.005_160/.14)] bg-[linear-gradient(160deg,oklch(0.10_0.013_165/.92),oklch(0.07_0.011_165/.94))] p-5 shadow-[0_30px_100px_oklch(0.03_0.008_165/.72)] backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between"><div className="text-[8px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">Journey intelligence</div><span className="flex items-center gap-1.5 rounded-full border border-[oklch(0.74_0.17_162/.15)] bg-[oklch(0.74_0.17_162/.05)] px-2 py-1 text-[8px] font-semibold text-[oklch(0.84_0.18_158)]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.85_0.19_158)]" />active</span></div>
          <h3 className="mt-4 text-xl font-semibold leading-tight tracking-[-.025em] sm:text-2xl">Your next move is bigger than your next answer.</h3>
          <p className="mt-2 text-[9px] leading-5 text-[var(--shield-text-faint)]">The agent reasons from the route you are on, the evidence you have, and the outcome you chose.</p>
          <div className="mt-5 space-y-2">{FLOW.map(({ label, detail, icon: Icon }, index) => <motion.button type="button" key={label} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} className={`w-full rounded-xl border p-2.5 text-left transition ${active === index ? "border-[oklch(0.74_0.17_162/.34)] bg-[oklch(0.74_0.17_162/.07)]" : "border-[var(--shield-border)] bg-[oklch(0.13_0.017_165/.56)]"}`} whileHover={{ x: 3 }}><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/.18)] bg-[oklch(0.74_0.17_162/.05)]"><Icon className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" /></span><span className="min-w-0"><span className="block text-[9px] font-semibold text-[var(--shield-text)]">{label}</span><span className="block text-[8px] text-[var(--shield-text-faint)]">{detail}</span></span><ArrowUpRight className="ml-auto h-3 w-3 text-[var(--shield-text-faint)]" /></div></motion.button>)}</div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--shield-border)] pt-3"><div className="flex items-center gap-1.5 text-[8px] font-semibold text-[var(--shield-text-faint)]"><Network className="h-3 w-3" />Decision context connected</div><span className="text-[8px] font-semibold text-[oklch(0.85_0.19_158)]">Student approval required</span></div>
        </motion.div>
        <FloatingSignal className="left-[1%] top-[8%]" title="Profile" detail="CV · goals · constraints" icon={FileText} delay={.1} />
        <FloatingSignal className="right-[0%] top-[17%]" title="Destination" detail="Country + study fit" icon={Globe2} delay={.22} />
        <FloatingSignal className="left-[0%] bottom-[14%]" title="Evidence" detail="Docs + signals" icon={Target} delay={.34} />
        <FloatingSignal className="right-[1%] bottom-[5%]" title="Career" detail="Skills + roles" icon={BriefcaseBusiness} delay={.46} />
        <motion.div aria-hidden className="absolute left-[17%] top-[46%] h-px w-[25%] bg-gradient-to-r from-transparent via-[oklch(0.85_0.19_158/.34)] to-transparent" style={{ transform: "translateZ(20px) rotate(20deg)" }} animate={reducedMotion ? undefined : { opacity: [.2, .75, .2] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="absolute right-[17%] top-[42%] h-px w-[26%] bg-gradient-to-r from-transparent via-[oklch(0.85_0.19_158/.28)] to-transparent" style={{ transform: "translateZ(20px) rotate(-18deg)" }} animate={reducedMotion ? undefined : { opacity: [.7, .15, .7] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    </motion.div>
    <motion.div aria-hidden className="absolute left-[12%] bottom-[3%] flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.72)] px-3 py-2 text-[8px] font-semibold text-[var(--shield-text-faint)] shadow-lg backdrop-blur-xl" animate={reducedMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.85_0.19_158)]" />Reasoning layer</motion.div>
    <motion.div aria-hidden className="absolute right-[12%] bottom-[10%] flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.72)] px-3 py-2 text-[8px] font-semibold text-[var(--shield-text-faint)] shadow-lg backdrop-blur-xl" animate={reducedMotion ? undefined : { y: [0, 5, 0] }} transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: .4 }}><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.86_0.2_135)]" />Human control</motion.div>
    <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] uppercase tracking-[.2em] text-[var(--shield-text-faint)] opacity-75">Move across the surface</div>
  </motion.div>;
}

function FloatingSignal({ className, title, detail, icon: Icon, delay }: { className: string; title: string; detail: string; icon: typeof FileText; delay: number }) {
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: [0, -4, 0] }} transition={{ opacity: { duration: .5, delay }, y: { duration: 4.8 + delay, repeat: Infinity, ease: "easeInOut", delay } }} className={`absolute z-20 hidden w-[170px] rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165/.86)] p-3 shadow-[0_18px_55px_oklch(0.03_0.008_165/.5)] backdrop-blur-xl sm:block ${className}`} style={{ transform: "translateZ(40px)" }}><div className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/.2)] bg-[oklch(0.74_0.17_162/.05)]"><Icon className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" /></span><div><div className="text-[10px] font-semibold">{title}</div><div className="text-[8px] text-[var(--shield-text-faint)]">{detail}</div></div></div></motion.div>;
}
