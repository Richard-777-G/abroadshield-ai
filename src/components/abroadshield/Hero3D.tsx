"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 90, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 90, damping: 20 });
  const depth = useTransform(mx, [-0.5, 0.5], [-8, 8]);

  const nodes = [
    { icon: FileText, title: "Profile + CV", text: "Understand the student", x: "left-[0%] top-[7%]", delay: 0 },
    { icon: Globe2, title: "Destination strategy", text: "Country + study fit", x: "right-[0%] top-[17%]", delay: .12 },
    { icon: BrainCircuit, title: "AI reasoning layer", text: "Prioritize what matters", x: "left-[1%] bottom-[20%]", delay: .24 },
    { icon: Network, title: "Career network", text: "Skills + people + roles", x: "right-[1%] bottom-[7%]", delay: .36 },
  ];

  function move(event: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((event.clientX - rect.left) / rect.width - .5);
    my.set((event.clientY - rect.top) / rect.height - .5);
  }

  return <motion.div ref={ref} onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0); }} onPointerDown={() => setActive((value) => (value + 1) % 4)} style={{ perspective: 1200 }} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .25 }} className="relative mx-auto flex min-h-[440px] w-full max-w-[640px] items-center justify-center cursor-default select-none sm:min-h-[480px]">
    <motion.div aria-hidden className="absolute inset-x-[8%] top-[6%] h-[84%] rounded-[36px] border border-[oklch(0.74_0.17_162/0.13)] bg-[oklch(0.12_0.016_165/0.58)] shadow-[0_40px_120px_oklch(0.05_0.02_165/0.55)] backdrop-blur-xl" style={{ x: depth }} />
    <motion.div aria-hidden className="absolute inset-x-[12%] top-[12%] h-[72%] rounded-[30px] border border-[oklch(0.74_0.17_162/0.12)] bg-[linear-gradient(145deg,oklch(0.16_0.02_165/.88),oklch(0.10_0.013_165/.8))]" style={{ x: useTransform(mx, [-.5, .5], [-4, 4]) }} />

    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative z-10 h-[360px] w-[360px] sm:h-[390px] sm:w-[390px]">
      <motion.div aria-hidden className="absolute inset-[15%] rounded-full border border-[oklch(0.74_0.17_162/0.25)]" animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }} />
      <motion.div aria-hidden className="absolute inset-[23%] rounded-full border border-dashed border-[oklch(0.74_0.17_162/0.15)]" animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
      <motion.div aria-hidden className="absolute inset-[31%] rounded-full" animate={{ scale: [1, 1.045, 1], opacity: [.6, 1, .6] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ background: "radial-gradient(circle at 35% 30%, oklch(0.86 0.2 158 / .95), oklch(0.74 0.17 162 / .52) 45%, transparent 74%)", boxShadow: "0 0 80px oklch(0.74 0.17 162 / .34)" }} />
      <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
        <motion.div style={{ transform: "translateZ(46px)" }} className="relative w-[62%] rounded-[28px] border border-[oklch(0.98_0.005_160/.14)] bg-[oklch(0.07_0.011_165/.8)] p-5 shadow-[0_30px_100px_oklch(0.04_0.01_165/.7)] backdrop-blur-2xl">
          <div className="flex items-center justify-between"><div className="text-[8px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">AbroadShield agent</div><span className="flex items-center gap-1 text-[8px] font-semibold text-[oklch(0.85_0.19_158)]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.74_0.17_162)]"/>active</span></div>
          <div className="mt-4 text-base font-semibold leading-tight">Building your path from study choice to full-time role.</div>
          <div className="mt-4 space-y-2">{["Understand profile", "Map the journey", "Identify next leverage", "Prepare the next action"].map((item, index) => <motion.div key={item} onMouseEnter={() => setActive(index)} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, scale: active === index ? 1.015 : 1 }} transition={{ delay: .65 + index * .12 }} className="flex items-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/.6)] px-3 py-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.74_0.17_162/.13)] text-[8px] font-bold text-[oklch(0.85_0.19_158)]">{String(index + 1).padStart(2, "0")}</span><span className="text-[9px] text-[var(--shield-text-dim)]">{item}</span></motion.div>)}</div>
        </motion.div>
      </div>

      {nodes.map(({ icon: Icon, title, text, x, delay }) => <motion.div key={title} style={{ transform: `translateZ(${28 + delay * 30}px)` }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: [0, -5, 0] }} transition={{ opacity: { duration: .5, delay: .4 + delay }, y: { duration: 4.5 + delay, repeat: Infinity, ease: "easeInOut", delay } }} className={`absolute z-20 ${x} hidden w-[178px] rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/.88)] p-3 shadow-[0_18px_50px_oklch(0.04_0.01_165/.45)] backdrop-blur-xl sm:block`}><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.26)] bg-[oklch(0.74_0.17_162/0.08)]"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]"/></span><div><div className="text-[10px] font-semibold">{title}</div><div className="text-[9px] text-[var(--shield-text-faint)]">{text}</div></div></div></motion.div>)}
    </motion.div>

    <div className="pointer-events-none absolute bottom-[2%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] uppercase tracking-[.18em] text-[var(--shield-text-faint)] opacity-70">move across the product surface</div>
  </motion.div>;
}
