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
    <div className="as-public-container pb-16 pt-24 sm:pb-20 sm:pt-28">
      <Reveal className="max-w-4xl">
        <div className="as-public-eyebrow"><Layers3 className="h-3.5 w-3.5" />Why AbroadShield exists</div>
        <h1 className="as-public-title mt-4 text-4xl sm:text-6xl">Studying abroad is not one decision. It is a chain of decisions that changes over time.</h1>
        <p className="as-public-copy mt-5 max-w-3xl sm:text-base">The public product is built around that continuity: one profile, one route, one evolving context, and an agent that works inside clear boundaries.</p>
      </Reveal>

      <Reveal delay={0.08} className="mt-10">
        <div className="grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="as-public-card p-5 sm:p-6">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--shield-text-faint)]">The fragmented experience</div>
            <div className="mt-5 space-y-2.5">{PROBLEM_LAYERS.map(([title, detail, n], index) => <motion.div key={title} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="as-public-card as-public-card--quiet flex gap-3 p-3.5"><span className="font-mono text-[9px] text-[var(--shield-text-faint)]">{n}</span><div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</div></div></motion.div>)}</div>
          </div>
          <div className="as-public-card as-public-card--focus relative overflow-hidden p-6 sm:p-8"><div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[color-mix(in_oklab,var(--shield-emerald)_10%,transparent)] blur-3xl" /><div className="relative"><div className="as-public-eyebrow"><FileSearch className="h-3.5 w-3.5" />The product thesis</div><h2 className="as-public-title mt-3 max-w-2xl text-2xl sm:text-4xl">A context layer between the student and the fragmented system.</h2><p className="as-public-copy mt-4 max-w-2xl">AbroadShield is not positioned as another portal, job board or document locker. It is a coordinating layer that helps a student understand where they are, what matters next, and what the agent can safely prepare.</p><div className="mt-6 grid gap-2 sm:grid-cols-3"><Mini title="Context" detail="Profile + destination + stage" /><Mini title="Evidence" detail="Documents + verified sources" /><Mini title="Action" detail="Next step + approval boundary" /></div></div></div>
        </div>
      </Reveal>

      <Reveal delay={0.12} className="mt-12">
        <div className="flex max-w-3xl items-end justify-between gap-5"><div><div className="as-public-eyebrow"><BrainCircuit className="h-3.5 w-3.5" />How the product thinks</div><h2 className="as-public-title mt-3 text-3xl sm:text-4xl">One operating loop, not a pile of features.</h2></div><button type="button" onClick={() => onNavigate("journey")} className="as-public-button-secondary hidden shrink-0 sm:inline-flex">See the route <ArrowRight className="h-3.5 w-3.5" /></button></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{OPERATING_LOOP.map(([title, detail, Icon], index) => <motion.div key={title} whileHover={{ y: -2 }} className="as-public-card as-public-card--quiet as-card-hover p-5"><div className="flex items-center justify-between"><div className="as-public-icon"><Icon className="h-4 w-4" /></div><span className="font-mono text-[9px] text-[var(--shield-text-faint)]">0{index + 1}</span></div><h3 className="mt-6 text-sm font-semibold">{title}</h3><p className="mt-2 text-[11px] leading-5 text-[var(--shield-text-dim)]">{detail}</p></motion.div>)}</div>
      </Reveal>

      <Reveal delay={0.16} className="mt-12">
        <div className="as-public-card as-public-card--raised p-6 sm:p-8"><div className="grid gap-7 lg:grid-cols-[1fr_0.92fr] lg:items-center"><div><div className="as-public-eyebrow"><Flag className="h-3.5 w-3.5" />Product surface</div><h2 className="as-public-title mt-3 text-2xl sm:text-3xl">The interface should always answer three questions.</h2><div className="mt-5 space-y-3"><Question q="Where am I?" a="Current phase, destination and the decisions already made." /><Question q="What matters next?" a="A prioritised mission rather than a generic list of features." /><Question q="What can the agent do?" a="Research and preparation first; consequential external actions stay controlled." /></div></div><div className="as-public-card as-public-card--quiet overflow-hidden p-5"><div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Concept screen · illustrative product surface</div><div className="as-public-card mt-5 p-4"><div className="flex items-center justify-between border-b border-[var(--shield-border)] pb-3"><div className="text-xs font-semibold">Current mission</div><div className="rounded-full border border-[var(--shield-border)] px-2 py-1 font-mono text-[8px] text-[var(--shield-text-faint)]">STAGE 02</div></div><div className="mt-4 grid grid-cols-3 gap-2">{[["Route", "Secure the move"], ["Evidence", "Profile + docs"], ["Control", "Approval required"]].map(([label, value]) => <div key={label} className="as-public-card as-public-card--quiet p-3"><div className="text-[8px] uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">{label}</div><div className="mt-2 text-xs font-semibold">{value}</div></div>)}</div><div className="mt-4 rounded-xl border border-[color-mix(in_oklab,var(--shield-emerald)_20%,var(--shield-border))] bg-[color-mix(in_oklab,var(--shield-emerald)_5%,transparent)] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold"><ShieldCheck className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />Agent recommendation</div><div className="mt-1.5 text-[10px] leading-4 text-[var(--shield-text-dim)]">Prioritise the next missing evidence before starting another application workflow.</div></div></div></div></div></div>
      </Reveal>

      <Reveal delay={0.2} className="mt-8"><div className="as-public-card as-public-card--quiet flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="text-sm font-semibold">Explore the evidence layer</div><div className="mt-1 text-xs text-[var(--shield-text-dim)]">See destination rules, official links and country-specific preparation signals.</div></div><button type="button" onClick={() => onNavigate("countries")} className="as-public-button-primary w-full sm:w-auto">Open country intelligence <ArrowRight className="h-3.5 w-3.5" /></button></div></Reveal>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="as-public-eyebrow">{children}</div>; }
function Mini({ title, detail }: { title: string; detail: string }) { return <div className="as-public-card as-public-card--quiet p-3"><div className="text-xs font-semibold">{title}</div><div className="mt-1 text-[9px] text-[var(--shield-text-faint)]">{detail}</div></div>; }
function Question({ q, a }: { q: string; a: string }) { return <div className="as-public-card as-public-card--quiet flex gap-3 p-4"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--shield-emerald-bright)]" /><div><div className="text-sm font-semibold">{q}</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{a}</div></div></div>; }
