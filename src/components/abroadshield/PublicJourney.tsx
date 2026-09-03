"use client";

import { ArrowRight, Bot, CheckCircle2, Compass } from "lucide-react";

export default function PublicJourney({ onNavigate }: { onNavigate: (view: string) => void }) {
  const phases = [
    ["01", "Pre-departure", "Applications, documents, funding and visa readiness."],
    ["02", "Arrival", "Housing, registration, local setup and the first weeks."],
    ["03", "Studying", "Academic life, work permissions, deadlines and adaptation."],
    ["04", "Job success", "Career preparation, targeted opportunities and transition."],
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><Compass className="h-3.5 w-3.5" />The AbroadShield journey</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-6xl">One plan that stays with you from departure to career.</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--shield-text-dim)] sm:text-base">AbroadShield is designed around the whole international-student journey. Your operating stage determines what the agent prioritizes, while the future path stays visible.</p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {phases.map(([number, title, description]) => <div key={number} className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="font-mono text-[10px] text-[oklch(0.74_0.17_162)]">PHASE {number}</div><h2 className="mt-8 text-base font-semibold">{title}</h2><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{description}</p></div>)}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shield-text-faint)]"><Bot className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />What changes as you progress</div>
          <div className="mt-5 space-y-3 text-sm text-[var(--shield-text-dim)]"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.74_0.17_162)]" />The current stage becomes the execution priority.</div><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.74_0.17_162)]" />Tasks and recommendations use your saved profile and destination.</div><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.74_0.17_162)]" />Earlier decisions remain part of the context instead of being reset.</div></div>
        </div>
        <div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.25)] bg-[oklch(0.74_0.17_162/0.05)] p-6 sm:p-7"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.85_0.19_158)]">Ready to make it yours?</div><p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">Create an account to turn the public journey map into your private operating workspace.</p><button onClick={() => onNavigate("agent")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[oklch(0.98_0.005_160)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.14_0.018_165)]">Start with the agent <ArrowRight className="h-3.5 w-3.5" /></button></div>
      </div>
    </section>
  );
}
