"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  GraduationCap,
  Loader2,
  MapPin,
  MessageSquare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
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
              <span>Synthesizing your journey context…</span>
            </div>
          ) : (
            <div className="as-dock w-full rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">Initialize Your AI Operating Environment</h2>
              <p className="mt-3 text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
                Set up your destination country, university, course, and target career outcome to activate your continuous statutory intelligence radar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("abroadshield:open-onboarding"))}
                  className="as-public-button-primary rounded-xl py-3 px-6 text-xs font-bold shadow-lg"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch Journey Onboarding</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("agent")}
                  className="rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] py-3 px-5 text-xs font-semibold text-white transition hover:border-[var(--shield-border-bright)]"
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

  const { profile, phase, route, stage, readiness, next } = snapshot;

  return (
    <section className="w-full pb-16">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
        {/* Top Operating Greeting */}
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-[var(--shield-border)] pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--shield-emerald-bright)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personal AI Operating Environment</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Journey Vector: {profile.destination || "Destination Active"}
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
              AbroadShield continuous intelligence is online. Your statutory requirements, target career path, and next deliverables are aligned.
            </p>
          </div>

          {/* Destination & Meta Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {profile.destination && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-xs text-white">
                <MapPin className="h-3 w-3 text-amber-400" />
                {profile.destination}
              </span>
            )}
            {profile.university && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-xs text-white">
                <GraduationCap className="h-3 w-3 text-[var(--shield-emerald-bright)]" />
                {profile.university}
              </span>
            )}
            {profile.course && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-xs text-white">
                {profile.course}
              </span>
            )}
          </div>
        </div>

        {/* AI "Here is what matters right now" - 3 Strategic Radar Panels */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Panel 1: Current Mission & Statutory Readiness */}
          <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.76_0.18_160/0.35)] bg-[linear-gradient(180deg,oklch(0.16_0.02_255/0.95),oklch(0.12_0.015_255/0.98))] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                01 // CURRENT MISSION
              </span>
              <span className="rounded-full bg-[oklch(0.76_0.18_160/0.15)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--shield-emerald-bright)]">
                ACTIVE
              </span>
            </div>

            <h2 className="mt-3 text-lg font-bold text-white">{stage.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--shield-text-dim)]">
              {phase.copy}
            </p>

            <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--shield-text-faint)] font-mono">STAGE READINESS</span>
                <span className="font-bold text-white">{readiness}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--shield-ink)]">
                <div
                  className="h-full rounded-full bg-[var(--shield-emerald-bright)] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Panel 2: Highest Priority Next Move */}
          <div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  02 // IMMEDIATE NEXT MOVE
                </span>
                <Target className="h-4 w-4 text-amber-400" />
              </div>

              {next ? (
                <>
                  <h2 className="mt-3 text-lg font-bold text-white">{next.title}</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                    {next.type === "saved_opportunity"
                      ? "Prepare your tailored application dossier for this opportunity."
                      : "Action sequenced to keep your journey moving without statutory bottlenecks."}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-3 text-lg font-bold text-white">Start Your Career Strategy</h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                    Search verified internships compliant with student visa limits or review blueprint.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
              <button
                type="button"
                onClick={() =>
                  triggerAgentPrompt(
                    next?.title
                      ? `Let's work on my next priority task: ${next.title}`
                      : "Help me analyze target internships in Paris for my course"
                  )
                }
                className="as-public-button-primary w-full rounded-xl py-2.5 text-xs font-bold"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Execute with Agent</span>
              </button>
            </div>
          </div>

          {/* Panel 3: Verified Opportunities & Statutory Ceiling */}
          <div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-cyan)]">
                  03 // WORK &amp; INTERNSHIPS
                </span>
                <Building2 className="h-4 w-4 text-[var(--shield-cyan)]" />
              </div>

              <h2 className="mt-3 text-lg font-bold text-white">Opportunity Engine</h2>
              <div className="mt-2 space-y-1 text-xs text-[var(--shield-text-dim)]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                  <span>Statutory 964h Annual Limit: Enforced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                  <span>Public Gateway: France Travail</span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
              <button
                type="button"
                onClick={() => onNavigate("network")}
                className="as-public-button-secondary w-full rounded-xl py-2.5 text-xs font-bold"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Conversational Launcher: "What would you like to accomplish today?" */}
        <div className="mt-8 rounded-3xl border border-[var(--shield-border)] bg-[linear-gradient(135deg,oklch(0.15_0.02_255/0.8),oklch(0.11_0.015_255/0.9))] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--shield-emerald-bright)]">
            <Bot className="h-4 w-4" />
            <span>Direct Agent Launchpad</span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            What do you want to accomplish today?
          </h3>
          <p className="mt-1 text-xs text-[var(--shield-text-dim)]">
            Select an objective or type any real task into your Co-Pilot.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              "Find internships in Paris related to my course",
              "Check my student visa work authorization limits",
              "Help me prepare my CV for European employers",
              "What do I need to do before I arrive?",
              "Draft an outreach email to a campus researcher",
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => triggerAgentPrompt(prompt)}
                className="rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3.5 py-2 text-xs text-white transition hover:border-[oklch(0.76_0.18_160/0.6)] hover:bg-[oklch(0.76_0.18_160/0.12)] hover:text-[var(--shield-emerald-bright)]"
              >
                “{prompt}”
              </button>
            ))}
          </div>
        </div>

        {/* The 4-Phase Visible Route Timeline */}
        <div className="mt-8 rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-text-faint)]">
                CONTINUOUS ROUTE PROGRESSION
              </div>
              <h3 className="mt-1 text-lg font-bold text-white">From Admission to Full-Time Career</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("journey")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--shield-emerald-bright)] hover:underline"
            >
              <span>View Full Journey Blueprint</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {route.map((item, index) => {
              const active = item.current;
              const complete = item.complete;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition ${
                    active
                      ? "border-[oklch(0.76_0.18_160/0.6)] bg-[oklch(0.76_0.18_160/0.12)] shadow-md"
                      : complete
                      ? "border-[var(--shield-border)] bg-[oklch(0.12_0.015_255/0.6)]"
                      : "border-[var(--shield-border)] bg-[var(--shield-ink)] opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--shield-text-faint)]">
                      0{index + 1}
                    </span>
                    {complete ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                    ) : active ? (
                      <span className="rounded-full bg-[oklch(0.76_0.18_160/0.2)] px-2 py-0.5 text-[9px] font-mono font-bold text-[var(--shield-emerald-bright)] as-pulse">
                        CURRENT
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 text-sm font-bold text-white">{item.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Policy & Statutory Evidence Card */}
        <div className="mt-8">
          <PolicyEvidenceCard evidence={snapshot.policyEvidence ?? null} />
        </div>
      </div>
    </section>
  );
}
