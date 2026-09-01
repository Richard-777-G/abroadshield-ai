"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Briefcase, Mail, Search, AlertTriangle, Loader2 } from "lucide-react";
import { useProfileStore } from "./profileStore";

const ACTIONS = [
  { type: "document_check", label: "Check documents", icon: FileText, context: "Check my current study-abroad documents for missing or inconsistent information." },
  { type: "draft_email", label: "Draft next email", icon: Mail, context: "Identify the most useful next email for my journey and draft it for approval. Do not send." },
  { type: "job_search", label: "Find relevant jobs", icon: Search, context: "Find current roles relevant to my profile and post-study work goal. Only return verifiable live opportunities." },
  { type: "tailor_cv", label: "Tailor my CV", icon: Briefcase, context: "Tailor my CV to the most relevant role using only information already in my profile." },
];

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const [working, setWorking] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; text: string } | null>(null);
  const [requirements, setRequirements] = useState<{ title: string; status: string; priority: string }[]>([]);

  useEffect(() => {
    fetch("/api/abroadshield/requirements", { cache: "no-store" }).then(async (r) => { const d = await r.json(); if (d.ok) setRequirements(d.snapshot.requirements.slice(0, 4)); }).catch(() => {});
  }, [profile.destination, profile.currentPhase]);

  const run = async (action: typeof ACTIONS[number]) => {
    if (working) return;
    setWorking(action.type); setResult(null);
    try {
      const r = await fetch("/api/abroadshield/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskType: action.type, context: action.context, profile }) });
      const d = await r.json();
      setResult({ label: action.label, text: d.ok ? (typeof d.result === "string" ? d.result : JSON.stringify(d.result, null, 2)) : (d.error || "Task failed") });
    } catch { setResult({ label: action.label, text: "Could not reach the task service. Try again." }); }
    finally { setWorking(null); }
  };

  const phase = profile.currentPhase?.replace("-", " ") || "pre-departure";
  const ready = profile.documentsTotal ? Math.round((profile.documentsVerified / profile.documentsTotal) * 100) : profile.readiness || 0;
  return <section className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
    <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.74_0.17_162)]">Command center</div><h1 className="mt-1 text-2xl font-semibold">What do you want the agent to do?</h1><p className="mt-1 text-xs text-[var(--shield-text-dim)]">{profile.destination || "Your destination"} · {phase} · {ready}% document readiness</p></div>
        <button onClick={() => onNavigate("agent")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]">Open agent <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{ACTIONS.map((a) => { const Icon = a.icon; return <button key={a.type} disabled={!!working} onClick={() => run(a)} className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4 text-left transition hover:border-[oklch(0.74_0.17_162/0.45)] disabled:opacity-60"><div className="flex items-center justify-between"><Icon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />{working === a.type ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" />}</div><div className="mt-3 text-sm font-semibold">{a.label}</div><div className="mt-1 text-[10px] text-[var(--shield-text-faint)]">Run now</div></button>; })}</div>
      {requirements.length > 0 && <div className="mt-5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="flex items-center justify-between"><div className="text-xs font-semibold">Needs attention</div><button onClick={() => onNavigate("journey")} className="text-[10px] text-[oklch(0.74_0.17_162)]">Open journey →</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{requirements.map((r) => <div key={r.title} className="flex items-center gap-2 rounded-lg border border-[var(--shield-border)] px-3 py-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[oklch(0.8_0.15_80)]" /><span className="min-w-0 flex-1 truncate text-[11px]">{r.title}</span><span className="text-[9px] uppercase text-[var(--shield-text-faint)]">{r.priority}</span></div>)}</div></div>}
      {result && <div className="mt-5 rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.05)] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />{result.label} completed</div><pre className="max-h-80 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre></div>}
    </div>
  </section>;
}
