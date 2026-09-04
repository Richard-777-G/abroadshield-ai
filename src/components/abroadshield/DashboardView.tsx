"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Briefcase, Mail, Search, AlertTriangle, Loader2, CalendarClock, Bot } from "lucide-react";
import { useProfileStore } from "./profileStore";
import { PHASES } from "./data";
import type { PhaseId } from "@/lib/abroadshield/phase";
import { getStagePolicy } from "@/lib/abroadshield/stage-orchestrator";

const ACTION_META = {
  document_check: { label: "Check documents", icon: FileText, context: "Check my current study-abroad documents for missing or inconsistent information." },
  draft_email: { label: "Draft next email", icon: Mail, context: "Identify the most useful next email for my journey and draft it for approval. Do not send." },
  deadline_scan: { label: "Scan deadlines", icon: CalendarClock, context: "Review my current journey dates and identify what needs action next." },
  visa_check: { label: "Check visa guidance", icon: Search, context: "Check the current visa or immigration question relevant to my active journey stage using official sources." },
  housing_search: { label: "Plan housing", icon: Search, context: "Plan my housing search using my destination, budget and study situation. Do not invent live listings." },
  job_search: { label: "Find relevant jobs", icon: Search, context: "Find current roles relevant to my profile and post-study work goal. Only return verifiable live opportunities." },
  tailor_cv: { label: "Tailor my CV", icon: Briefcase, context: "Tailor my CV using only information already present in my profile." },
} as const;

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const phase: PhaseId = profile.currentPhase || "pre-departure";
  const policy = useMemo(() => getStagePolicy(phase), [phase]);
  const phaseIndex = PHASES.findIndex((p) => p.id === phase);
  const ready = profile.documentsTotal ? Math.round((profile.documentsVerified / profile.documentsTotal) * 100) : profile.readiness || 0;
  const [working, setWorking] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; text: string; ok: boolean } | null>(null);
  const [requirements, setRequirements] = useState<{ title: string; status: string; priority: string }[]>([]);
  const [nextAction, setNextAction] = useState<{ title: string; reason?: string; type?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/abroadshield/requirements", { cache: "no-store" }).then(async (r) => { const d = await r.json(); return d.ok ? d.snapshot.requirements.slice(0, 4) : []; }),
      fetch("/api/abroadshield/next-action", { cache: "no-store" }).then(async (r) => { const d = await r.json(); return d.ok ? d.next || null : null; }),
    ]).then(([items, next]) => { if (!cancelled) { setRequirements(items); setNextAction(next); } }).catch(() => {}).finally(() => {});
    return () => { cancelled = true; };
  }, [profile.destination, phase]);

  async function run(type: keyof typeof ACTION_META) {
    if (working) return;
    setWorking(type); setResult(null);
    try {
      const action = ACTION_META[type];
      const r = await fetch("/api/abroadshield/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskType: type, context: action.context }) });
      const d = await r.json();
      setResult({ label: action.label, text: d.ok ? (typeof d.result === "string" ? d.result : JSON.stringify(d.result, null, 2)) : (d.error || "Task failed"), ok: Boolean(d.ok) });
      if (d.ok) {
        const nextResponse = await fetch("/api/abroadshield/next-action", { cache: "no-store" });
        const nextData = await nextResponse.json();
        if (nextData.ok) setNextAction(nextData.next || null);
      }
    } catch { setResult({ label: ACTION_META[type].label, text: "Could not reach the task service. Try again.", ok: false }); }
    finally { setWorking(null); }
  }

  const actions = policy.capabilities.filter((item): item is keyof typeof ACTION_META => item in ACTION_META).slice(0, 4);

  return <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-7">
    <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.74_0.17_162)]">Command center</div><h1 className="mt-1 text-2xl font-semibold">What matters now.</h1><p className="mt-1 text-xs text-[var(--shield-text-dim)]">{profile.destination || "Your destination"} · {policy.title} · {ready}% document readiness</p></div><button type="button" onClick={()=>onNavigate("agent")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]"><Bot className="h-4 w-4"/>Open agent</button></div>
      {nextAction ? <div className="mt-6 rounded-xl border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.74_0.17_162/0.045)] p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Next action</div><div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-semibold">{nextAction.title}</div>{nextAction.reason&&<div className="mt-1 max-w-2xl text-xs leading-5 text-[var(--shield-text-dim)]">{nextAction.reason}</div>}</div>{nextAction.type&&nextAction.type in ACTION_META?<button type="button" disabled={!!working} onClick={()=>void run(nextAction.type as keyof typeof ACTION_META)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]">{working===nextAction.type?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<ArrowRight className="h-3.5 w-3.5"/>}Take action</button>:null}</div></div>:<div className="mt-6 rounded-xl border border-[var(--shield-border)] p-4 text-xs text-[var(--shield-text-dim)]">No active action yet. Review your Journey to establish the next step.</div>}
      <div className="mt-6 rounded-xl border border-[var(--shield-border)] p-4"><div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Current-stage capabilities</div><div className="mt-1 text-xs text-[var(--shield-text-dim)]">{policy.title} capabilities available to the agent.</div></div><button type="button" onClick={()=>onNavigate("journey")} className="text-[10px] font-semibold text-[oklch(0.74_0.17_162)]">Open Journey <ArrowRight className="ml-1 inline h-3 w-3"/></button></div><div className="mt-3 flex flex-wrap gap-2">{actions.map(type=><button key={type} type="button" disabled={!!working} onClick={()=>void run(type)} className="rounded-full border border-[var(--shield-border)] px-3 py-1.5 text-[10px] text-[var(--shield-text-dim)] hover:border-[oklch(0.74_0.17_162/0.35)] disabled:opacity-60">{ACTION_META[type].label}</button>)}</div></div>
      <div className="mt-6 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Forward view</div><div className="mt-1 text-sm font-semibold">See the road ahead without losing today.</div></div><button type="button" onClick={()=>onNavigate("journey")} className="text-[10px] font-semibold text-[oklch(0.74_0.17_162)]">Open journey <ArrowRight className="ml-1 inline h-3 w-3"/></button></div><div className="mt-4 grid gap-2 sm:grid-cols-4">{PHASES.map((p,index)=>{const current=index===phaseIndex;return <button type="button" key={p.id} onClick={()=>onNavigate("journey")} className={"rounded-xl border p-3 text-left transition "+(current?"border-[oklch(0.74_0.17_162/0.45)] bg-[oklch(0.74_0.17_162/0.08)]":"border-[var(--shield-border)] hover:border-[oklch(0.74_0.17_162/0.3)]")}><div className="flex items-center justify-between"><span className="text-[10px] font-semibold">{String(index+1).padStart(2,"0")}</span><span className="text-[9px] uppercase text-[var(--shield-text-faint)]">{current?"Current":index>phaseIndex?"Next":"Earlier"}</span></div><div className="mt-2 text-xs font-semibold">{p.name}</div><div className="mt-1 line-clamp-2 text-[10px] leading-4 text-[var(--shield-text-faint)]">{getStagePolicy(p.id).mission}</div></button>})}</div></div>
      {requirements.length>0&&<div className="mt-5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="flex items-center justify-between"><div className="text-xs font-semibold">Needs attention now</div><button type="button" onClick={()=>onNavigate("journey")} className="text-[10px] text-[oklch(0.74_0.17_162)]">Open journey →</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{requirements.map(item=><div key={item.title} className="flex items-center gap-2 rounded-lg border border-[var(--shield-border)] px-3 py-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[oklch(0.8_0.15_80)]"/><span className="min-w-0 flex-1 truncate text-[11px]">{item.title}</span><span className="text-[9px] uppercase text-[var(--shield-text-faint)]">{item.priority}</span></div>)}</div></div>}
      {result&&<div className={`mt-5 rounded-xl border p-4 ${result.ok?"border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.05)]":"border-red-500/20 bg-red-500/5"}`}><div className="mb-2 flex items-center gap-2 text-xs font-semibold">{result.ok?<CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]"/>:<AlertTriangle className="h-4 w-4 text-red-300"/>}{result.label}</div><pre className="max-h-80 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre></div>}
    </div>
  </div>;
}
