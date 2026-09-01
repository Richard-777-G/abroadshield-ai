"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, ListChecks, Loader2, ShieldAlert } from "lucide-react";
import type { JourneyRequirement, RequirementSnapshot } from "@/lib/abroadshield/requirements";

const statusLabel: Record<JourneyRequirement["status"], string> = { ready: "Ready", needs_review: "Review", blocked: "Blocked" };
const statusClass: Record<JourneyRequirement["status"], string> = {
  ready: "text-[oklch(0.85_0.19_158)] bg-[oklch(0.74_0.17_162/0.1)] border-[oklch(0.74_0.17_162/0.3)]",
  needs_review: "text-[oklch(0.86_0.17_80)] bg-[oklch(0.8_0.15_80/0.1)] border-[oklch(0.8_0.15_80/0.3)]",
  blocked: "text-[oklch(0.75_0.2_25)] bg-[oklch(0.65_0.2_25/0.1)] border-[oklch(0.65_0.2_25/0.3)]",
};

export default function StageRequirements() {
  const [snapshot, setSnapshot] = useState<RequirementSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/abroadshield/requirements", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Requirements unavailable.");
      setSnapshot(data.snapshot);
    } catch (e) { setError(e instanceof Error ? e.message : "Requirements unavailable."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  if (loading) return <section className="mx-auto max-w-6xl px-5 py-6"><div className="flex items-center gap-2 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 text-xs text-[var(--shield-text-dim)]"><Loader2 className="h-4 w-4 animate-spin" />Building your country + stage requirements…</div></section>;
  if (error) return <section className="mx-auto max-w-6xl px-5 py-6"><div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-xs text-red-300">{error}</div></section>;
  if (!snapshot?.country) return <section className="mx-auto max-w-6xl px-5 py-6"><div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldAlert className="h-4 w-4 text-[oklch(0.86_0.17_80)]" />Destination rules are waiting for your profile.</div><p className="mt-2 text-xs text-[var(--shield-text-dim)]">Complete your destination country in onboarding before AbroadShield can personalize this checklist.</p></div></section>;

  return <section className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
    <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[oklch(0.85_0.19_158)]"><ListChecks className="h-3.5 w-3.5" />Personalized requirements</div><h2 className="mt-1 text-xl font-semibold">{snapshot.country.flag} {snapshot.country.country} · {snapshot.phase}</h2><p className="mt-1 text-xs text-[var(--shield-text-dim)]">Derived from your persistent journey profile and the configured destination rule table.</p></div>
        <div className="flex gap-2 text-[10px]"><span className="rounded-full border border-red-500/20 px-2 py-1">{snapshot.summary.critical} critical</span><span className="rounded-full border border-[var(--shield-border)] px-2 py-1">{snapshot.summary.review} review</span><span className="rounded-full border border-[oklch(0.74_0.17_162/0.25)] px-2 py-1">{snapshot.readiness}% ready</span></div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {snapshot.requirements.map((item) => <div key={item.id} className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] p-4"><div className="flex items-start gap-3"><span className={`mt-0.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${statusClass[item.status]}`}>{statusLabel[item.status]}</span><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{item.title}</div><p className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">{item.reason}</p><div className="mt-2 flex items-start gap-1.5 text-[11px] font-medium"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.86_0.17_80)]" />{item.nextAction}</div>{item.source && <a href={item.source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[10px] text-[oklch(0.82_0.13_210)] hover:underline"><ExternalLink className="h-3 w-3" />{item.source.label}</a>}</div></div></div>)}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-[var(--shield-text-faint)]"><CheckCircle2 className="h-3.5 w-3.5" />Documents verified: {snapshot.verifiedDocuments} / {snapshot.totalDocuments}</div>
    </div>
  </section>;
}
