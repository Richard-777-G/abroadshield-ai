"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Loader2,
  Map,
  Sparkles,
  Target,
} from "lucide-react";
import PolicyEvidenceCard from "./PolicyEvidenceCard";
import type { DashboardViewModel } from "@/lib/abroadshield/types/view-models";

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [snapshot, setSnapshot] = useState<DashboardViewModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/abroadshield/dashboard", { cache: "no-store" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((data) => { if (!cancelled) setSnapshot(data?.ok ? data.snapshot ?? null : null); })
      .catch(() => { if (!cancelled) setSnapshot(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!snapshot) return <section className="w-full"><div className="mx-auto flex min-h-[420px] w-full max-w-7xl items-center justify-center px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><div className="flex items-center gap-2 text-xs text-[var(--shield-text-dim)]">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Reading your journey…" : "Your journey data is not available yet."}</div></div></section>;

  const { profile, phase, route, stage, readiness, next } = snapshot;

  return <section className="w-full"><div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
    <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.74_0.17_162)]"><Sparkles className="h-3 w-3" />Command center</div><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your next move.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--shield-text-dim)]">A quiet overview of the journey. The detailed blueprint and agent live in the Journey workspace.</p></div><button type="button" onClick={() => onNavigate("journey")} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)] transition hover:bg-[oklch(0.85_0.19_158)]"><Map className="h-4 w-4" />Open journey<ArrowRight className="h-3.5 w-3.5" /></button></header>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,.7fr)]">
      <section className="relative overflow-hidden rounded-[28px] border border-[oklch(0.74_0.17_162/.28)] bg-[oklch(0.15_0.018_165)] p-6 sm:p-8"><div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[oklch(0.74_0.17_162/.08)] blur-3xl" /><div className="relative"><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">North star</div><h2 className="mt-2 max-w-4xl text-2xl font-semibold leading-tight sm:text-3xl">{profile.goal}</h2><div className="mt-5 flex flex-wrap gap-2">{[profile.destination, profile.course, profile.university, profile.intake].filter(Boolean).map((value) => <span key={value} className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] px-3 py-1.5 text-[10px] text-[var(--shield-text-dim)]">{value}</span>)}</div><div className="mt-7 flex items-end justify-between gap-4"><div><div className="text-[9px] uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Current mission</div><div className="mt-1 text-sm font-semibold">{stage.title}</div><p className="mt-1 max-w-xl text-xs leading-5 text-[var(--shield-text-dim)]">{phase.copy}</p></div><div className="hidden text-right sm:block"><div className="text-2xl font-semibold">{readiness}%</div><div className="text-[9px] uppercase tracking-wider text-[var(--shield-text-faint)]">readiness</div></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[oklch(0.08_0.01_165)]"><div className="h-full rounded-full bg-[oklch(0.74_0.17_162)] transition-all" style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }} /></div></div></section>
      <section className="rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-7"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]"><Target className="h-3.5 w-3.5" />Next action</div>{next ? <><h2 className="mt-4 text-lg font-semibold">{next.title}</h2>{next.reason && <p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{next.reason}</p>}<button type="button" onClick={() => onNavigate("agent")} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[oklch(0.85_0.19_158)]">Work with the agent<ArrowRight className="h-3.5 w-3.5" /></button></> : <><h2 className="mt-4 text-lg font-semibold">Start with your blueprint.</h2><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">Your journey is ready for strategy and CV analysis. No sensitive document upload is required to begin.</p><button type="button" onClick={() => onNavigate("journey")} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[oklch(0.85_0.19_158)]">Open blueprint<ArrowRight className="h-3.5 w-3.5" /></button></>}</section>
    </div>
    <section className="mt-6 overflow-hidden rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-2 sm:p-3"><img src="/visuals/four-phase-route.svg" alt="The four phases of the AbroadShield journey" className="h-auto max-h-[420px] w-full rounded-2xl object-cover" loading="lazy"/><div className="px-3 pb-3 pt-4 sm:px-4"><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">The route stays visible</div><div className="mt-1 text-sm font-semibold">Choose the move → secure the move → build career capital → land the role.</div><p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--shield-text-dim)]">Your current mission changes as evidence and decisions accumulate; the destination remains the same operating context.</p></div></section>
    <section className="mt-6 rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-7"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">One visible route</div><h2 className="mt-1 text-lg font-semibold">From study decision to full-time role.</h2></div><button type="button" onClick={() => onNavigate("journey")} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.85_0.19_158)]">View blueprint<ArrowRight className="h-3 w-3.5" /></button></div><div className="mt-5 grid gap-2 sm:grid-cols-4">{route.map((item, index) => { const routeCardClassName = item.current ? "border-[oklch(0.74_0.17_162/.45)] bg-[oklch(0.74_0.17_162/.07)]" : "border-[var(--shield-border)]"; return <div key={item.id} className={`rounded-2xl border p-4 ${routeCardClassName}`}><div className="flex items-center justify-between"><span className="text-[9px] font-bold tracking-wider text-[var(--shield-text-faint)]">0{index + 1}</span>{item.complete ? <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" /> : item.current ? <span className="text-[8px] font-bold uppercase tracking-widest text-[oklch(0.85_0.19_158)]">Now</span> : null}</div><div className="mt-4 text-xs font-semibold">{item.name}</div></div>; })}</div><div className="mt-5 flex items-center justify-between border-t border-[var(--shield-border)] pt-4"><span className="text-[10px] text-[var(--shield-text-faint)]">The dashboard shows the route. The Journey workspace does the work.</span><button type="button" onClick={() => onNavigate("agent")} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"><Bot className="h-3.5 w-3.5" />Open agent</button></div></section>
    <PolicyEvidenceCard evidence={snapshot.policyEvidence ?? null} />
  </div></section>;
}
