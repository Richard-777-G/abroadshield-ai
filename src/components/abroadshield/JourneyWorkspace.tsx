"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  Play,
  Scale,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import { useProfileStore } from "./profileStore";
import type { StudentProfile } from "./profileStore";

type Tab = "blueprint" | "compliance" | "cv";

type ProfileTest = {
  score: number;
  passed: number;
  total: number;
  status: string;
  results: Array<{ field: string; label: string; guidance: string; passed: boolean }>;
  next: string;
};

const STAGES = [
  { id: "pre-departure", step: "01", title: "Dream & Decide", mission: "Evaluate destinations, university fit, and visa quota feasibility." },
  { id: "arrival", step: "02", title: "Arrive & Settle", mission: "Secure housing attestations, CPAM healthcare, and French bank account." },
  { id: "studying", step: "03", title: "Study & Intern", mission: "Enforce 964h legal ceiling; prepare convention de stage agreements." },
  { id: "job-success", step: "04", title: "Career & Visas", mission: "Transition to post-study work authorization (RECE/APS) and full-time contracts." },
] as const;

export default function JourneyWorkspace({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { profile } = useProfileStore();
  const [tab, setTab] = useState<Tab>("blueprint");
  const [test, setTest] = useState<ProfileTest | null>(null);
  const [testing, setTesting] = useState(false);
  const [cv, setCv] = useState("");
  const [cvResult, setCvResult] = useState("");
  const [analyzingCv, setAnalyzingCv] = useState(false);
  const [error, setError] = useState("");

  const runProfileTest = async () => {
    setTesting(true);
    setError("");
    try {
      const res = await fetch("/api/abroadshield/profile-test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Profile compliance test failed.");
      setTest(data);
      setTab("compliance");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compliance check failed.");
    } finally {
      setTesting(false);
    }
  };

  const analyzeCv = async () => {
    if (cv.trim().length < 80) return;
    setError("");
    setCvResult("");
    setAnalyzingCv(true);
    try {
      const res = await fetch("/api/abroadshield/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze my CV against my AbroadShield journey. Destination: ${profile.destination || "France"}. Course: ${profile.course || "General"}. Do not invent facts. Return: strengths, gaps, target positioning, priority skills, and a practical 90-day plan. Clearly label assumptions. CV:\n${cv.trim()}`,
          messages: [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "CV analysis is temporarily unavailable.");
      setCvResult(data.reply || "No analysis returned.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "CV analysis failed.");
    } finally {
      setAnalyzingCv(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-[var(--shield-ink)] pb-16">
      {/* Workspace Header */}
      <header className="border-b border-[var(--shield-border)] bg-[oklch(0.12_0.015_255/0.95)] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[.2em] text-[var(--shield-emerald-bright)]">
                <Compass className="h-3.5 w-3.5" />
                <span>Continuous Lifecycle Architecture</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Journey Vector &amp; Milestone Engine
              </h1>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--shield-text-dim)] sm:text-sm">
                Deterministic milestone progression across every phase of your transition abroad. Canonical identity is maintained in Settings.
              </p>
            </div>

            {/* Destination & Phase Context Badge */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-4 py-3 text-right">
                <div className="text-[9px] font-mono uppercase tracking-[.18em] text-[var(--shield-text-faint)]">Active Stage</div>
                <div className="mt-0.5 text-sm font-bold text-white capitalize">{profile.currentPhase.replaceAll("-", " ")}</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("settings")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3.5 py-3 text-xs font-semibold text-[var(--shield-text-dim)] hover:border-white/20 hover:text-white transition"
              >
                <Settings className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Journey vector views">
            <button
              type="button"
              onClick={() => setTab("blueprint")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                tab === "blueprint"
                  ? "border-[oklch(0.76_0.18_160/.5)] bg-[oklch(0.76_0.18_160/.15)] text-white"
                  : "border-[var(--shield-border)] text-[var(--shield-text-dim)] hover:text-white"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Lifecycle Blueprint</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("compliance")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                tab === "compliance"
                  ? "border-[oklch(0.76_0.18_160/.5)] bg-[oklch(0.76_0.18_160/.15)] text-white"
                  : "border-[var(--shield-border)] text-[var(--shield-text-dim)] hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Compliance Check</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("cv")}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                tab === "cv"
                  ? "border-[oklch(0.76_0.18_160/.5)] bg-[oklch(0.76_0.18_160/.15)] text-white"
                  : "border-[var(--shield-border)] text-[var(--shield-text-dim)] hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>CV Dossier Alignment</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        {error && (
          <div role="status" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* TAB 1: Lifecycle Blueprint */}
        {tab === "blueprint" && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {STAGES.map((s) => {
                const isCurrent = profile.currentPhase === s.id;
                return (
                  <div
                    key={s.id}
                    className={`rounded-3xl border p-6 flex flex-col justify-between transition ${
                      isCurrent
                        ? "border-[oklch(0.76_0.18_160/0.6)] bg-[oklch(0.76_0.18_160/0.08)] shadow-xl"
                        : "border-[var(--shield-border)] bg-[var(--shield-ink-2)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span className={isCurrent ? "text-[var(--shield-emerald-bright)]" : "text-[var(--shield-text-faint)]"}>
                          STAGE // {s.step}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-[oklch(0.76_0.18_160/0.2)] px-2 py-0.5 text-[9px] text-[var(--shield-emerald-bright)]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-base font-bold text-white">{s.title}</h2>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">{s.mission}</p>
                    </div>

                    <div className="mt-6 border-t border-[var(--shield-border)] pt-4">
                      {isCurrent ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--shield-emerald-bright)]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Current Operating Stage</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onNavigate("settings")}
                          className="text-[11px] font-mono text-[var(--shield-text-faint)] hover:text-white transition"
                        >
                          Change in Settings →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Context Summary Box */}
            <div className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Student Context Snapshot</h3>
                  <p className="mt-1 text-xs text-[var(--shield-text-dim)]">
                    This context informs the Co-Pilot’s statutory checks and France Travail job matching.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("settings")}
                  className="as-public-button-secondary rounded-xl px-4 py-2 text-xs font-semibold self-start"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Update Profile &amp; Goals</span>
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                  <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">Destination</div>
                  <div className="mt-1 text-sm font-bold text-white">{profile.destination || "Not set"}</div>
                </div>
                <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                  <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">University</div>
                  <div className="mt-1 text-sm font-bold text-white truncate">{profile.university || "Not set"}</div>
                </div>
                <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                  <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">Course</div>
                  <div className="mt-1 text-sm font-bold text-white truncate">{profile.course || "Not set"}</div>
                </div>
                <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                  <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">Intake</div>
                  <div className="mt-1 text-sm font-bold text-white">{profile.intake || "Not set"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Deterministic Compliance Check */}
        {tab === "compliance" && (
          <section className="rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">
                  Deterministic profile audit
                </div>
                <h2 className="mt-1 text-2xl font-bold text-white">Can the Co-Pilot verify this profile?</h2>
                <p className="mt-2 max-w-3xl text-xs leading-5 text-[var(--shield-text-dim)]">
                  Deterministic statutory evaluation checking for required visa, university, and career parameters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void runProfileTest()}
                disabled={testing}
                className="as-public-button-primary rounded-xl px-5 py-2.5 text-xs font-bold"
              >
                {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>{testing ? "Evaluating…" : "Run Compliance Audit"}</span>
              </button>
            </div>

            {test ? (
              <div className="mt-7 space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                    <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">Compliance Score</div>
                    <div className="mt-1 text-2xl font-bold text-white">{test.score}%</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                    <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">Rules Passed</div>
                    <div className="mt-1 text-2xl font-bold text-white">{test.passed} / {test.total}</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                    <div className="text-[9px] font-mono uppercase text-[var(--shield-text-faint)]">Verification State</div>
                    <div className="mt-1 text-sm font-bold capitalize text-[var(--shield-emerald-bright)]">{test.status.replaceAll("_", " ")}</div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {test.results.map((item) => (
                    <div
                      key={item.field}
                      className={`rounded-2xl border p-4 ${
                        item.passed
                          ? "border-[oklch(0.76_0.18_160/.3)] bg-[oklch(0.76_0.18_160/.08)]"
                          : "border-amber-500/30 bg-amber-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {item.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                        ) : (
                          <Target className="h-4 w-4 text-amber-300" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      {!item.passed && (
                        <p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{item.guidance}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-[.18em] text-[var(--shield-text-faint)]">
                    Next Statutory Action
                  </div>
                  <p className="mt-2 text-sm text-white">{test.next}</p>
                </div>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-[var(--shield-border)] p-8 text-center">
                <h3 className="text-sm font-bold text-white">No compliance audit run yet</h3>
                <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[var(--shield-text-dim)]">
                  Click the button above to run a deterministic check on your journey profile against destination requirements.
                </p>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: CV Dossier Alignment */}
        {tab === "cv" && (
          <section className="mx-auto max-w-5xl rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]">
                Career Evidence
              </div>
              <h2 className="mt-1 text-2xl font-bold text-white">Align CV against European standards.</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">
                Paste your CV text. The Co-Pilot evaluates it against European conventions and destination work rules without fabricating experience.
              </p>
            </div>

            <textarea
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              rows={12}
              placeholder="Paste your plain-text CV or resume here…"
              className="mt-6 w-full resize-y rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4 text-sm leading-6 text-white outline-none focus:border-[oklch(0.76_0.18_160/.6)]"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[10px] text-[var(--shield-text-faint)] font-mono">
                {cv.length} characters (min. 80)
              </span>
              <button
                type="button"
                disabled={cv.trim().length < 80 || analyzingCv}
                onClick={() => void analyzeCv()}
                className="as-public-button-primary rounded-xl px-5 py-2.5 text-xs font-bold disabled:opacity-50"
              >
                {analyzingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                <span>{analyzingCv ? "Evaluating…" : "Analyze Alignment"}</span>
              </button>
            </div>

            {cvResult && (
              <div className="mt-6 rounded-2xl border border-[oklch(0.76_0.18_160/.3)] bg-[oklch(0.15_0.02_255)] p-5">
                <div className="mb-3 text-xs font-mono font-bold text-[var(--shield-emerald-bright)]">
                  Co-Pilot Assessment &amp; Keyword Alignment
                </div>
                <div className="whitespace-pre-wrap text-sm leading-6 text-[var(--shield-text-dim)]">{cvResult}</div>
              </div>
            )}
          </section>
        )}
      </main>
    </section>
  );
}
