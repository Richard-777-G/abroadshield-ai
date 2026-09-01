"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, CalendarClock, CheckCircle2, FileCheck2, Globe2, Plug, Shield, Briefcase } from "lucide-react";
import Reveal from "./Reveal";

const PHASES = [
  { n: "01", title: "Pre-Departure", icon: Globe2, detail: "Country-specific preparation, documents, applications and deadlines before you leave." },
  { n: "02", title: "Arrival", icon: CalendarClock, detail: "Immediate setup, accommodation, registration and the first actions after landing." },
  { n: "03", title: "Studying & Part-Time", icon: FileCheck2, detail: "Study, finances, work limits and the obligations that keep your journey on track." },
  { n: "04", title: "Job Success", icon: Briefcase, detail: "Find relevant roles, build your network, tailor applications and plan the next step." },
];

export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return <>
    <section className="relative w-full py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>How AbroadShield works</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">One workspace. One continuous journey.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--shield-text-dim)] sm:text-base">Set the context once. The agent keeps country rules, requirements, documents, deadlines and decisions together so the next action starts from what has already happened.</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10"><div className="grid gap-3 md:grid-cols-3">
          <StepCard num="01" icon={Plug} title="Set the context" detail="Destination, study plan, constraints and connected services become the working record." />
          <StepCard num="02" icon={Bot} title="Agent coordinates" detail="The agent researches, checks, drafts and sequences work through one execution pipeline." />
          <StepCard num="03" icon={CheckCircle2} title="You approve" detail="Actions that leave the workspace stay behind your approval, with the outcome written back to the journey." />
        </div></Reveal>
      </div>
    </section>

    <section id="journey" className="relative w-full border-t border-[var(--shield-border)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl"><Eyebrow>Your journey</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">Four phases. One record.</h2><p className="mt-4 text-sm leading-7 text-[var(--shield-text-dim)] sm:text-base">The stages change as your situation changes. Your history, preferences and completed work stay connected.</p></Reveal>
        <Reveal delay={0.1} className="mt-8"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{PHASES.map(({ n, title, icon: Icon, detail }) => <motion.button key={n} type="button" onClick={() => onNavigate?.("journey")} whileHover={{ y: -3 }} className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.38)] p-5 text-left transition hover:border-[oklch(0.74_0.17_162/0.35)]"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--shield-text-faint)]">{n}</span><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></div><h3 className="mt-7 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{detail}</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[oklch(0.78_0.08_165)]">Open journey <ArrowRight className="h-3 w-3" /></span></motion.button>)}</div></Reveal>
      </div>
    </section>

    <section className="relative w-full py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><div className="rounded-[2rem] border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.55)] p-7 sm:p-10"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><Eyebrow><Shield className="h-3.5 w-3.5" />Control by design</Eyebrow><h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">The agent moves the work. You keep the decision.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--shield-text-dim)]">AbroadShield can prepare, research and coordinate. Sending, submitting or changing an external account requires explicit approval.</p></div><button onClick={() => onNavigate?.("agent")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Open the agent <ArrowRight className="h-3.5 w-3.5" /></button></div></div></Reveal></div></section>
  </>;
}

function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">{children}</div>; }
function StepCard({ num, icon: Icon, title, detail }: { num: string; icon: typeof Plug; title: string; detail: string }) { return <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.42)] p-6"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--shield-text-faint)]">{num}</span><Icon className="h-5 w-5 text-[oklch(0.85_0.19_158)]" /></div><h3 className="mt-10 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{detail}</p></div>; }
