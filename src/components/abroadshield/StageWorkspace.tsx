"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle, AlertTriangle, Bot, Briefcase, CalendarClock, FileText, Home, Plane, BookOpen, ArrowRight } from "lucide-react";
import { PHASES, type PhaseId } from "./data";
import { useProfileStore } from "./profileStore";

const ICONS: Record<PhaseId, typeof Plane> = {
  "pre-departure": Plane,
  arrival: Home,
  studying: BookOpen,
  "job-success": Briefcase,
};

const TASKS: Record<PhaseId, { type: string; label: string; context: string; icon: typeof FileText }[]> = {
  "pre-departure": [
    { type: "document_check", label: "Check my documents", context: "Review my current visa and admission documents for gaps and tell me what needs attention.", icon: FileText },
    { type: "draft_email", label: "Draft an important email", context: "Draft the next professional email I need for my study-abroad process. Do not send it.", icon: CalendarClock },
    { type: "deadline_scan", label: "Scan my deadlines", context: "Review the dates in my profile and identify what needs action next.", icon: CalendarClock },
  ],
  arrival: [
    { type: "housing_search", label: "Plan my housing search", context: "Build my housing search criteria from my destination, budget and study situation. Do not invent listings.", icon: Home },
    { type: "draft_email", label: "Draft a landlord/bank email", context: "Draft a professional message for an arrival-related task. Do not send it.", icon: CalendarClock },
    { type: "visa_check", label: "Check arrival requirements", context: "Explain the arrival/registration questions I should verify with the official authority for my destination.", icon: FileText },
  ],
  studying: [
    { type: "job_search", label: "Find part-time opportunities", context: "Build a targeted part-time job search around my course, destination and legal work constraints. Do not fabricate live jobs.", icon: Briefcase },
    { type: "deadline_scan", label: "Scan academic deadlines", context: "Identify study deadlines from my available profile data and tell me what information is missing.", icon: CalendarClock },
    { type: "visa_check", label: "Check work-rule questions", context: "Explain what I should verify about student work permissions with the official authority.", icon: FileText },
  ],
  "job-success": [
    { type: "job_search", label: "Find full-time opportunities", context: "Build a targeted full-time job search around my course, destination and post-study goals. Do not fabricate live jobs.", icon: Briefcase },
    { type: "tailor_cv", label: "Tailor my CV", context: "Create CV improvements using only facts in my profile. Never invent experience or metrics.", icon: FileText },
    { type: "deadline_scan", label: "Check my job-search runway", context: "Review known dates and identify job-search deadlines or missing information.", icon: CalendarClock },
  ],
};

export default function StageWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const initial = profile.currentPhase || "pre-departure";
  const [phaseId, setPhaseId] = useState<PhaseId>(initial);
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; text: string } | null>(null);
  const phase = PHASES.find((p) => p.id === phaseId) || PHASES[0];
  const Icon = ICONS[phase.id];
  const phaseTasks = TASKS[phase.id];

  const runTask = async (task: typeof phaseTasks[number]) => {
    setRunning(task.type + task.label);
    setResult(null);
    try {
      const res = await fetch("/api/abroadshield/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskType: task.type, context: task.context, profile }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Task failed");
      const raw = typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2);
      setResult({ label: task.label, text: raw });
    } catch (e) {
      setResult({ label: task.label, text: e instanceof Error ? e.message : "Task failed. Please retry." });
    } finally { setRunning(null); }
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Your journey</div>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--shield-text)]">What needs to happen next?</h1>
          <p className="mt-1 text-xs text-[var(--shield-text-dim)]">One workspace, four stages, and an agent that works against the stage you select.</p>
        </div>
        <button onClick={() => onNavigate("agent")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]"><Bot className="h-4 w-4" /> Talk to my agent <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>

      <div className="relative mb-6">
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Active stage</label>
        <div className="relative">
          <select value={phase.id} onChange={(e) => { setPhaseId(e.target.value as PhaseId); setResult(null); }} className="w-full appearance-none rounded-2xl border border-[oklch(0.74_0.17_162/0.35)] bg-[var(--shield-ink-2)] px-4 py-4 pr-12 text-sm font-semibold text-[var(--shield-text)] outline-none focus:border-[oklch(0.74_0.17_162/0.7)]">
            {PHASES.map((p) => <option key={p.id} value={p.id}>{p.index + 1}. {p.name}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-faint)]" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.1)]"><Icon className="h-5 w-5 text-[oklch(0.74_0.17_162)]" /></div>
            <div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">Stage {phase.index + 1}</div><h2 className="mt-1 text-xl font-semibold">{phase.name}</h2><p className="mt-1 text-sm font-medium text-[oklch(0.85_0.19_158)]">{phase.tagline}</p><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">{phase.description}</p></div>
          </div>
          <div className="mt-5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Stage outcome</div><div className="mt-1 text-sm font-medium">{phase.milestone}</div></div>
          <div className="mt-5"><div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">What AbroadShield can do</div><div className="space-y-2">{phase.agenticActions.map((a) => <div key={a} className="flex gap-2 text-xs leading-5 text-[var(--shield-text-dim)]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.74_0.17_162)]" />{a}</div>)}</div></div>
        </div>

        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
          <div className="mb-4"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Agent actions</div><h3 className="mt-1 text-lg font-semibold">Do something now</h3><p className="mt-1 text-xs text-[var(--shield-text-dim)]">These actions are scoped to {phase.name}. Results come from the authenticated task API.</p></div>
          <div className="space-y-2">{phaseTasks.map((task) => { const TIcon = task.icon; const busy = running === task.type + task.label; return <button key={task.label} disabled={!!running} onClick={() => runTask(task)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-3 text-left transition hover:border-[oklch(0.74_0.17_162/0.45)] disabled:cursor-wait disabled:opacity-60"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.74_0.17_162/0.08)]"><TIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{task.label}</span><span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">Agent executes the task and reports what it can actually verify.</span></span>{busy ? <span className="text-[10px] text-[oklch(0.74_0.17_162)]">Working…</span> : <ArrowRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" />}</button>; })}</div>
          {result && <div className="mt-4 rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.05)] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />{result.label}</div><pre className="max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre></div>}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">{PHASES.map((p) => { const PIcon = ICONS[p.id]; const active = p.id === phase.id; return <button key={p.id} onClick={() => { setPhaseId(p.id); setResult(null); }} className={`rounded-xl border p-3 text-left ${active ? "border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.08)]" : "border-[var(--shield-border)] bg-[var(--shield-ink-2)]"}`}><div className="flex items-center gap-2"><PIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" /><span className="text-xs font-semibold">{p.name}</span></div><div className="mt-1 text-[10px] text-[var(--shield-text-faint)]">{p.agenticActions.length} agent capabilities</div></button>; })}</div>
    </section>
  );
}
