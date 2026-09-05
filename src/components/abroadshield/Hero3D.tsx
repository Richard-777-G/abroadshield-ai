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
const HERO_EASE = [0.22, 1, 0.36, 1] as const;

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const t = HERO_STRINGS[locale];
  const reducedMotion = useReducedMotion();
  const reveal = { hidden: { opacity: 0, y: 18 }, show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : .65, delay, ease: HERO_EASE } }) };

  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-[var(--shield-border)] bg-[radial-gradient(circle_at_78%_30%,oklch(0.27_0.045_162/.24),transparent_32%),radial-gradient(circle_at_18%_85%,oklch(0.28_0.05_135/.13),transparent_25%),var(--shield-ink)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 as-bg-grid opacity-55" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[oklch(0.18_0.022_165/.5)] to-transparent" />
      <motion.div aria-hidden className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[oklch(0.74_0.17_162/.08)] blur-3xl" animate={reducedMotion ? undefined : { x: [0, 18, 0], y: [0, -10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div initial="hidden" animate="show" custom={.05} variants={reveal} className="flex items-center justify-between pt-20 sm:pt-24">
          <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[.22em] text-[oklch(0.82_0.11_165)]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.85_0.19_158)]" />{t.eyebrow}</div>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>

        <div className="grid items-center gap-8 pb-12 pt-10 lg:min-h-[calc(88svh-84px)] lg:grid-cols-[.82fr_1.18fr] lg:gap-10 lg:pt-2">
          <div className="max-w-[610px] lg:pb-3">
            <motion.div initial="hidden" animate="show" custom={.11} variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/.2)] bg-[oklch(0.74_0.17_162/.045)] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-[oklch(0.88_0.2_158)]"><Sparkles className="h-3 w-3" />Study abroad × career OS</motion.div>
            <motion.h1 initial="hidden" animate="show" custom={.17} variants={reveal} className="mt-4 text-balance text-[clamp(2.7rem,5.7vw,5rem)] font-semibold leading-[.94] tracking-[-.055em] text-[var(--shield-text)]"><span className="block">From choosing</span><span className="block as-text-gradient">the move</span><span className="block">to landing the role.</span></motion.h1>
            <motion.p initial="hidden" animate="show" custom={.27} variants={reveal} className="mt-5 max-w-lg text-[14px] leading-6 text-[var(--shield-text-dim)] sm:text-[15px]">AbroadShield keeps your profile, destination, documents and career goal in one evolving context—so the agent can decide what matters next, not just answer what you ask right now.</motion.p>
            <motion.div initial="hidden" animate="show" custom={.36} variants={reveal} className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => onNavigate?.("journey")} className="group inline-flex items-center gap-2 rounded-full bg-[var(--shield-text)] px-4 py-2.5 text-[13px] font-semibold text-[var(--shield-ink)] shadow-[0_12px_32px_oklch(0.74_0.17_162/.11)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_oklch(0.74_0.17_162/.16)]"><BrainCircuit className="h-3.5 w-3.5" />See the agent in action<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></button>
              <button type="button" onClick={() => onNavigate?.("journey")} className="inline-flex items-center gap-2 rounded-full border border-[var(--shield-border-strong)] bg-[oklch(0.15_0.02_165/.4)] px-4 py-2.5 text-[13px] font-semibold text-[var(--shield-text)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[oklch(0.2_0.025_165/.55)]">Explore the route<Target className="h-3.5 w-3.5" /></button>
            </motion.div>
            <motion.div initial="hidden" animate="show" custom={.44} variants={reveal} className="mt-6 flex flex-wrap gap-1.5">{DESTINATIONS.map((item) => <span key={item} className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.1_0.013_165/.5)] px-2.5 py-1 text-[8px] font-semibold text-[var(--shield-text-faint)]">{item}</span>)}<span className="px-1 py-1 text-[8px] font-semibold text-[var(--shield-text-faint)]">+ more routes</span></motion.div>
          </div>
          <HeroProductVisual reducedMotion={!!reducedMotion} />
        </div>
      </div>
    </section>
  );
}

function HeroProductVisual({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(2);
  const px = useMotionValue(0); const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-.5, .5], [3, -3]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-.5, .5], [-4.5, 4.5]), { stiffness: 100, damping: 20 });
  const shift = useTransform(px, [-.5, .5], [-7, 7]);
  function handleMove(event: React.PointerEvent<HTMLDivElement>) { const rect = ref.current?.getBoundingClientRect(); if (!rect || reducedMotion) return; px.set((event.clientX - rect.left) / rect.width - .5); py.set((event.clientY - rect.top) / rect.height - .5); }

  return <motion.div ref={ref} onPointerMove={handleMove} onPointerLeave={() => { px.set(0); py.set(0); }} className="relative mx-auto h-[420px] w-full max-w-[590px] sm:h-[470px]" style={{ perspective: 1500 }} initial={{ opacity: 0, scale: .98, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .85, delay: .14, ease: HERO_EASE }}>
    <motion.div aria-hidden className="absolute inset-[7%_8%_6%_9%] rounded-[30px] border border-[oklch(0.74_0.17_162/.13)] bg-[oklch(0.11_0.014_165/.4)] shadow-[0_32px_90px_oklch(0.04_0.01_165/.42)] backdrop-blur-2xl" style={{ x: shift }} />
    <motion.div aria-hidden className="absolute inset-[12%_13%_11%_14%] rounded-[26px] border border-[oklch(0.74_0.17_162/.1)] bg-[linear-gradient(145deg,oklch(0.18_0.022_165/.72),oklch(0.09_0.012_165/.78))]" style={{ x: useTransform(px, [-.5, .5], [-4, 4]) }} />
    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-[10%] [transform-style:preserve-3d]">
      <motion.div aria-hidden className="absolute inset-[4%_6%_6%_4%] rounded-[30px] border border-[oklch(0.86_0.2_135/.1)]" animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 48, repeat: Infinity, ease: "linear" }} style={{ transform: "translateZ(-24px)" }} />
      <motion.div aria-hidden className="absolute inset-[12%_15%_14%_12%] rounded-full border border-dashed border-[oklch(0.74_0.17_162/.1)]" animate={reducedMotion ? undefined : { rotate: -360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} style={{ transform: "translateZ(-12px)" }} />
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <motion.div style={{ transform: "translateZ(54px)" }} className="absolute left-1/2 top-1/2 w-[min(66%,330px)] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[oklch(0.98_0.005_160/.12)] bg-[linear-gradient(160deg,oklch(0.10_0.013_165/.93),oklch(0.07_0.011_165/.95))] p-4 shadow-[0_26px_80px_oklch(0.03_0.008_165/.62)] backdrop-blur-2xl sm:p-5">
          <div className="flex items-center justify-between"><div className="text-[7px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">Journey intelligence</div><span className="flex items-center gap-1 rounded-full border border-[oklch(0.74_0.17_162/.13)] bg-[oklch(0.74_0.17_162/.04)] px-1.5 py-0.5 text-[7px] font-semibold text-[oklch(0.84_0.18_158)]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.85_0.19_158)]" />active</span></div>
          <h3 className="mt-3 text-lg font-semibold leading-tight tracking-[-.025em] sm:text-xl">Your next move is bigger than your next answer.</h3>
          <p className="mt-1.5 text-[8px] leading-4 text-[var(--shield-text-faint)]">The agent reasons from your route, evidence and chosen outcome.</p>
          <div className="mt-3.5 space-y-1.5">{FLOW.map(({ label, detail, icon: Icon }, index) => <motion.button type="button" key={label} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} className={`w-full rounded-lg border p-2 text-left transition ${active === index ? "border-[oklch(0.74_0.17_162/.3)] bg-[oklch(0.74_0.17_162/.055)]" : "border-[var(--shield-border)] bg-[oklch(0.13_0.017_165/.48)]"}`} whileHover={{ x: 2 }}><div className="flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[oklch(0.74_0.17_162/.16)] bg-[oklch(0.74_0.17_162/.04)]"><Icon className="h-3 w-3 text-[oklch(0.85_0.19_158)]" /></span><span className="min-w-0"><span className="block text-[8px] font-semibold text-[var(--shield-text)]">{label}</span><span className="block text-[7px] text-[var(--shield-text-faint)]">{detail}</span></span><ArrowUpRight className="ml-auto h-2.5 w-2.5 text-[var(--shield-text-faint)]" /></div></motion.button>)}</div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--shield-border)] pt-2.5"><div className="flex items-center gap-1 text-[7px] font-semibold text-[var(--shield-text-faint)]"><Network className="h-2.5 w-2.5" />Context connected</div><span className="text-[7px] font-semibold text-[oklch(0.85_0.19_158)]">Approval required</span></div>
        </motion.div>
        <FloatingSignal className="left-[1%] top-[9%]" title="Profile" detail="CV · goals · constraints" icon={FileText} delay={.1} />
        <FloatingSignal className="right-[0%] top-[19%]" title="Destination" detail="Country + study fit" icon={Globe2} delay={.22} />
        <FloatingSignal className="left-[0%] bottom-[12%]" title="Evidence" detail="Docs + signals" icon={Target} delay={.34} />
        <FloatingSignal className="right-[1%] bottom-[3%]" title="Career" detail="Skills + roles" icon={BriefcaseBusiness} delay={.46} />
        <motion.div aria-hidden className="absolute left-[18%] top-[46%] h-px w-[23%] bg-gradient-to-r from-transparent via-[oklch(0.85_0.19_158/.25)] to-transparent" style={{ transform: "translateZ(16px) rotate(20deg)" }} animate={reducedMotion ? undefined : { opacity: [.15, .55, .15] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="absolute right-[18%] top-[42%] h-px w-[24%] bg-gradient-to-r from-transparent via-[oklch(0.85_0.19_158/.2)] to-transparent" style={{ transform: "translateZ(16px) rotate(-18deg)" }} animate={reducedMotion ? undefined : { opacity: [.55, .12, .55] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    </motion.div>
    <motion.div aria-hidden className="absolute left-[12%] bottom-[2%] flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.68)] px-2.5 py-1.5 text-[7px] font-semibold text-[var(--shield-text-faint)] shadow-lg backdrop-blur-xl" animate={reducedMotion ? undefined : { y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><span className="h-1 w-1 rounded-full bg-[oklch(0.85_0.19_158)]" />Reasoning layer</motion.div>
    <motion.div aria-hidden className="absolute right-[12%] bottom-[8%] flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.08_0.012_165/.68)] px-2.5 py-1.5 text-[7px] font-semibold text-[var(--shield-text-faint)] shadow-lg backdrop-blur-xl" animate={reducedMotion ? undefined : { y: [0, 3, 0] }} transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: .4 }}><span className="h-1 w-1 rounded-full bg-[oklch(0.86_0.2_135)]" />Human control</motion.div>
    <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] uppercase tracking-[.18em] text-[var(--shield-text-faint)] opacity-65">Move across the surface</div>
  </motion.div>;
}

function FloatingSignal({ className, title, detail, icon: Icon, delay }: { className: string; title: string; detail: string; icon: typeof FileText; delay: number }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: [0, -3, 0] }} transition={{ opacity: { duration: .45, delay }, y: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay } }} className={`absolute z-20 hidden w-[145px] rounded-xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165/.82)] p-2.5 shadow-[0_16px_45px_oklch(0.03_0.008_165/.45)] backdrop-blur-xl sm:block ${className}`} style={{ transform: "translateZ(36px)" }}><div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/.17)] bg-[oklch(0.74_0.17_162/.045)]"><Icon className="h-3 w-3 text-[oklch(0.85_0.19_158)]" /></span><div><div className="text-[9px] font-semibold">{title}</div><div className="text-[7px] text-[var(--shield-text-faint)]">{detail}</div></div></div></motion.div>;
}
