"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, Layers3, Network, Shield, Sparkles, Target } from "lucide-react";
import Reveal from "./Reveal";
import JourneyEngine3D from "./JourneyEngine3D";

const PHASES = [
  ["01", "Choose the move", "Destination, course, university fit and career target become one working context."],
  ["02", "Secure the move", "Applications, funding, visa and deadlines are sequenced around your route."],
  ["03", "Build career capital", "Skills, projects, evidence and network turn study time into career leverage."],
  ["04", "Land the role", "Target roles, employers, applications and interviews connect back to the outcome."],
] as const;

const SIGNALS = [
  ["Profile", "Who you are and what you want", "01"],
  ["Destination", "Where the route is headed", "02"],
  ["Evidence", "What is verified and missing", "03"],
  ["Career", "What outcome the journey is building toward", "04"],
] as const;

export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return <>
    <section className="relative w-full border-t border-[var(--shield-border)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl"><Eyebrow><Layers3 className="h-3.5 w-3.5" />Why this exists</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">The problem is not a lack of information. It is a lack of continuity.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--shield-text-dim)]">Students move between university portals, spreadsheets, consultants, email, visa checklists, job boards and networking tools. Each system sees one slice. AbroadShield is designed around the journey itself.</p></Reveal>
        <Reveal delay={.08} className="mt-8"><div className="grid gap-3 lg:grid-cols-2">{SIGNALS.map(([title, detail, n], i) => <motion.div key={title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .05 }} className="flex items-start gap-4 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4"><span className="font-mono text-[9px] text-[var(--shield-text-faint)]">{n}</span><div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</div></div></motion.div>)}</div></Reveal>
      </div>
    </section>

    <section className="relative w-full py-14 sm:py-18"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><div className="mb-6 max-w-2xl"><Eyebrow><Bot className="h-3.5 w-3.5" />Product engine</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your AI should understand the route.</h2><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">Context enters the engine. The journey sets priority. Evidence informs the next move. You stay in control.</p></div><JourneyEngine3D /></Reveal></div></section>

    <section className="relative w-full border-t border-[var(--shield-border)] py-14 sm:py-18"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal className="max-w-3xl"><Eyebrow><Target className="h-3.5 w-3.5" />The full journey</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Four phases. One evolving strategy.</h2><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">The route stays visible while the current mission changes.</p></Reveal><Reveal delay={.08} className="mt-7"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{PHASES.map(([n, title, detail], i) => <motion.button key={n} type="button" onClick={() => onNavigate?.("journey")} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * .05 }} whileHover={{ y: -3 }} className="group rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4 text-left transition hover:border-[oklch(0.74_0.17_162/.34)]"><div className="text-[9px] font-semibold tracking-[.18em] text-[var(--shield-text-faint)]">{n}</div><h3 className="mt-5 text-sm font-semibold">{title}</h3><p className="mt-2 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</p><span className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[.13em] text-[oklch(0.78_0.08_165)]">See the route <ArrowRight className="h-3 w-3"/></span></motion.button>)}</div></Reveal></div></section>

    <section className="relative w-full py-14 sm:py-18"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-7"><Eyebrow><Network className="h-3.5 w-3.5" />Future ecosystem</Eyebrow><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A coordination layer can connect more of the journey over time.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[var(--shield-text-dim)]">Potential integrations could extend the agent into preparation, relocation and career workflows. This is a product direction, not a claim of signed partnerships or current marketplace traction.</p><div className="mt-6 grid grid-cols-2 gap-2"><Mini title="Study" detail="Courses · universities" /><Mini title="Move" detail="Visa · housing" /><Mini title="Career" detail="Jobs · network" /><Mini title="Services" detail="Potential partners" /></div></div><div className="rounded-3xl border border-[oklch(0.74_0.17_162/.2)] bg-[oklch(0.13_0.016_165/.8)] p-6"><Eyebrow><Sparkles className="h-3.5 w-3.5" />Product principle</Eyebrow><h3 className="mt-3 text-xl font-semibold">More connected does not mean less controlled.</h3><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">The agent can research, reason and prepare. Consequential external actions remain approval-gated.</p><button type="button" onClick={() => onNavigate?.("agent")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--shield-text)] px-4 py-2.5 text-xs font-semibold text-[var(--shield-ink)]">Open the agent <ArrowRight className="h-3.5 w-3.5" /></button></div></div></Reveal></div></section>
  </>;
}
function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[oklch(0.85_0.19_158)]">{children}</div>; }
function Mini({ title, detail }: { title: string; detail: string }) { return <div className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165/.7)] p-3"><div className="text-xs font-semibold">{title}</div><div className="mt-1 text-[9px] text-[var(--shield-text-faint)]">{detail}</div></div>; }
