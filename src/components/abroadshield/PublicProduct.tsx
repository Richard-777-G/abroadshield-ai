"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Check, FileSearch, Flag, Layers3, Route, ShieldCheck, Workflow } from "lucide-react";
import Reveal from "./Reveal";

const PROBLEM_LAYERS = [
  ["Decision", "Country, course, university and career fit", "01"],
  ["Preparation", "Applications, funding, visa and deadlines", "02"],
  ["Relocation", "Housing, arrival, registration and local setup", "03"],
  ["Career", "Evidence, networking, targeted roles and transition", "04"],
] as const;

const OPERATING_LOOP = [
  ["Understand", "Read the profile, destination and current stage", BrainCircuit],
  ["Sequence", "Turn the route into a prioritised next-action map", Route],
  ["Prepare", "Draft, compare, research and organise the work", Workflow],
  ["Verify", "Surface evidence and keep high-stakes actions controlled", ShieldCheck],
] as const;

export default function PublicProduct({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <Reveal className="max-w-4xl">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><Layers3 className="h-3.5 w-3.5" /> Why AbroadShield exists</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Studying abroad is not one decision. It is a chain of decisions that changes over time.</h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--shield-text-dim)] sm:text-base">The public product is built around that continuity: one profile, one route, one evolving context, and an agent that works inside clear boundaries.</p>
      </Reveal>

      <Reveal delay={0.08} className="mt-12">
        <div className="grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--shield-text-faint)]">The fragmented experience</div>
            <div className="mt-5 space-y-2.5">{PROBLEM_LAYERS.map(([title, detail, n], index) => <motion.div key={title} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="flex gap-3 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165/.7)] p-3.5"><span className="font-mono text-[9px] text-[var(--shield-text-faint)]">{n}</span><div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</div></div></motion.div>)}</div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.74_0.17_162/.25)] bg-[oklch(0.13_0.016_165/.86)] p-6 sm:p-8"><div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[oklch(0.74_0.17_162/.08)] blur-3xl" /><div className="relative"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><FileSearch className="h-3.5 w-3.5" /> The product thesis</div><h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">A context layer between the student and the fragmented system.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--shield-text-dim)]">AbroadShield is not positioned as another portal, job board or document locker. It is a coordinating layer that helps a student understand where they are, what matters next, and what the agent can safely prepare.</p><div className="mt-7 grid gap-2 sm:grid-cols-3">{[["Context", "Profile + destination + stage"], ["Evidence", "Documents + verified sources"], ["Action", "Next step + approval boundary"]].map(([label, detail]) => <div key={label} className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.08_0.011_165/.66)] p-4"><div className="text-xs font-semibold">{label}</div><div className="mt-1.5 text-[10px] leading-4 text-[var(--shield-text-faint)]">{detail}</div></div>)}</div></div></div>
        </div>
      </Reveal>

      <Reveal delay={0.12} className="mt-16">
        <div className="flex max-w-3xl items-end justify-between gap-5"><div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><BrainCircuit className="h-3.5 w-3.5" /> How the product thinks</div><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">One operating loop, not a pile of features.</h2></div><button type="button" onClick={() => onNavigate("journey")} className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[var(--shield-border)] px-4 py-2 text-xs font-semibold text-[var(--shield-text-dim)] transition hover:border-[oklch(0.74_0.17_162/.36)] hover:text-[var(--shield-text)] sm:inline-flex">See the route <ArrowRight className="h-3.5 w-3.5" /></button></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{OPERATING_LOOP.map(([title, detail, Icon], index) => <motion.div key={title} whileHover={{ y: -4 }} className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.018_165/.5)] p-5"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165/.7)]"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></div><span className="font-mono text-[9px] text-[var(--shield-text-faint)]">0{index + 1}</span></div><h3 className="mt-7 text-sm font-semibold">{title}</h3><p className="mt-2 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</p></motion.div>)}</div>
      </Reveal>

      <Reveal delay={0.16} className="mt-16">
        <div className="rounded-3xl border border-[var(--shield-border)] bg-[oklch(0.11_0.014_165/.72)] p-6 sm:p-8"><div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-center"><div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><Flag className="h-3.5 w-3.5" /> Product surface</div><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">The interface should always answer three questions.</h2><div className="mt-6 space-y-3">{[["Where am I?", "Current phase, destination and the decisions already made."], ["What matters next?", "A prioritised mission rather than a generic list of features."], ["What can the agent do?", "Research and preparation first; consequential external actions stay controlled."]].map(([q, a]) => <div key={q} className="flex gap-3 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.08_0.011_165/.62)] p-4"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.85_0.19_158)]" /><div><div className="text-sm font-semibold">{q}</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{a}</div></div></div>)}</div></div><div className="relative overflow-hidden rounded-3xl border border-[oklch(0.74_0.17_162/.22)] bg-[oklch(0.08_0.012_165/.8)] p-5"><div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Concept screen · illustrative product surface</div><div className="mt-5 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.12_0.015_165/.86)] p-4 shadow-2xl"><div className="flex items-center justify-between border-b border-[var(--shield-border)] pb-3"><div className="text-xs font-semibold">Current mission</div><div className="rounded-full border border-[var(--shield-border)] px-2 py-1 font-mono text-[8px] text-[var(--shield-text-faint)]">STAGE 02</div></div><div className="mt-4 grid grid-cols-3 gap-2">{[["Route", "Secure the move"], ["Evidence", "Profile + docs"], ["Control", "Approval required"]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.08_0.011_165)] p-3"><div className="text-[8px] uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">{label}</div><div className="mt-2 text-xs font-semibold">{value}</div></div>)}</div><div className="mt-4 rounded-xl border border-[oklch(0.74_0.17_162/.2)] bg-[oklch(0.74_0.17_162/.04)] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold"><ShieldCheck className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" /> Agent recommendation</div><div className="mt-1.5 text-[10px] leading-4 text-[var(--shield-text-dim)]">Prioritise the next missing evidence before starting another application workflow.</div></div></div></div></div></div>
      </Reveal>

      <Reveal delay={0.2} className="mt-10"><div className="flex flex-col gap-4 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.018_165/.4)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="text-sm font-semibold">Explore the evidence layer</div><div className="mt-1 text-xs text-[var(--shield-text-dim)]">See destination rules, official links and country-specific preparation signals.</div></div><button type="button" onClick={() => onNavigate("countries")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--shield-text)] px-4 py-2.5 text-xs font-semibold text-[var(--shield-ink)]">Open country intelligence <ArrowRight className="h-3.5 w-3.5" /></button></div></Reveal>
    </div>
  );
}
