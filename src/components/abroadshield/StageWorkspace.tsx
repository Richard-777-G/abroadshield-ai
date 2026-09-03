"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Bot, Briefcase, CalendarClock, FileText, Home, Plane, BookOpen, ArrowRight, UserRound, ShieldCheck, ChevronRight } from "lucide-react";
import { PHASES, type PhaseId } from "./data";
import { useProfileStore } from "./profileStore";
import { getStagePolicy } from "@/lib/abroadshield/stage-orchestrator";

const ICONS: Record<PhaseId, typeof Plane> = {
  "pre-departure": Plane,
  arrival: Home,
  studying: BookOpen,
  "job-success": Briefcase,
};

const TASKS: Record<PhaseId, { type: string; label: string; context: string; icon: typeof FileText }[]> = {
  "pre-departure": [
    { type: "visa_check", label: "Review visa requirements", context: "Review the current visa questions I have for this destination and identify what I should verify from official sources.", icon: ShieldCheck },
    { type: "document_check", label: "Check my documents", context: "Review my current visa and admission documents for gaps and tell me what needs attention.", icon: FileText },
    { type: "deadline_scan", label: "Scan my deadlines", context: "Review the dates in my profile and identify what needs action next.", icon: CalendarClock },
  ],
  arrival: [
    { type: "housing_search", label: "Plan my housing search", context: "Build my housing search criteria from my destination, budget and study situation. Do not invent listings.", icon: Home },
    { type: "draft_email", label: "Draft an arrival message", context: "Draft the next professional message I need for an arrival-related task. Do not send it.", icon: CalendarClock },
    { type: "visa_check", label: "Check arrival requirements", context: "Explain the arrival and registration questions I should verify with the official authority for my destination.", icon: ShieldCheck },
  ],
  studying: [
    { type: "job_search", label: "Explore part-time opportunities", context: "Search for targeted part-time opportunities around my course, destination and known work constraints. Do not fabricate live jobs.", icon: Briefcase },
    { type: "deadline_scan", label: "Scan academic deadlines", context: "Identify study deadlines from my available profile data and tell me what information is missing.", icon: CalendarClock },
    { type: "visa_check", label: "Check work-rule questions", context: "Explain what I should verify about student work permissions with the official authority.", icon: ShieldCheck },
  ],
  "job-success": [
    { type: "job_search", label: "Find full-time opportunities", context: "Search for targeted full-time opportunities around my course, destination and post-study goals. Do not fabricate live jobs.", icon: Briefcase },
    { type: "tailor_cv", label: "Tailor my CV", context: "Create CV improvements using only facts in my profile. Never invent experience or metrics.", icon: FileText },
    { type: "deadline_scan", label: "Check my career runway", context: "Review known dates and identify job-search deadlines or missing information.", icon: CalendarClock },
  ],
};

export default function StageWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const currentPhase = profile.currentPhase || "pre-departure";
  const [phaseId, setPhaseId] = useState<PhaseId>(currentPhase);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; text: string } | null>(null);
  const phase = PHASES.find((p) => p.id === phaseId) || PHASES[0];
  const policy = useMemo(() => getStagePolicy(phase.id), [phase.id]);
  const Icon = ICONS[phase.id];
  const phaseTasks = TASKS[phase.id];
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const selectedIndex = PHASES.findIndex((p) => p.id === phase.id);

  async function runTask(task: typeof phaseTasks[number]) {
    setRunning(task.type + task.label);
    setResult(null);
    try {
      const res = await fetch("/api/abroadshield/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: task.type, context: task.context, phase: phase.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Task failed");
      setResult({ label: task.label, text: typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2) });
    } catch (e) {
      setResult({ label: task.label, text: e instanceof Error ? e.message : "Task failed. Please retry." });
    } finally {
      setRunning(null);
    }
  }

  const userFocus = phase.id === "pre-departure"
    ? "Keep documents, dates, finances and application information accurate and complete."
    : phase.id === "arrival"
      ? "Complete prepared arrival actions, confirm local details and tell the agent when plans change."
      : phase.id === "studying"
        ? "Keep academic, financial and work-status information current so the plan can adapt."
        : "Provide accurate experience and preferences, review applications and approve outreach or submissions.";

  return (
    <section className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
      <div className="mb-6 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Journey map</div>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--shield-text)]">Know where you are — and what comes next.</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">AbroadShield concentrates execution on the stage you are in, while keeping every future stage visible so you can understand the plan before you reach it.</p>
          </div>
          <button onClick={() => onNavigate("agent")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]"><Bot className="h-4 w-4" /> Ask the agent</button>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)]">
        <div className="grid grid-cols-4 border-b border-[var(--shield-border)]">
          {PHASES.map((p, index) => {
            const PIcon = ICONS[p.id];
            const active = p.id === phase.id;
            const current = p.id === currentPhase;
            return (
              <button key={p.id} onClick={() => { setPhaseId(p.id); setResult(null); }} className={`relative min-w-0 px-3 py-4 text-left transition ${active ? "bg-[oklch(0.74_0.17_162/0.09)]" : "hover:bg-white/[0.02]"}`}>
                <div className="flex items-center gap-2"><PIcon className={`h-4 w-4 shrink-0 ${active ? "text-[oklch(0.85_0.19_158)]" : "text-[var(--shield-text-faint)]"}`} /><span className="truncate text-[10px] font-semibold sm:text-xs">{p.name}</span></div>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-[var(--shield-text-faint)]"><span>{current ? "Current" : index > currentIndex ? "Upcoming" : "Earlier"}</span>{active && <ChevronRight className="h-3 w-3" />}</div>
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[oklch(0.74_0.17_162)]" />}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="text-[10px] text-[var(--shield-text-faint)]">Current operating stage: <span className="font-semibold capitalize text-[var(--shield-text-dim)]">{currentPhase.replace("-", " ")}</span></div>
          <div className="text-[10px] text-[var(--shield-text-faint)]">Viewing stage {selectedIndex + 1} of {PHASES.length}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.1)]"><Icon className="h-5 w-5 text-[oklch(0.74_0.17_162)]" /></div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">Stage {phase.index + 1} · {selectedIndex === currentIndex ? "Current" : selectedIndex > currentIndex ? "Upcoming" : "Earlier"}</div>
              <h2 className="mt-1 text-xl font-semibold">{policy.title}</h2>
              <p className="mt-2 text-sm font-medium text-[oklch(0.85_0.19_158)]">{policy.mission}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[oklch(0.74_0.17_162/0.18)] bg-[oklch(0.74_0.17_162/0.04)] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">How AbroadShield has framed this stage for you</div>
            <p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{policy.objective}</p>
            <div className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[var(--shield-text-faint)]">What the system prioritizes</div>
            <p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">{policy.systemFocus}</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--shield-border)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]"><Bot className="h-3.5 w-3.5" />AbroadShield will</div>
              <div className="mt-3 space-y-2 text-xs leading-5 text-[var(--shield-text-dim)]">
                {policy.capabilities.map((cap) => <div key={cap} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.74_0.17_162)]" />{cap.replaceAll("_", " ")}</div>)}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--shield-border)] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]"><UserRound className="h-3.5 w-3.5" />You will</div>
              <p className="mt-3 text-xs leading-5 text-[var(--shield-text-dim)]">{userFocus}</p>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.025] p-2.5 text-[10px] leading-4 text-[var(--shield-text-faint)]"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />Agent support does not replace your review, judgement or official decisions.</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Plan & execute</div>
            <h3 className="mt-1 text-lg font-semibold">{phase.name}</h3>
            <p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">You can plan any stage now. Execution is recorded against that selected stage.</p>
          </div>
          <div className="space-y-2">
            {phaseTasks.map((task) => {
              const TIcon = task.icon;
              const busy = running === task.type + task.label;
              return <button key={task.label} disabled={!!running} onClick={() => runTask(task)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-3 text-left transition hover:border-[oklch(0.74_0.17_162/0.45)] disabled:cursor-wait disabled:opacity-60">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.74_0.17_162/0.08)]"><TIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{task.label}</span><span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">{selectedIndex === currentIndex ? "Run now against your current stage." : selectedIndex > currentIndex ? "Prepare ahead without changing your current stage." : "Review or revisit an earlier stage."}</span></span>
                {busy ? <span className="text-[10px] text-[oklch(0.74_0.17_162)]">Working…</span> : <ArrowRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" />}
              </button>;
            })}
          </div>
          {result && <div className="mt-4 rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.05)] p-4"><div className="mb-2 text-xs font-semibold">Latest task result</div><pre className="max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre></div>}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5">
        <div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Forward plan</div><h3 className="mt-1 text-base font-semibold">Understand the path before you reach each stage.</h3></div><span className="text-[10px] text-[var(--shield-text-faint)]">Select a stage to inspect it</span></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {PHASES.map((p, index) => {
            const pPolicy = getStagePolicy(p.id);
            const current = p.id === currentPhase;
            return <button key={p.id} onClick={() => { setPhaseId(p.id); setResult(null); }} className="group rounded-xl border border-[var(--shield-border)] p-3 text-left transition hover:border-[oklch(0.74_0.17_162/0.35)]">
              <div className="flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">0{index + 1}</span><span className={`text-[9px] font-semibold ${current ? "text-[oklch(0.85_0.19_158)]" : "text-[var(--shield-text-faint)]"}`}>{current ? "CURRENT" : index > currentIndex ? "UP NEXT" : "EARLIER"}</span></div>
              <div className="mt-2 text-xs font-semibold">{p.name}</div>
              <div className="mt-1 line-clamp-3 text-[10px] leading-4 text-[var(--shield-text-faint)]">{pPolicy.objective}</div>
              <div className="mt-3 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[oklch(0.78_0.08_165)]">Inspect stage <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></div>
            </button>;
          })}
        </div>
      </div>
    </section>
  );
}
