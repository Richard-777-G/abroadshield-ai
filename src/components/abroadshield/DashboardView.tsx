"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, CheckCircle2, Loader2, Map, Sparkles, Target } from "lucide-react";
import { useProfileStore } from "./profileStore";
import { PHASES } from "./data";
import type { PhaseId } from "@/lib/abroadshield/phase";
import { getStagePolicy } from "@/lib/abroadshield/stage-orchestrator";

type NextAction = { title: string; reason?: string; type?: string };

const PHASE_COPY: Record<string, string> = {
  "pre-departure": "Define the path, strengthen the profile and prepare the move.",
  arrival: "Settle in and turn the study move into a career-building plan.",
  studying: "Build evidence, skills and network while you study.",
  "job-success": "Convert your experience into targeted roles and full-time opportunities.",
};

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const phase: PhaseId = profile.currentPhase || "pre-departure";
  const policy = useMemo(() => getStagePolicy(phase), [phase]);
  const phaseIndex = Math.max(0, PHASES.findIndex((item) => item.id === phase));
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/abroadshield/next-action", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (!cancelled) setNextAction(data?.ok ? data.next || null : null); })
      .catch(() => { if (!cancelled) setNextAction(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [phase]);

  const goal = profile.careerGoal || "Define the full-time career outcome you want to build toward.";
  const routeProgress = Math.round((phaseIndex / (PHASES.length - 1)) * 100);

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.74_0.17_162)]"><Sparkles className="h-3 w-3" />Command center</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your next move.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--shield-text-dim)]">A quiet overview of the journey. The detailed blueprint and agent live in the Journey workspace.</p>
          </div>
          <button type="button" onClick={() => onNavigate("journey")} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)] transition hover:bg-[oklch(0.85_0.19_158)]"><Map className="h-4 w-4" />Open journey<ArrowRight className="h-3.5 w-3.5" /></button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,.7fr)]">
          <section className="relative overflow-hidden rounded-[28px] border border-[oklch(0.74_0.17_162/.28)] bg-[oklch(0.15_0.018_165)] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[oklch(0.74_0.17_162/.08)] blur-3xl" />
            <div className="relative">
              <div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">North star</div>
              <h2 className="mt-2 max-w-4xl text-2xl font-semibold leading-tight sm:text-3xl">{goal}</h2>
              <div className="mt-5 flex flex-wrap gap-2">{[profile.destination, profile.course, profile.university, profile.intake].filter(Boolean).map((value) => <span key={value} className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.10_0.013_165)] px-3 py-1.5 text-[10px] text-[var(--shield-text-dim)]">{value}</span>)}</div>
              <div className="mt-7 flex items-end justify-between gap-4"><div><div className="text-[9px] uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Current mission</div><div className="mt-1 text-sm font-semibold">{policy.title}</div><p className="mt-1 max-w-xl text-xs leading-5 text-[var(--shield-text-dim)]">{PHASE_COPY[phase] || policy.mission}</p></div><div className="hidden text-right sm:block"><div className="text-2xl font-semibold">{routeProgress}%</div><div className="text-[9px] uppercase tracking-wider text-[var(--shield-text-faint)]">route progress</div></div></div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[oklch(0.08_0.01_165)]"><div className="h-full rounded-full bg-[oklch(0.74_0.17_162)] transition-all" style={{ width: `${routeProgress}%` }} /></div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-7">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]"><Target className="h-3.5 w-3.5" />Next action</div>
            {loading ? <div className="mt-5 flex items-center gap-2 text-xs text-[var(--shield-text-dim)]"><Loader2 className="h-4 w-4 animate-spin" />Reading your journey…</div> : nextAction ? <><h2 className="mt-4 text-lg font-semibold">{nextAction.title}</h2>{nextAction.reason && <p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{nextAction.reason}</p>}<button type="button" onClick={() => onNavigate("journey")} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[oklch(0.85_0.19_158)]">Work with the agent<ArrowRight className="h-3.5 w-3.5" /></button></> : <><h2 className="mt-4 text-lg font-semibold">Start with your blueprint.</h2><p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">Your journey is ready for strategy and CV analysis. No sensitive document upload is required to begin.</p><button type="button" onClick={() => onNavigate("journey")} className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[oklch(0.85_0.19_158)]">Open blueprint<ArrowRight className="h-3.5 w-3.5" /></button></>}
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">One visible route</div><h2 className="mt-1 text-lg font-semibold">From study decision to full-time role.</h2></div><button type="button" onClick={() => onNavigate("journey")} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.85_0.19_158)]">View blueprint<ArrowRight className="h-3 w-3" /></button></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-4">{PHASES.map((item, index) => { const current = index === phaseIndex; const complete = index < phaseIndex; return <div key={item.id} className={`rounded-2xl border p-4 ${current ? "border-[oklch(0.74_0.17_162/.45)] bg-[oklch(0.74_0.17_162/.07)]" : "border-[var(--shield-border)]"}`}><div className="flex items-center justify-between"><span className="text-[9px] font-bold tracking-wider text-[var(--shield-text-faint)]">0{index + 1}</span>{complete ? <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" /> : current ? <span className="text-[8px] font-bold uppercase tracking-widest text-[oklch(0.85_0.19_158)]">Now</span> : null}</div><div className="mt-4 text-xs font-semibold">{item.label}</div></div>; })}</div>
          <div className="mt-5 flex items-center justify-between border-t border-[var(--shield-border)] pt-4"><span className="text-[10px] text-[var(--shield-text-faint)]">The dashboard shows the route. The Journey workspace does the work.</span><button type="button" onClick={() => onNavigate("agent")} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"><Bot className="h-3.5 w-3.5" />Open agent</button></div>
        </section>
      </div>
    </section>
  );
}
