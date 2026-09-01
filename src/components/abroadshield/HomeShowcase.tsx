"use client";

import { motion } from "framer-motion";
import { Plug, Bot, CheckCircle2, ArrowRight, Shield, CalendarClock, FileCheck2, BrainCircuit, Globe2, Users, Briefcase } from "lucide-react";
import Reveal from "./Reveal";

export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return (
    <>
      <section className="relative w-full py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mb-8 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />How it works</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">One journey. <span className="as-text-gradient">One operating model.</span></h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">Your profile and destination shape the work. The agent executes what it can, asks for approval when required, and records the result.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-4 md:grid-cols-3">
              <StepCard num="01" icon={Plug} title="Connect" detail="Authorize the services you want the agent to use. The workspace shows the real connection state." />
              <StepCard num="02" icon={Bot} title="Agent executes" detail="Turn a need into a task: check, draft, search, tailor, or plan. Results flow back into your journey." />
              <StepCard num="03" icon={CheckCircle2} title="You control" detail="Review outbound actions before they leave your account. Approved execution becomes part of your record." />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative w-full py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.3)] to-transparent" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[var(--shield-border)] bg-[radial-gradient(circle_at_50%_45%,oklch(0.74_0.17_162/0.16),transparent_45%),linear-gradient(145deg,oklch(0.22_0.025_165),oklch(0.13_0.018_165))]">
                <div className="absolute inset-5 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/0.7)] p-5 backdrop-blur">
                  <div className="flex items-center justify-between border-b border-[var(--shield-border)] pb-3"><span className="text-xs font-medium text-[var(--shield-text-dim)]">Agent work queue</span><span className="rounded-full border border-[oklch(0.74_0.17_162/0.35)] px-2 py-1 text-[9px] text-[oklch(0.85_0.19_158)]">LIVE</span></div>
                  <div className="mt-4 space-y-2.5">
                    <WorkRow icon={FileCheck2} title="Check financial documents" status="Ready" />
                    <WorkRow icon={Briefcase} title="Find eligible roles" status="Search" />
                    <WorkRow icon={CalendarClock} title="Scan upcoming deadlines" status="Review" />
                    <WorkRow icon={Users} title="Prepare follow-ups" status="Approval" />
                  </div>
                  <div className="mt-4 rounded-xl border border-[oklch(0.74_0.17_162/0.25)] bg-[oklch(0.74_0.17_162/0.05)] p-3"><div className="text-[9px] uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Execution rail</div><div className="mt-1 text-xs text-[var(--shield-text)]">Task → tool → approval → result → journey record</div></div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" /><Bot className="h-3.5 w-3.5" />The agent</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">From “what should I do?” to <span className="as-text-gradient">the next useful action.</span></h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">AbroadShield is designed around work, not conversation for its own sake. Ask for a check, draft, shortlist or plan and the system routes it through your profile, journey stage and available tools.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Feature icon={Shield} title="Document checks" text="Identify gaps and turn them into tasks." />
                <Feature icon={CalendarClock} title="Deadline control" text="Know what needs action next." />
                <Feature icon={Briefcase} title="Career workflow" text="Find, tailor and track opportunities." />
                <Feature icon={Globe2} title="Country-aware" text="Use destination-specific context." />
              </div>
              <button onClick={() => onNavigate?.("agent")} className="group mt-7 inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"><Bot className="h-4 w-4" />Open the agent<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function StepCard({ num, icon: Icon, title, detail }: { num: string; icon: typeof Plug; title: string; detail: string }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4 }} className="as-card-hover rounded-3xl border border-[var(--shield-border)] as-glass p-6"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)]"><Icon className="h-5 w-5 text-[oklch(0.85_0.19_158)]" /></span><span className="font-mono text-2xl font-bold text-[oklch(0.5_0.03_165)]">{num}</span></div><h3 className="mt-4 text-lg font-semibold text-[var(--shield-text)]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[var(--shield-text-dim)]">{detail}</p></motion.div>;
}

function WorkRow({ icon: Icon, title, status }: { icon: typeof FileCheck2; title: string; status: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.98_0.005_160/0.02)] px-3 py-2.5"><Icon className="h-4 w-4 shrink-0 text-[oklch(0.85_0.19_158)]" /><span className="min-w-0 flex-1 truncate text-xs text-[var(--shield-text)]">{title}</span><span className="text-[9px] uppercase tracking-[0.12em] text-[var(--shield-text-faint)]">{status}</span></div>;
}

function Feature({ icon: Icon, title, text }: { icon: typeof Shield; title: string; text: string }) {
  return <div className="rounded-2xl border border-[var(--shield-border)] p-4"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /><div className="mt-2 text-sm font-semibold text-[var(--shield-text)]">{title}</div><p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">{text}</p></div>;
}
