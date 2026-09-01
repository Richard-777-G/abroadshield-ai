"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot, CalendarClock, CheckCircle2, FileCheck2, Globe2, Plug, Shield, Briefcase } from "lucide-react";
import Reveal from "./Reveal";

const PHASES = [
  { n: "01", title: "Pre-Departure", icon: Globe2, detail: "Choose the route, prepare requirements, complete applications and get ready to leave." },
  { n: "02", title: "Arrival", icon: CalendarClock, detail: "Settle in, handle immediate formalities, find what you need and keep the first weeks organized." },
  { n: "03", title: "Studying & Part-Time", icon: FileCheck2, detail: "Stay on top of academic work, money, work limits and the obligations that come with your status." },
  { n: "04", title: "Job Success", icon: Briefcase, detail: "Build the network, find relevant roles, tailor applications and work toward the next visa-safe step." },
];

export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return <>
    <section className="relative w-full py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>How AbroadShield works</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">One system from planning to progress.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--shield-text-dim)] sm:text-base">Your profile, country context, requirements, documents, deadlines and actions stay connected. You do not rebuild the same context every time you need help.</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <div className="grid gap-3 md:grid-cols-3">
            <StepCard num="01" icon={Plug} title="Set the context" detail="Tell AbroadShield where you are going, what you are studying, and the constraints that matter." />
            <StepCard num="02" icon={Bot} title="Agent coordinates" detail="The agent turns the goal into research, checks, preparation and actions through one task pipeline." />
            <StepCard num="03" icon={CheckCircle2} title="You stay in control" detail="Important external actions require your approval, and outcomes return to the same journey record." />
          </div>
        </Reveal>
      </div>
    </section>

    <section id="journey" className="relative w-full py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.28)] to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>Your journey</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">Four phases. One continuous record.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--shield-text-dim)] sm:text-base">The phase changes. The context does not. Select the phase that matters now and the same agent works against that part of the journey.</p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map(({ n, title, icon: Icon, detail }) => (
              <motion.button key={n} type="button" onClick={() => onNavigate?.("journey")} whileHover={{ y: -3 }} className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.38)] p-5 text-left transition hover:border-[oklch(0.74_0.17_162/0.35)]">
                <div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--shield-text-faint)]">{n}</span><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></div>
                <h3 className="mt-7 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{detail}</p>
              </motion.button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>

    <section className="relative w-full py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="rounded-[2rem] border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.55)] p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Eyebrow><Shield className="h-3.5 w-3.5" />Control by design</Eyebrow>
                <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">Automation without surrendering control.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--shield-text-dim)]">Research, preparation and coordination can continue. Sending or submitting something outside the workspace remains an explicit user decision.</p>
              </div>
              <button onClick={() => onNavigate?.("agent")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Meet the agent <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  </>;
}

function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">{children}</div>; }
function StepCard({ num, icon: Icon, title, detail }: { num: string; icon: typeof Plug; title: string; detail: string }) { return <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.42)] p-6"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--shield-text-faint)]">{num}</span><Icon className="h-5 w-5 text-[oklch(0.85_0.19_158)]" /></div><h3 className="mt-10 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{detail}</p></div>; }
