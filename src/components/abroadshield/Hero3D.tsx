"use client";

import { useRef, useState } from "react";
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
  const reveal = {
    hidden: { opacity: 0, y: 18 },
    show: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0 : 0.6, delay, ease: HERO_EASE },
    }),
  };

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-[var(--shield-border)] bg-[radial-gradient(circle_at_78%_30%,oklch(0.27_0.045_162/.2),transparent_32%),radial-gradient(circle_at_18%_85%,oklch(0.28_0.05_135/.1),transparent_25%),var(--shield-ink)]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 as-bg-grid opacity-45" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[oklch(0.18_0.022_165/.45)] to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          custom={0.04}
          variants={reveal}
          className="flex items-center justify-between pt-20 sm:pt-24"
        >
          <div className="as-public-eyebrow text-[8px] tracking-[0.22em]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)]" />{t.eyebrow}</div>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </motion.div>

        <div className="grid items-center gap-8 pb-12 pt-10 lg:min-h-[calc(86svh-84px)] lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 lg:pt-1">
          <div className="max-w-[570px]">
            <motion.div initial="hidden" animate="show" custom={0.1} variants={reveal} className="as-public-eyebrow mt-1">
              <Sparkles className="h-3 w-3" /> Study abroad × career OS
            </motion.div>
            <motion.h1 initial="hidden" animate="show" custom={0.16} variants={reveal} className="as-public-title mt-4 text-balance text-[clamp(2.65rem,5.2vw,4.65rem)]">
              <span className="block">From choosing</span>
              <span className="block as-text-gradient">the move</span>
              <span className="block">to landing the role.</span>
            </motion.h1>
            <motion.p initial="hidden" animate="show" custom={0.25} variants={reveal} className="as-public-copy mt-5 max-w-xl">
              AbroadShield keeps your profile, destination, documents and career goal in one evolving context—so the agent can decide what matters next, not just answer what you ask right now.
            </motion.p>
            <motion.div initial="hidden" animate="show" custom={0.34} variants={reveal} className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => onNavigate?.("journey")} className="as-public-button-primary group rounded-full px-4 py-2.5 text-[13px]">
                <BrainCircuit className="h-3.5 w-3.5" /> See the agent in action <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button type="button" onClick={() => onNavigate?.("journey")} className="as-public-button-secondary rounded-full px-4 py-2.5 text-[13px]">
                Explore the route <Target className="h-3.5 w-3.5" />
              </button>
            </motion.div>
            <motion.div initial="hidden" animate="show" custom={0.43} variants={reveal} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-semibold uppercase tracking-[0.13em] text-[var(--shield-text-faint)]">
              <span>Built for routes across</span>
              {DESTINATIONS.map((item, index) => <span key={item} className="inline-flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-[var(--shield-border-strong)]" />{item}</span>)}
            </motion.div>
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
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [2.5, -2.5]), { stiffness: 110, damping: 22 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-3.5, 3.5]), { stiffness: 110, damping: 22 });

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || reducedMotion) return;
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={() => { px.set(0); py.set(0); }}
      className="relative mx-auto h-[390px] w-full max-w-[575px] sm:h-[430px]"
      style={{ perspective: 1500 }}
      initial={{ opacity: 0, scale: 0.985, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.12, ease: HERO_EASE }}
    >
      <div aria-hidden className="absolute inset-[7%_8%_5%_8%] rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-panel)] shadow-[0_32px_90px_-55px_black]" />
      <div aria-hidden className="absolute inset-[13%_15%_12%_15%] rounded-[24px] border border-[var(--shield-emerald)]/10 bg-[var(--shield-ink)]/70" />

      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="absolute inset-[10%] [transform-style:preserve-3d]">
        <div aria-hidden className="absolute inset-[3%] rounded-[28px] border border-[var(--shield-emerald)]/10" style={{ transform: "translateZ(-18px)" }} />
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          <motion.div style={{ transform: "translateZ(42px)" }} className="as-public-card as-public-card--raised absolute left-1/2 top-1/2 w-[min(72%,350px)] -translate-x-1/2 -translate-y-1/2 p-4 shadow-[0_28px_70px_-40px_black] sm:p-5">
            <div className="flex items-center justify-between">
              <div className="text-[7px] font-bold uppercase tracking-[0.2em] text-[var(--shield-text-faint)]">Journey intelligence</div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink)]/60 px-1.5 py-0.5 text-[7px] font-semibold text-[var(--shield-emerald-bright)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)]" />active</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-tight tracking-[-0.025em] sm:text-xl">Your next move is bigger than your next answer.</h3>
            <p className="mt-1.5 text-[8px] leading-4 text-[var(--shield-text-faint)]">The agent reasons from your route, evidence and chosen outcome.</p>
            <div className="mt-3.5 space-y-1.5">
              {FLOW.map(({ label, detail, icon: Icon }, index) => (
                <button
                  type="button"
                  key={label}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className={`w-full rounded-lg border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50 ${active === index ? "border-[var(--shield-emerald)]/30 bg-[var(--shield-emerald)]/7" : "border-[var(--shield-border)] bg-[var(--shield-ink)]/45"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="as-public-icon h-6 w-6 rounded-md"><Icon className="h-3 w-3" /></span>
                    <span className="min-w-0"><span className="block text-[8px] font-semibold text-[var(--shield-text)]">{label}</span><span className="block text-[7px] text-[var(--shield-text-faint)]">{detail}</span></span>
                    <ArrowUpRight className="ml-auto h-2.5 w-2.5 text-[var(--shield-text-faint)]" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[var(--shield-border)] pt-2.5"><div className="flex items-center gap-1 text-[7px] font-semibold text-[var(--shield-text-faint)]"><Network className="h-2.5 w-2.5" />Context connected</div><span className="text-[7px] font-semibold text-[var(--shield-emerald-bright)]">Approval required</span></div>
          </motion.div>

          <HeroSignal className="left-[2%] top-[14%]" title="Profile" detail="CV · goals · constraints" icon={FileText} />
          <HeroSignal className="right-[2%] bottom-[16%]" title="Career" detail="Skills · roles · outcome" icon={BriefcaseBusiness} />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[2%] flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink)]/70 px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-[var(--shield-text-faint)] backdrop-blur-xl">
          <span className="h-1 w-1 rounded-full bg-[var(--shield-emerald-bright)]" /> Context → priority → controlled action
        </span>
      </div>
    </motion.div>
  );
}

function HeroSignal({ className, title, detail, icon: Icon }: { className: string; title: string; detail: string; icon: typeof FileText }) {
  return (
    <div className={`absolute z-20 hidden w-[138px] rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)]/90 p-2.5 shadow-[0_16px_45px_-28px_black] backdrop-blur-xl sm:block ${className}`}>
      <div className="flex items-center gap-2"><span className="as-public-icon h-7 w-7 rounded-lg"><Icon className="h-3 w-3" /></span><div><div className="text-[9px] font-semibold">{title}</div><div className="text-[7px] text-[var(--shield-text-faint)]">{detail}</div></div></div>
    </div>
  );
}
