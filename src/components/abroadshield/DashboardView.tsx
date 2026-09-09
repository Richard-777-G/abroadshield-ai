"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  GraduationCap,
  Loader2,
  MapPin,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import PolicyEvidenceCard from "./PolicyEvidenceCard";
import type { DashboardViewModel } from "@/lib/abroadshield/types/view-models";

export default function DashboardView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [snapshot, setSnapshot] = useState<DashboardViewModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/abroadshield/dashboard", { cache: "no-store" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setSnapshot(data?.ok ? data.snapshot ?? null : null);
      })
      .catch(() => {
        if (!cancelled) setSnapshot(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const triggerAgentPrompt = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("abroadshield:prefill-chat", { detail: prompt }));
    onNavigate("agent");
  };

  if (!snapshot) {
    return (
      <section className="w-full">
        <div className="mx-auto flex min-h-[500px] w-full max-w-2xl items-center justify-center px-5 py-12 sm:px-8">
          {loading ? (
            <div className="flex items-center gap-3 text-xs text-[var(--shield-text-dim)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--shield-emerald-bright)]" />
              <span>Synthesizing statutory intelligence…</span>
            </div>
          ) : (
            <div className="as-dock w-full rounded-3xl p-8 sm:p-10 text-center shadow-2xl border border-[var(--shield-border)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)]">
                <Scale className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">Statutory Intelligence Active</h2>
              <p className="mt-3 text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
                Connect your journey context to evaluate student visa ceilings, work limits, and administrative deadlines.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => onNavigate("settings")}
                  className="as-public-button-primary rounded-xl py-3 px-6 text-xs font-bold shadow-lg"
                >
                  <span>Configure Journey Context</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("agent")}
                  className="rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] py-3 px-5 text-xs font-semibold text-white transition hover:border-white/20"
                >
                  <Bot className="inline mr-1.5 h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                  <span>Open AI Co-Pilot</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const { profile, policyEvidence } = snapshot;

  return (
    <section className="w-full pb-16">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        {/* Statutory Header */}
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-[var(--shield-border)] pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--shield-emerald-bright)]">
              <Scale className="h-3.5 w-3.5" />
              <span>Deterministic Statutory Engine</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Statutory Limits &amp; Legal Governance
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
              Primary immigration law, annual work ceilings, and administrative deadlines governing your stay in{" "}
              <strong className="text-white">{profile.destination || "your destination"}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.1)] px-3 py-1.5 text-xs font-mono text-[var(--shield-emerald-bright)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
              <span>STATUTORY GUARD: ACTIVE</span>
            </span>
          </div>
        </div>

        {/* Core Statutory Limits Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1: Work Hours Authorization */}
          <div className="rounded-3xl border border-[oklch(0.76_0.18_160/0.35)] bg-[linear-gradient(180deg,oklch(0.16_0.02_255/0.95),oklch(0.12_0.015_255/0.98))] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                  CODE DU TRAVAIL · ART. R5221-26
                </span>
                <Clock className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
              </div>

              <h2 className="mt-3 text-lg font-bold text-white">964h Annual Work Ceiling</h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                International students on a VLS-TS permit may work up to <strong>964 hours per calendar year</strong> (60% of annual full-time duration).
              </p>

              <div className="mt-4 space-y-2 text-[11px] text-[var(--shield-text-dim)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)] shrink-0" />
                  <span>SMIC minimum wage guaranteed (€11.88/h gross)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)] shrink-0" />
                  <span>Employer must submit DPAE declaration 48h prior</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
              <button
                type="button"
                onClick={() =>
                  triggerAgentPrompt(
                    "Audit my student work authorization under French Article R5221-26 and check convention de stage rules."
                  )
                }
                className="as-public-button-primary w-full rounded-xl py-2.5 text-xs font-bold"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Audit Work Rights with Co-Pilot</span>
              </button>
            </div>
          </div>

          {/* Card 2: Convention de Stage Isolation */}
          <div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-cyan)]">
                  ACADEMIC INTERNSHIPS
                </span>
                <Building2 className="h-4 w-4 text-[var(--shield-cyan)]" />
              </div>

              <h2 className="mt-3 text-lg font-bold text-white">Convention de Stage Rules</h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                Curricular internships governed by a formal tripartite agreement (University + Employer + Student) do <strong>not</strong> count against your 964h annual employment ceiling.
              </p>

              <div className="mt-4 space-y-2 text-[11px] text-[var(--shield-text-dim)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-cyan)] shrink-0" />
                  <span>Mandatory gratification for internships &gt; 2 months</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-cyan)] shrink-0" />
                  <span>Integrated with university ECTS credit validation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
              <button
                type="button"
                onClick={() =>
                  triggerAgentPrompt(
                    "Explain the difference between a student CDD and a Convention de Stage under French law."
                  )
                }
                className="as-public-button-secondary w-full rounded-xl py-2.5 text-xs font-bold"
              >
                <span>Stage Agreement Guidelines</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Administrative Deadlines & Validation */}
          <div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  OFFICIAL PROTOCOLS
                </span>
                <Calendar className="h-4 w-4 text-amber-400" />
              </div>

              <h2 className="mt-3 text-lg font-bold text-white">Administrative Deadlines</h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                Strict statutory timelines must be satisfied to maintain lawful residence and access French student benefits.
              </p>

              <div className="mt-4 space-y-2 text-[11px] text-[var(--shield-text-dim)]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong>VLS-TS Validation:</strong> Within 90 days on ANEF portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong>CVEC Receipt:</strong> Mandatory prior to university registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong>CPAM Social Security:</strong> Free registration on ameli.fr</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
              <button
                type="button"
                onClick={() =>
                  triggerAgentPrompt(
                    "What are the mandatory administrative deadlines after landing in France as a student?"
                  )
                }
                className="as-public-button-secondary w-full rounded-xl py-2.5 text-xs font-bold"
              >
                <span>Review Validation Protocols</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Evidence & Official Source Card */}
        <PolicyEvidenceCard evidence={policyEvidence} />
      </div>
    </section>
  );
}
