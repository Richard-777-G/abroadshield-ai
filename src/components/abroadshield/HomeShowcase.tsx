"use client";

import { motion } from "framer-motion";
import {
  Plug,
  Bot,
  CheckCircle2,
  ArrowRight,
  Shield,
  CalendarClock,
  FileCheck2,
  BrainCircuit,
  Zap,
  Globe2,
  Users,
  Briefcase,
} from "lucide-react";
import Reveal from "./Reveal";

/**
 * Home enrichment — content below the hero so the home view doesn't feel empty.
 * 3 sections: "What the agent does" showcase, "How it works" 3-step, quick stats.
 */
export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return (
    <>
      {/* ---------- How it works — 3 steps ---------- */}
      <section className="relative w-full bg-transparent py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mb-10 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">
              <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
              How it works
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
              Three steps.{" "}
              <span className="as-text-gradient">Zero stress.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
              Connect once. The agent does the work. You approve every action. That&apos;s it —
              from visa to job, the same agent carries your story.
            </p>
          </Reveal>

          {/* steps */}
          <Reveal delay={0.1}>
            <div className="grid gap-4 md:grid-cols-3">
              <StepCard
                num="01"
                icon={Plug}
                title="Connect your platforms"
                detail="Link LinkedIn, Gmail, Rightmove, Wise — 16 real platforms. One-time setup, the agent handles the rest."
                delay={0.1}
              />
              <StepCard
                num="02"
                icon={Bot}
                title="The agent does the work"
                detail="It searches, shortlists, drafts emails, fills forms, and tracks every deadline — across all four phases of your journey."
                delay={0.2}
              />
              <StepCard
                num="03"
                icon={CheckCircle2}
                title="You approve, it sends"
                detail="Nothing leaves without your one-tap approval. The agent prepares everything; you stay in control. Human-in-the-loop, always."
                delay={0.3}
              />
            </div>
          </Reveal>

          {/* how-it-works image */}
          <Reveal delay={0.2} className="mt-6">
            <div className="relative h-32 overflow-hidden rounded-2xl border border-[var(--shield-border)] sm:h-44">
              <img
                src="/sections/home-how-it-works.png"
                alt="How it works — connect, agent works, you approve"
                className="h-full w-full object-cover opacity-40"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.14_0.018_165/0.8)] via-transparent to-[oklch(0.14_0.018_165/0.8)]" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- What the agent does — showcase ---------- */}
      <section className="relative w-full bg-transparent py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.3)] to-transparent" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
            {/* left: image */}
            <Reveal>
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--shield-border)]">
                <img
                  src="/sections/home-agent-work.png"
                  alt="AI agent doing the work"
                  className="h-full w-full object-cover opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.018_165/0.9)] via-transparent to-transparent" />
                {/* floating badges on the image */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                  <Badge icon={FileCheck2} label="Drafts" value="5 ready" tone="emerald" />
                  <Badge icon={Briefcase} label="Jobs" value="12 applied" tone="amber" />
                  <Badge icon={Users} label="Network" value="23 contacts" tone="cyan" />
                </div>
              </div>
            </Reveal>

            {/* right: text + feature list */}
            <Reveal delay={0.15}>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">
                <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
                <Zap className="h-3.5 w-3.5" />
                It actually does the work
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">
                Not a chatbot that waits.{" "}
                <span className="as-text-gradient">An agent that acts.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
                It reviews a visa document before the appointment, not after a rejection. It
                flags a deadline while there&apos;s still time to act. It drafts the message a
                first-time traveler doesn&apos;t know how to write — ready for you to approve and send.
              </p>

              {/* feature list */}
              <div className="mt-6 space-y-3">
                {[
                  { icon: Shield, text: "Gap-checks documents before the consulate does" },
                  { icon: CalendarClock, text: "Tracks 27 deadlines and nudges before they bite" },
                  { icon: BrainCircuit, text: "Carries one continuous memory across all 4 phases" },
                  { icon: Globe2, text: "Knows the rules for 10 countries — you never explain from scratch" },
                  { icon: Briefcase, text: "Tailors your CV per role and applies on your behalf" },
                  { icon: Users, text: "Runs an always-on networking + follow-up tracker" },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="flex items-center gap-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)]">
                        <Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                      </span>
                      <span className="text-sm text-[var(--shield-text)]">{f.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={() => onNavigate?.("agent")}
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-5 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Bot className="h-4 w-4" />
                Talk to the agent
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Quick stats band ---------- */}
      <section className="relative w-full bg-transparent py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <BigStat icon={Shield} value="4" label="Phases, end to end" flag="🛡️" />
              <BigStat icon={CalendarClock} value="27" label="Deadlines tracked" flag="📅" />
              <BigStat icon={FileCheck2} value="13" label="Docs gap-checked" flag="📄" />
              <BigStat icon={BrainCircuit} value="1" label="Memory, never reset" flag="🧠" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ---------- helpers ---------- */
function StepCard({
  num,
  icon: Icon,
  title,
  detail,
  delay,
}: {
  num: string;
  icon: typeof Plug;
  title: string;
  detail: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay }}
      className="as-card-hover group relative overflow-hidden rounded-3xl border border-[var(--shield-border)] as-glass p-6"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)]">
          <Icon className="h-5 w-5 text-[oklch(0.85_0.19_158)]" />
        </span>
        <span className="font-mono text-2xl font-bold text-[oklch(0.5_0.03_165)]">{num}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--shield-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--shield-text-dim)]">{detail}</p>
    </motion.div>
  );
}

function Badge({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "cyan";
}) {
  const toneMap = {
    emerald: "text-[oklch(0.85_0.19_158)] border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.14_0.018_165/0.7)]",
    amber: "text-[oklch(0.86_0.17_80)] border-[oklch(0.8_0.15_80/0.4)] bg-[oklch(0.14_0.018_165/0.7)]",
    cyan: "text-[oklch(0.82_0.13_210)] border-[oklch(0.74_0.13_210/0.4)] bg-[oklch(0.14_0.018_165/0.7)]",
  };
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 backdrop-blur ${toneMap[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      <div className="text-[10px]">
        <div className="font-semibold">{value}</div>
        <div className="opacity-70">{label}</div>
      </div>
    </div>
  );
}

function BigStat({
  icon: Icon,
  value,
  label,
  flag,
}: {
  icon: typeof Shield;
  value: string;
  label: string;
  flag: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--shield-border)] as-glass p-5">
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[oklch(0.74_0.17_162/0.1)] blur-xl" />
      <Icon className="h-5 w-5 text-[oklch(0.85_0.19_158)]" />
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-[oklch(0.98_0.005_160)]">{value}</span>
        <span className="text-lg opacity-60">{flag}</span>
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-[oklch(0.68_0.02_165)]">{label}</div>
    </div>
  );
}
