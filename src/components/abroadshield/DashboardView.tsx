"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Briefcase, Mail, Search, AlertTriangle, Loader2 } from "lucide-react";
import { useProfileStore } from "./profileStore";

const ACTIONS = [
  { label: "Check documents", icon: FileText, message: "Check my current study-abroad documents for missing or inconsistent information." },
  { label: "Draft next email", icon: Mail, message: "Identify the most useful next email for my journey and draft it for approval. Do not send." },
  { label: "Find relevant jobs", icon: Search, message: "Find current roles relevant to my profile and post-study work goal. Only return verifiable live opportunities." },
  { label: "Tailor my CV", icon: Briefcase, message: "Tailor my CV to the most relevant role using only information already in my profile." },
];

type Task = { id: string; title: string; status: string; type: string; phase: string; result?: string | null; createdAt: string };

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const [working, setWorking] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; text: string; status: string } | null>(null);
  const [requirements, setRequirements] = useState<{ title: string; status: string; priority: string }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadWorkspace = async () => {
    try {
      const [requirementsResponse, journeyResponse] = await Promise.all([
        fetch("/api/abroadshield/requirements", { cache: "no-store" }),
        fetch("/api/abroadshield/journey", { cache: "no-store" }),
      ]);
      const requirementsData = await requirementsResponse.json();
      const journeyData = await journeyResponse.json();
      if (requirementsData.ok) setRequirements(requirementsData.snapshot.requirements.slice(0, 4));
      if (journeyData.ok) setTasks(journeyData.tasks.slice(0, 6));
    } catch {
      // The command center remains usable if a secondary read fails.
    }
  };

  useEffect(() => { loadWorkspace(); }, [profile.destination, profile.currentPhase]);

  const run = async (action: typeof ACTIONS[number]) => {
    if (working) return;
    setWorking(action.label);
    setResult(null);
    try {
      const response = await fetch("/api/abroadshield/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: action.message }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Agent execution failed.");
      const status = data.result?.status || "completed";
      const text = typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2);
      setResult({ label: action.label, text, status });
      await loadWorkspace();
    } catch (error) {
      setResult({ label: action.label, text: error instanceof Error ? error.message : "Could not execute the agent task.", status: "failed" });
    } finally {
      setWorking(null);
    }
  };

  const phase = profile.currentPhase?.replace("-", " ") || "pre-departure";
  const ready = profile.documentsTotal ? Math.round((profile.documentsVerified / profile.documentsTotal) * 100) : profile.readiness || 0;
  const activeTasks = tasks.filter((task) => task.status === "running" || task.status === "queued" || task.status === "blocked").slice(0, 3);

  return <section className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
    <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.74_0.17_162)]">Command center</div>
          <h1 className="mt-1 text-2xl font-semibold">What do you want the agent to do?</h1>
          <p className="mt-1 text-xs capitalize text-[var(--shield-text-dim)]">{profile.destination || "Your destination"} · {phase} · {ready}% document readiness</p>
        </div>
        <button onClick={() => onNavigate("agent")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)]">Open agent <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => { const Icon = action.icon; const busy = working === action.label; return <button key={action.label} disabled={!!working} onClick={() => run(action)} className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4 text-left transition hover:border-[oklch(0.74_0.17_162/0.45)] disabled:cursor-wait disabled:opacity-60"><div className="flex items-center justify-between"><Icon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" />}</div><div className="mt-3 text-sm font-semibold">{action.label}</div><div className="mt-1 text-[10px] text-[var(--shield-text-faint)]">Agent orchestrator</div></button>; })}
      </div>

      {activeTasks.length > 0 && <div className="mt-5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="flex items-center justify-between"><div><div className="text-xs font-semibold">Work queue</div><div className="mt-0.5 text-[10px] text-[var(--shield-text-faint)]">Persisted tasks from your agent, not demo activity.</div></div><button onClick={() => onNavigate("journey")} className="text-[10px] text-[oklch(0.74_0.17_162)]">Open journey →</button></div><div className="mt-3 space-y-2">{activeTasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-lg border border-[var(--shield-border)] px-3 py-2"><span className={`h-2 w-2 rounded-full ${task.status === "blocked" ? "bg-[oklch(0.8_0.15_80)]" : "bg-[oklch(0.74_0.17_162)]"}`} /><span className="min-w-0 flex-1 truncate text-[11px]">{task.title}</span><span className="text-[9px] uppercase text-[var(--shield-text-faint)]">{task.status.replace("_", " ")}</span></div>)}</div></div>}

      {requirements.length > 0 && <div className="mt-5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="flex items-center justify-between"><div className="text-xs font-semibold">Needs attention</div><button onClick={() => onNavigate("journey")} className="text-[10px] text-[oklch(0.74_0.17_162)]">Open journey →</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{requirements.map((r) => <div key={r.title} className="flex items-center gap-2 rounded-lg border border-[var(--shield-border)] px-3 py-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[oklch(0.8_0.15_80)]" /><span className="min-w-0 flex-1 truncate text-[11px]">{r.title}</span><span className="text-[9px] uppercase text-[var(--shield-text-faint)]">{r.priority}</span></div>)}</div></div>}

      {result && <div className="mt-5 rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.05)] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />{result.label} · {result.status}</div><pre className="max-h-80 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre></div>}
    </div>
  </section>;
}
