"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  AlertTriangle,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  Loader2,
  Mail,
  Map,
  Search,
  ShieldCheck,
} from "lucide-react";
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
  job_search: { label: "Find relevant jobs", icon: BriefcaseBusiness, context: "Find current roles relevant to my profile and post-study work goal. Only return verifiable live opportunities." },
  tailor_cv: { label: "Tailor my CV", icon: BriefcaseBusiness, context: "Tailor my CV using only information already present in my profile." },
} as const;

type TaskResult = { label: string; text: string; ok: boolean };

type Requirement = { title: string; status: string; priority: string };
type NextAction = { title: string; reason?: string; type?: string };

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const phase: PhaseId = profile.currentPhase || "pre-departure";
  const policy = useMemo(() => getStagePolicy(phase), [phase]);
  const phaseIndex = Math.max(0, PHASES.findIndex((p) => p.id === phase));
  const ready = profile.documentsTotal > 0
    ? Math.min(100, Math.round((profile.documentsVerified / profile.documentsTotal) * 100))
    : Math.max(0, Math.min(100, profile.readiness || 0));

  const [working, setWorking] = useState<string | null>(null);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/abroadshield/requirements", { cache: "no-store" }).then(async (r) => {
        const d = await r.json();
        return d.ok && Array.isArray(d.snapshot?.requirements) ? d.snapshot.requirements.slice(0, 4) : [];
      }),
      fetch("/api/abroadshield/next-action", { cache: "no-store" }).then(async (r) => {
        const d = await r.json();
        return d.ok ? d.next || null : null;
      }),
    ])
      .then(([items, next]) => {
        if (!cancelled) {
          setRequirements(items);
          setNextAction(next);
        }
      })
      .catch(() => undefined);

    return () => { cancelled = true; };
  }, [profile.destination, phase]);

  async function run(type: keyof typeof ACTION_META) {
    if (working) return;
    setWorking(type);
    setResult(null);
    try {
      const action = ACTION_META[type];
      const response = await fetch("/api/abroadshield/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: type, context: action.context, phase }),
      });
      const data = await response.json().catch(() => ({}));
      setResult({
        label: action.label,
        text: data.ok
          ? (typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2))
          : (data.error || "Task failed"),
        ok: Boolean(data.ok),
      });
      if (data.ok) {
        const nextResponse = await fetch("/api/abroadshield/next-action", { cache: "no-store" });
        const nextData = await nextResponse.json().catch(() => ({}));
        if (nextData.ok) setNextAction(nextData.next || null);
      }
    } catch {
      setResult({ label: ACTION_META[type].label, text: "Could not reach the task service. Try again.", ok: false });
    } finally {
      setWorking(null);
    }
  }

  const actions = policy.capabilities
    .filter((item): item is keyof typeof ACTION_META => item in ACTION_META)
    .slice(0, 4);

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.74_0.17_162)]">
                <ShieldCheck className="h-3.5 w-3.5" /> Command center
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">What matters now.</h1>
              <p className="mt-2 text-sm text-[var(--shield-text-dim)]">
                {profile.destination || "Your destination"} <span className="px-1.5 text-[var(--shield-text-faint)]">·</span> {policy.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onNavigate("journey")} className="inline-flex items-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-4 py-2.5 text-xs font-semibold text-[var(--shield-text)] transition hover:border-[oklch(0.74_0.17_162/0.35)]">
                <Map className="h-4 w-4" /> Open journey
              </button>
              <button type="button" onClick={() => onNavigate("agent")} className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)] transition hover:bg-[oklch(0.85_0.19_158)]">
                <Bot className="h-4 w-4" /> Open agent
              </button>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
            <section className="rounded-2xl border border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.16_0.02_165)] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Journey readiness</div>
                  <div className="mt-2 text-2xl font-semibold text-[var(--shield-text)]">{ready}% ready</div>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--shield-text-dim)]">
                    Based on the document readiness currently stored in your journey profile.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/0.62)] px-3 py-2 text-right">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-[var(--shield-text-faint)]">Active stage</div>
                  <div className="mt-0.5 text-xs font-semibold text-[var(--shield-text)]">{policy.title}</div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[oklch(0.09_0.012_165)]">
                <div className="h-full rounded-full bg-[oklch(0.74_0.17_162)] transition-all" style={{ width: `${ready}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Documents" value={`${profile.documentsVerified}/${profile.documentsTotal}`} />
                <Metric label="Current stage" value={String(phaseIndex + 1).padStart(2, "0")} />
                <Metric label="Destination" value={profile.destination || "—"} />
                <Metric label="Intake" value={profile.intake || "—"} />
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Next action</div>
              {nextAction ? (
                <>
                  <div className="mt-2 text-base font-semibold text-[var(--shield-text)]">{nextAction.title}</div>
                  {nextAction.reason && <p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{nextAction.reason}</p>}
                  {nextAction.type && nextAction.type in ACTION_META && (
                    <button type="button" disabled={!!working} onClick={() => void run(nextAction.type as keyof typeof ACTION_META)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)] disabled:opacity-60">
                      {working === nextAction.type ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                      Take action
                    </button>
                  )}
                </>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-[var(--shield-border)] p-4 text-xs leading-5 text-[var(--shield-text-dim)]">No action is currently queued. Your journey workspace is available when you need to plan or review the next stage.</div>
              )}
            </section>
          </div>

          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Work now</div>
                <h2 className="mt-1 text-lg font-semibold text-[var(--shield-text)]">Current-stage actions</h2>
              </div>
              <span className="hidden text-[10px] text-[var(--shield-text-faint)] sm:block">Only capabilities allowed by the active stage are shown.</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {actions.map((type) => {
                const Icon = ACTION_META[type].icon;
                return (
                  <button key={type} type="button" disabled={!!working} onClick={() => void run(type)} className="group rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[oklch(0.74_0.17_162/0.35)] disabled:opacity-60">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--shield-border)] bg-[oklch(0.74_0.17_162/0.08)] text-[oklch(0.85_0.19_158)]">
                        {working === type ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[var(--shield-text-faint)] transition group-hover:translate-x-0.5 group-hover:text-[var(--shield-text-dim)]" />
                    </div>
                    <div className="mt-4 text-sm font-semibold text-[var(--shield-text)]">{ACTION_META[type].label}</div>
                    <p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">Run this task against your current journey context.</p>
                  </button>
                );
              })}
            </div>
          </section>

          {requirements.length > 0 && (
            <section className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Attention queue</div>
                  <h2 className="mt-1 text-base font-semibold text-[var(--shield-text)]">Needs attention now</h2>
                </div>
                <button type="button" onClick={() => onNavigate("journey")} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.74_0.17_162)]">View all <ArrowRight className="h-3 w-3" /></button>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {requirements.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl border border-[var(--shield-border)] px-3.5 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-[oklch(0.86_0.17_80)]" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--shield-text)]">{item.title}</span>
                    <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-[var(--shield-text-faint)]">{item.priority}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Journey</div>
                <h2 className="mt-1 text-lg font-semibold text-[var(--shield-text)]">Four stages. One active mission.</h2>
              </div>
              <span className="text-[10px] text-[var(--shield-text-faint)]">Current: {policy.title}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {PHASES.map((item, index) => {
                const current = index === phaseIndex;
                const state = index === phaseIndex ? "Current" : index > phaseIndex ? "Upcoming" : "Completed stage";
                return (
                  <div key={item.id} className={`rounded-2xl border p-4 ${current ? "border-[oklch(0.74_0.17_162/0.42)] bg-[oklch(0.74_0.17_162/0.07)]" : "border-[var(--shield-border)] bg-[var(--shield-ink-2)]"}`}>
                    <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold text-[var(--shield-text-faint)]">{String(index + 1).padStart(2, "0")}</span><span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--shield-text-faint)]">{state}</span></div>
                    <div className="mt-3 text-sm font-semibold text-[var(--shield-text)]">{item.name}</div>
                    <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-[var(--shield-text-dim)]">{getStagePolicy(item.id).objective}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {result && (
            <section className={`rounded-2xl border p-5 ${result.ok ? "border-[oklch(0.74_0.17_162/0.28)] bg-[oklch(0.74_0.17_162/0.04)]" : "border-red-500/20 bg-red-500/5"}`}>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--shield-text)]">
                {result.ok ? <CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" /> : <AlertTriangle className="h-4 w-4 text-red-300" />}
                {result.label}
              </div>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--shield-border)] bg-[oklch(0.10_0.014_165/0.55)] p-3 text-[11px] leading-5 text-[var(--shield-text-dim)]">{result.text}</pre>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/0.62)] px-3 py-2.5">
      <div className="text-[9px] uppercase tracking-[0.13em] text-[var(--shield-text-faint)]">{label}</div>
      <div className="mt-1 truncate text-xs font-semibold text-[var(--shield-text)]">{value}</div>
    </div>
  );
}
