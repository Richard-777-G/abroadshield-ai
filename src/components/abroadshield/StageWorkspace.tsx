"use client";

import { useEffect, useState } from "react";
import { ChevronDown, CheckCircle2, Bot, Briefcase, CalendarClock, FileText, Home, Plane, BookOpen, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { PHASES, type PhaseId } from "./data";
import { useProfileStore } from "./profileStore";

const ICONS: Record<PhaseId, typeof Plane> = { "pre-departure": Plane, arrival: Home, studying: BookOpen, "job-success": Briefcase };
const TASKS: Record<PhaseId, { type: string; label: string; context: string; icon: typeof FileText }[]> = {
  "pre-departure": [
    { type: "document_check", label: "Check my documents", context: "Review my current visa and admission documents for gaps and tell me what needs attention.", icon: FileText },
    { type: "draft_email", label: "Draft an important email", context: "Draft the next professional email I need for my study-abroad process. Do not send it.", icon: CalendarClock },
    { type: "deadline_scan", label: "Scan my deadlines", context: "Review the dates in my profile and identify what needs action next.", icon: CalendarClock },
  ],
  arrival: [
    { type: "housing_search", label: "Plan my housing search", context: "Build my housing search criteria from my destination, budget and study situation. Do not invent listings.", icon: Home },
    { type: "draft_email", label: "Draft an arrival email", context: "Draft a professional message for an arrival-related task. Do not send it.", icon: CalendarClock },
    { type: "visa_check", label: "Check arrival requirements", context: "Explain the arrival and registration questions I should verify with the official authority for my destination.", icon: FileText },
  ],
  studying: [
    { type: "job_search", label: "Find part-time opportunities", context: "Find current part-time opportunities relevant to my profile and destination. Do not fabricate live jobs.", icon: Briefcase },
    { type: "deadline_scan", label: "Scan academic deadlines", context: "Identify study deadlines from my available profile data and tell me what information is missing.", icon: CalendarClock },
    { type: "visa_check", label: "Check work-rule questions", context: "Explain what I should verify about student work permissions with the official authority.", icon: FileText },
  ],
  "job-success": [
    { type: "job_search", label: "Find full-time opportunities", context: "Find current full-time opportunities relevant to my course, destination and post-study goals. Do not fabricate live jobs.", icon: Briefcase },
    { type: "tailor_cv", label: "Tailor my CV", context: "Create CV improvements using only facts in my profile. Never invent experience or metrics.", icon: FileText },
    { type: "deadline_scan", label: "Check my job-search runway", context: "Review known dates and identify job-search deadlines or missing information.", icon: CalendarClock },
  ],
};

type Task = { id: string; title: string; status: string; type: string; phase: string; priority: string; result?: string | null; dueAt?: string | null; createdAt: string };

export default function StageWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const [phaseId, setPhaseId] = useState<PhaseId>(profile.currentPhase || "pre-departure");
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; text: string; status: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const phase = PHASES.find((p) => p.id === phaseId) || PHASES[0];
  const Icon = ICONS[phase.id];

  const loadTasks = async () => {
    try {
      const res = await fetch(`/api/abroadshield/journey?phase=${encodeURIComponent(phaseId)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setTasks(data.tasks || []);
    } catch { /* keep current state */ }
  };
  useEffect(() => { loadTasks(); }, [phaseId]);

  const runTask = async (task: typeof TASKS[PhaseId][number]) => {
    if (running) return;
    setRunning(task.label); setResult(null);
    try {
      const res = await fetch("/api/abroadshield/agent/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: task.context }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Task failed");
      const status = data.result?.status || "completed";
      setResult({ label: task.label, text: typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2), status });
      await loadTasks();
    } catch (e) { setResult({ label: task.label, text: e instanceof Error ? e.message : "Task failed. Please retry.", status: "failed" }); }
    finally { setRunning(null); }
  };

  const phaseTasks = TASKS[phase.id];
  const currentTasks = tasks.filter((t) => t.phase === phase.id).slice(0, 8);

  return <section className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
    <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Your journey</div><h1 className="mt-1 text-2xl font-semibold">What needs to happen next?</h1><p className="mt-1 text-xs text-[var(--shield-text-dim)]">One execution rail across all four stages. Select a stage to see its actions and real task state.</p></div>
      <button onClick={() => onNavigate("agent")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]"><Bot className="h-4 w-4" /> Talk to my agent <ArrowRight className="h-3.5 w-3.5" /></button>
    </div>
    <div className="relative mb-6"><label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Active stage</label><div className="relative"><select value={phase.id} onChange={(e) => { setPhaseId(e.target.value as PhaseId); setResult(null); }} className="w-full appearance-none rounded-2xl border border-[oklch(0.74_0.17_162/0.35)] bg-[var(--shield-ink-2)] px-4 py-4 pr-12 text-sm font-semibold outline-none">{PHASES.map((p) => <option key={p.id} value={p.id}>{p.index + 1}. {p.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--shield-text-faint)]" /></div></div>
    <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
      <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.1)]"><Icon className="h-5 w-5 text-[oklch(0.74_0.17_162)]" /></div><div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">Stage {phase.index + 1}</div><h2 className="mt-1 text-xl font-semibold">{phase.name}</h2><p className="mt-1 text-sm font-medium">{phase.tagline}</p><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">{phase.description}</p></div></div><div className="mt-5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Stage outcome</div><div className="mt-1 text-sm font-medium">{phase.milestone}</div></div></div>
      <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="mb-4"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Execute</div><h3 className="mt-1 text-lg font-semibold">Work this stage</h3><p className="mt-1 text-xs text-[var(--shield-text-dim)]">Every action uses the same authenticated orchestrator and becomes a persisted task.</p></div><div className="space-y-2">{phaseTasks.map((task) => { const TIcon = task.icon; const busy = running === task.label; return <button key={task.label} disabled={!!running} onClick={() => runTask(task)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-3 text-left disabled:opacity-60"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.74_0.17_162/0.08)]"><TIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{task.label}</span><span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">Run through the agent execution rail</span></span>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" />}</button>; })}</div>{result && <div className="mt-4 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold">{result.status === "failed" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />}{result.label} · {result.status}</div><pre className="max-h-64 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre></div>}</div>
    </div>
    <div className="mt-5 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="flex items-center justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Persisted work</div><h3 className="mt-1 text-lg font-semibold">Tasks in {phase.name}</h3></div><span className="text-[10px] text-[var(--shield-text-faint)]">{currentTasks.length} shown</span></div>{currentTasks.length === 0 ? <p className="mt-4 text-xs text-[var(--shield-text-faint)]">No tasks recorded for this stage yet. Run an action above to create the first one.</p> : <div className="mt-4 grid gap-2">{currentTasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-xl border border-[var(--shield-border)] px-3 py-3"><span className={`h-2 w-2 rounded-full ${task.status === "blocked" ? "bg-[oklch(0.8_0.15_80)]" : task.status === "failed" ? "bg-[oklch(0.62_0.2_25)]" : "bg-[oklch(0.74_0.17_162)]"}`} /><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{task.title}</div><div className="mt-0.5 text-[9px] uppercase text-[var(--shield-text-faint)]">{task.priority} · {task.status}</div></div>{task.dueAt && <span className="text-[9px] text-[var(--shield-text-faint)]">due {new Date(task.dueAt).toLocaleDateString()}</span>}</div>)}</div>}</div>
    <div className="mt-5 grid gap-3 sm:grid-cols-4">{PHASES.map((p) => { const PIcon = ICONS[p.id]; const active = p.id === phase.id; return <button key={p.id} onClick={() => { setPhaseId(p.id); setResult(null); }} className={`rounded-xl border p-3 text-left ${active ? "border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.08)]" : "border-[var(--shield-border)] bg-[var(--shield-ink-2)]"}`}><div className="flex items-center gap-2"><PIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" /><span className="text-xs font-semibold">{p.name}</span></div><div className="mt-1 text-[10px] text-[var(--shield-text-faint)]">{p.milestone}</div></button>; })}</div>
  </section>;
}
