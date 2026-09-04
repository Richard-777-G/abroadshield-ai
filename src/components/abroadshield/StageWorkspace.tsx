"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bot, Briefcase, CalendarClock, CheckCircle2, FileText, Home, Plane, BookOpen, UserRound, ShieldCheck } from "lucide-react";
import { PHASES } from "./data";
import type { PhaseId } from "@/lib/abroadshield/phase";
import { useProfileStore } from "./profileStore";
import { getStagePolicy } from "@/lib/abroadshield/stage-orchestrator";

const ICONS: Record<PhaseId, typeof Plane> = { "pre-departure": Plane, arrival: Home, studying: BookOpen, "job-success": Briefcase };

type Task = { type: string; label: string; context: string; icon: typeof FileText };
const TASKS: Record<PhaseId, Task[]> = {
  "pre-departure": [
    { type: "visa_check", label: "Review visa requirements", context: "Review visa questions for my destination and tell me what to verify from official sources.", icon: ShieldCheck },
    { type: "document_check", label: "Check my documents", context: "Review my study-abroad documents for gaps or inconsistencies and tell me what needs attention.", icon: FileText },
    { type: "deadline_scan", label: "Scan my deadlines", context: "Review my journey dates and identify the next actions that depend on deadlines.", icon: CalendarClock },
  ],
  arrival: [
    { type: "housing_search", label: "Plan housing", context: "Build my housing search criteria from my destination, budget and study situation. Do not invent listings.", icon: Home },
    { type: "visa_check", label: "Check arrival requirements", context: "Explain arrival and registration questions I should verify with the official authority.", icon: ShieldCheck },
    { type: "deadline_scan", label: "Scan arrival deadlines", context: "Review known arrival dates and identify time-sensitive actions.", icon: CalendarClock },
  ],
  studying: [
    { type: "deadline_scan", label: "Scan study deadlines", context: "Identify study-related deadlines and missing date information from my profile.", icon: CalendarClock },
    { type: "visa_check", label: "Check work-rule questions", context: "Explain what I should verify about student work permissions with the official authority.", icon: ShieldCheck },
    { type: "job_search", label: "Explore part-time work", context: "Search for targeted part-time opportunities around my course and destination. Do not fabricate live jobs.", icon: Briefcase },
  ],
  "job-success": [
    { type: "job_search", label: "Find relevant jobs", context: "Search for targeted full-time opportunities around my course, destination and goals. Only return verifiable live opportunities.", icon: Briefcase },
    { type: "tailor_cv", label: "Tailor my CV", context: "Improve my CV using only facts already in my profile. Never invent experience or metrics.", icon: FileText },
    { type: "deadline_scan", label: "Check career runway", context: "Review known dates and identify job-search timing risks or missing information.", icon: CalendarClock },
  ],
};

export default function StageWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const currentPhase: PhaseId = profile.currentPhase || "pre-departure";
  const [selectedPhase, setSelectedPhase] = useState<PhaseId>(currentPhase);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const phase = PHASES.find((item) => item.id === selectedPhase) || PHASES[0];
  const currentIndex = PHASES.findIndex((item) => item.id === currentPhase);
  const selectedIndex = PHASES.findIndex((item) => item.id === selectedPhase);
  const policy = useMemo(() => getStagePolicy(selectedPhase), [selectedPhase]);
  const Icon = ICONS[selectedPhase];
  const tasks = TASKS[selectedPhase];
  const studentRole = selectedPhase === "pre-departure" ? "Keep your documents, dates, finances and application information accurate and complete." : selectedPhase === "arrival" ? "Complete prepared arrival actions, confirm local details and report changes." : selectedPhase === "studying" ? "Keep academic, financial and work-status information current so the plan can adapt." : "Keep your experience and preferences accurate, review applications and approve outreach or submissions.";

  async function runTask(task: Task) {
    if (busy) return;
    setBusy(task.label); setResult(null);
    try {
      const response = await fetch("/api/abroadshield/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskType: task.type, context: task.context, phase: selectedPhase, mode: selectedPhase === currentPhase ? "execute" : "plan" }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Task failed.");
      setResult(typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2));
    } catch (error) { setResult(error instanceof Error ? error.message : "Task failed. Please retry."); }
    finally { setBusy(null); }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-7">
      <div className="mb-5 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Journey</div><h1 className="mt-1 text-2xl font-semibold">Know where you are — and what comes next.</h1><p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">Your current stage controls execution. Every other stage stays visible so you can understand and prepare for the road ahead.</p></div><button type="button" onClick={() => onNavigate("agent")} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]"><Bot className="h-4 w-4" />Ask the agent</button></div>
      </div>
      <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] sm:grid-cols-4">{PHASES.map((item, index) => { const selected=item.id===selectedPhase; const current=item.id===currentPhase; const StageIcon=ICONS[item.id]; return <button type="button" key={item.id} onClick={()=>{setSelectedPhase(item.id);setResult(null);}} className={["relative px-3 py-4 text-left transition",selected?"bg-[oklch(0.74_0.17_162/0.09)]":"hover:bg-white/[0.02]"].join(" ")}><div className="flex items-center gap-2"><StageIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]"/><span className="truncate text-[10px] font-semibold sm:text-xs">{item.name}</span></div><div className="mt-2 text-[9px] uppercase text-[var(--shield-text-faint)]">{current?"Current":index>currentIndex?"Up next":"Earlier"}</div>{selected?<span className="absolute inset-x-0 bottom-0 h-0.5 bg-[oklch(0.74_0.17_162)]"/>:null}</button>; })}</div>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.1)]"><Icon className="h-5 w-5 text-[oklch(0.74_0.17_162)]"/></div><div><div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]">Stage {selectedIndex+1} · {selectedIndex===currentIndex?"Current":selectedIndex>currentIndex?"Upcoming":"Earlier"}</div><h2 className="mt-1 text-xl font-semibold">{policy.title}</h2><p className="mt-2 text-sm leading-6 text-[oklch(0.85_0.19_158)]">{policy.mission}</p></div></div><div className="mt-5 rounded-xl border border-[var(--shield-border)] p-4"><div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]">How this stage fits your journey</div><p className="mt-2 text-sm leading-6 text-[var(--shield-text-dim)]">{policy.objective}</p><p className="mt-3 text-xs leading-5 text-[var(--shield-text-dim)]">{policy.systemFocus}</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[var(--shield-border)] p-4"><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]"><Bot className="h-3.5 w-3.5"/>AbroadShield</div><div className="mt-3 space-y-2 text-[11px] leading-5 text-[var(--shield-text-dim)]">{policy.capabilities.slice(0,5).map(capability=><div key={capability} className="flex gap-2"><CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-[oklch(0.74_0.17_162)]"/><span>{capability.replaceAll("_"," ")}</span></div>)}</div></div><div className="rounded-xl border border-[var(--shield-border)] p-4"><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]"><UserRound className="h-3.5 w-3.5"/>You</div><p className="mt-3 text-[11px] leading-5 text-[var(--shield-text-dim)]">{studentRole}</p></div></div></div>
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="mb-4"><div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--shield-text-faint)]">Plan & act</div><h3 className="mt-1 text-lg font-semibold">{selectedIndex===currentIndex?"Work on what matters now":"Prepare for this stage"}</h3><p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">{selectedIndex===currentIndex?"Actions run against your current stage.":"Planning does not change your current stage."}</p></div><div className="space-y-2">{tasks.map(task=>{const TaskIcon=task.icon;return <button type="button" key={task.label} disabled={Boolean(busy)} onClick={()=>void runTask(task)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-3 text-left transition hover:border-[oklch(0.74_0.17_162/0.45)] disabled:cursor-wait disabled:opacity-60"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.74_0.17_162/0.08)]"><TaskIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]"/></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{task.label}</span><span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">{selectedIndex===currentIndex?"Execute now":"Create a planning result"}</span></span>{busy===task.label?<span className="text-[10px] text-[oklch(0.74_0.17_162)]">Working…</span>:<ArrowRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]"/>}</button>})}</div>{result?<div className="mt-4 rounded-xl border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.74_0.17_162/0.045)] p-4"><div className="mb-2 text-xs font-semibold">Latest result</div><pre className="max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result}</pre></div>:null}</div>
      </div>
    </div>
  );
}
