"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Search,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Globe,
  Shield,
  Calendar,
  ArrowRight,
  Activity,
  Target,
  Home,
  BookOpen,
  Plane,
} from "lucide-react";
import Reveal from "./Reveal";
import { useProfileStore } from "./profileStore";
import { useApprovalsStore } from "./approvalsStore";

/* ---------------------------------------------------------------------------
 * Dashboard — the command center for the student's entire journey
 * Live agent status, phase progress, upcoming deadlines, quick actions
 * --------------------------------------------------------------------------- */

const QUICK_TASKS = [
  {
    id: "check-docs",
    label: "Run document check",
    icon: FileText,
    accent: "emerald",
    taskType: "document_check",
    context: "Passport + bank statement gap check for UK Student Visa",
    phase: "pre-departure",
  },
  {
    id: "draft-email",
    label: "Draft consulate email",
    icon: Mail,
    accent: "amber",
    taskType: "draft_email",
    context: "Email to VFS Global regarding visa appointment rescheduling",
    phase: "pre-departure",
  },
  {
    id: "job-search",
    label: "Scan job openings",
    icon: Search,
    accent: "cyan",
    taskType: "job_search",
    context: "Data Science roles in UK with Graduate Route sponsorship",
    phase: "job-success",
  },
  {
    id: "tailor-cv",
    label: "Tailor my CV",
    icon: Briefcase,
    accent: "violet",
    taskType: "tailor_cv",
    context: "Data Scientist role at a UK fintech company",
    phase: "job-success",
  },
];

const ACCENT_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  emerald: {
    text: "text-[oklch(0.74_0.17_162)]",
    bg: "bg-[oklch(0.74_0.17_162/0.1)]",
    border: "border-[oklch(0.74_0.17_162/0.3)]",
    dot: "bg-[oklch(0.74_0.17_162)]",
  },
  amber: {
    text: "text-[oklch(0.8_0.15_80)]",
    bg: "bg-[oklch(0.8_0.15_80/0.1)]",
    border: "border-[oklch(0.8_0.15_80/0.3)]",
    dot: "bg-[oklch(0.8_0.15_80)]",
  },
  cyan: {
    text: "text-[oklch(0.74_0.13_210)]",
    bg: "bg-[oklch(0.74_0.13_210/0.1)]",
    border: "border-[oklch(0.74_0.13_210/0.3)]",
    dot: "bg-[oklch(0.74_0.13_210)]",
  },
  violet: {
    text: "text-[oklch(0.64_0.16_300)]",
    bg: "bg-[oklch(0.64_0.16_300/0.1)]",
    border: "border-[oklch(0.64_0.16_300/0.3)]",
    dot: "bg-[oklch(0.64_0.16_300)]",
  },
};

const PHASE_ICONS = {
  "pre-departure": Plane,
  arrival: Home,
  studying: BookOpen,
  "job-success": Briefcase,
};

const PHASE_NAMES = {
  "pre-departure": "Pre-Departure",
  arrival: "Arrival",
  studying: "Studying",
  "job-success": "Job Success",
};

type TaskStatus = "idle" | "running" | "done" | "error";

interface TaskResult {
  taskId: string;
  taskType: string;
  label: string;
  status: TaskStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  error?: string;
  startedAt?: number;
  duration?: number;
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - pct, 3))));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "emerald",
  animate = false,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  animate?: boolean;
}) {
  const numericVal = typeof value === "number" ? value : 0;
  const animated = useCountUp(animate ? numericVal : 0);
  const colors = ACCENT_COLORS[accent] ?? ACCENT_COLORS.emerald;

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className={`text-3xl font-bold ${colors.text}`}>
        {animate && typeof value === "number" ? animated : value}
      </div>
      <div className="mt-1 text-sm font-medium text-[var(--shield-text)]">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-[var(--shield-text-faint)]">{sub}</div>}
    </div>
  );
}

function QuickTaskCard({
  task,
  onRun,
  result,
}: {
  task: (typeof QUICK_TASKS)[0];
  onRun: (task: (typeof QUICK_TASKS)[0]) => void;
  result?: TaskResult;
}) {
  const Icon = task.icon;
  const colors = ACCENT_COLORS[task.accent] ?? ACCENT_COLORS.emerald;
  const isRunning = result?.status === "running";
  const isDone = result?.status === "done";

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-[var(--shield-ink-2)] p-5 transition-all`}
      whileHover={{ y: -2 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg}`}>
          <Icon className={`h-4 w-4 ${colors.text}`} />
        </div>
        {isDone && (
          <CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
        )}
        {isRunning && (
          <RefreshCw className="h-4 w-4 animate-spin text-[var(--shield-text-faint)]" />
        )}
      </div>

      <div className="text-sm font-medium text-[var(--shield-text)]">{task.label}</div>
      <div className="mt-1 text-xs text-[var(--shield-text-faint)] line-clamp-2">{task.context}</div>

      {isDone && result?.result && (
        <div className="mt-3 text-xs text-[oklch(0.74_0.17_162)]">
          ✓ Completed in {((result.duration ?? 0) / 1000).toFixed(1)}s
        </div>
      )}
      {result?.status === "error" && (
        <div className="mt-3 text-xs text-[oklch(0.66_0.19_22)]">
          ✗ {result.error}
        </div>
      )}

      <button
        onClick={() => !isRunning && onRun(task)}
        disabled={isRunning}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition ${colors.bg} ${colors.text} ${colors.border} border hover:opacity-80 disabled:opacity-50`}
      >
        {isRunning ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            Agent working…
          </>
        ) : (
          <>
            <Zap className="h-3 w-3" />
            Run now
          </>
        )}
      </button>
    </motion.div>
  );
}

function TaskResultPanel({ result, onClose }: { result: TaskResult; onClose: () => void }) {
  if (!result.result) return null;

  const data = result.result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative overflow-hidden rounded-2xl border border-[oklch(0.74_0.17_162/0.3)] bg-[var(--shield-ink-2)] p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
          <span className="text-sm font-semibold text-[var(--shield-text)]">
            {result.label} — Complete
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-[var(--shield-text-faint)] hover:text-[var(--shield-text)]"
        >
          ✕ close
        </button>
      </div>

      {/* Render based on task type */}
      {result.taskType === "job_search" && Array.isArray(data) && (
        <div className="space-y-3">
          {data.slice(0, 3).map((job: {
            id: string;
            title: string;
            company: string;
            location: string;
            salary: string;
            sponsorship?: boolean;
            matchScore?: number;
            agentAction?: string;
          }) => (
            <div
              key={job.id}
              className="flex items-start justify-between rounded-xl bg-[oklch(0.14_0.018_165)] p-3"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--shield-text)]">{job.title}</div>
                <div className="text-xs text-[var(--shield-text-dim)]">
                  {job.company} · {job.location} · {job.salary}
                </div>
                {job.agentAction && (
                  <div className="mt-1 text-xs text-[oklch(0.74_0.17_162)]">→ {job.agentAction}</div>
                )}
              </div>
              <div className="ml-3 flex flex-col items-end gap-1">
                {job.sponsorship && (
                  <span className="rounded-full bg-[oklch(0.74_0.17_162/0.15)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.74_0.17_162)]">
                    Sponsored
                  </span>
                )}
                {job.matchScore && (
                  <span className="text-xs font-medium text-[var(--shield-text-dim)]">
                    {job.matchScore}% match
                  </span>
                )}
              </div>
            </div>
          ))}
          {data.length > 3 && (
            <div className="text-center text-xs text-[var(--shield-text-faint)]">
              +{data.length - 3} more roles found
            </div>
          )}
        </div>
      )}

      {result.taskType === "draft_email" && data.subject && (
        <div className="space-y-2">
          <div className="rounded-lg bg-[oklch(0.14_0.018_165)] p-3">
            <div className="mb-1 text-xs font-medium text-[var(--shield-text-faint)]">
              To: {data.to}
            </div>
            <div className="mb-2 text-xs font-semibold text-[var(--shield-text)]">
              Subject: {data.subject}
            </div>
            <pre className="whitespace-pre-wrap text-xs text-[var(--shield-text-dim)] leading-relaxed">
              {data.body}
            </pre>
          </div>
          {data.notes && (
            <div className="text-xs text-[oklch(0.74_0.17_162)]">
              Agent note: {data.notes}
            </div>
          )}
        </div>
      )}

      {result.taskType === "document_check" && data.status && (
        <div className="space-y-3">
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              data.status === "verified"
                ? "bg-[oklch(0.74_0.17_162/0.1)] text-[oklch(0.74_0.17_162)]"
                : "bg-[oklch(0.66_0.19_22/0.1)] text-[oklch(0.66_0.19_22)]"
            }`}
          >
            {data.status === "verified" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {data.summary}
          </div>
          {data.issues?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-[var(--shield-text-faint)]">Issues found:</div>
              {data.issues.map((issue: string, i: number) => (
                <div key={i} className="text-xs text-[oklch(0.66_0.19_22)]">• {issue}</div>
              ))}
            </div>
          )}
          {data.agentActions?.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-medium text-[var(--shield-text-faint)]">Agent actions:</div>
              {data.agentActions.map((action: string, i: number) => (
                <div key={i} className="text-xs text-[oklch(0.74_0.17_162)]">→ {action}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {result.taskType === "tailor_cv" && data.bulletPoints && (
        <div className="space-y-3">
          <div>
            <div className="mb-2 text-xs font-medium text-[var(--shield-text-faint)]">
              Tailored for: {data.role}
            </div>
            {data.bulletPoints.map((bp: string, i: number) => (
              <div key={i} className="mb-2 rounded-lg bg-[oklch(0.14_0.018_165)] p-2.5 text-xs text-[var(--shield-text-dim)]">
                • {bp}
              </div>
            ))}
          </div>
          {data.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.keywords.slice(0, 8).map((kw: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-[oklch(0.74_0.17_162/0.1)] px-2 py-0.5 text-[10px] text-[oklch(0.74_0.17_162)]"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* raw text fallback */}
      {result.result && typeof result.result === "string" && (
        <pre className="whitespace-pre-wrap text-xs text-[var(--shield-text-dim)] leading-relaxed max-h-48 overflow-y-auto">
          {result.result}
        </pre>
      )}
    </motion.div>
  );
}

export default function DashboardView({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { profile } = useProfileStore();
  const { entries } = useApprovalsStore();
  const [taskResults, setTaskResults] = useState<Record<string, TaskResult>>({});
  const [activeResult, setActiveResult] = useState<string | null>(null);
  const [deadlines, setDeadlines] = useState<{
    id: string;
    title: string;
    daysUntil: number;
    phase: string;
    severity: string;
    agentAction: string;
  }[] | null>(null);
  const [loadingDeadlines, setLoadingDeadlines] = useState(false);

  const PhaseIcon = PHASE_ICONS[profile.currentPhase] ?? Plane;
  const readinessPct = Math.round(
    (profile.documentsVerified / Math.max(profile.documentsTotal, 1)) * 100
  );

  const approvedCount = entries.filter((e) => e.action === "approved").length;
  const editedCount = entries.filter((e) => e.action === "edited").length;

  const runTask = async (task: (typeof QUICK_TASKS)[0]) => {
    const startedAt = Date.now();
    setTaskResults((prev) => ({
      ...prev,
      [task.id]: { taskId: task.id, taskType: task.taskType, label: task.label, status: "running", startedAt },
    }));

    try {
      const res = await fetch("/api/abroadshield/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: task.taskType, context: task.context }),
      });
      const data = await res.json();
      const duration = Date.now() - startedAt;

      if (data.ok) {
        setTaskResults((prev) => ({
          ...prev,
          [task.id]: {
            taskId: task.id,
            taskType: task.taskType,
            label: task.label,
            status: "done",
            result: data.result,
            startedAt,
            duration,
          },
        }));
        setActiveResult(task.id);
      } else {
        setTaskResults((prev) => ({
          ...prev,
          [task.id]: {
            taskId: task.id,
            taskType: task.taskType,
            label: task.label,
            status: "error",
            error: data.error ?? "Unknown error",
            startedAt,
          },
        }));
      }
    } catch {
      setTaskResults((prev) => ({
        ...prev,
        [task.id]: {
          taskId: task.id,
          taskType: task.taskType,
          label: task.label,
          status: "error",
          error: "Network error",
          startedAt,
        },
      }));
    }
  };

  const fetchDeadlines = async () => {
    setLoadingDeadlines(true);
    try {
      const res = await fetch("/api/abroadshield/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: "deadline_scan" }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        setDeadlines(data.result);
      }
    } catch {
      // silently fail — static fallback below
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const STATIC_DEADLINES = [
    { id: "d1", title: "Visa appointment", daysUntil: 6, phase: "Pre-Departure", severity: "critical", agentAction: "Agent has prepped your document checklist" },
    { id: "d2", title: "Bank statement — page 3", daysUntil: 2, phase: "Pre-Departure", severity: "critical", agentAction: "Agent is drafting request to bank" },
    { id: "d3", title: "CAS number from university", daysUntil: 14, phase: "Pre-Departure", severity: "warning", agentAction: "Agent monitoring university portal" },
  ];

  const displayedDeadlines = deadlines ?? STATIC_DEADLINES;

  return (
    <section className="relative w-full min-h-screen bg-transparent py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 as-radial-emerald opacity-30" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">

        {/* Header row */}
        <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-[oklch(0.74_0.17_162)] animate-pulse" />
              <span className="text-xs font-medium text-[oklch(0.74_0.17_162)] uppercase tracking-wider">
                Agent live
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--shield-text)] sm:text-3xl">
              {profile.name}&apos;s Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--shield-text-dim)]">
              {profile.course} · {profile.university} · {profile.intake}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)] px-4 py-2">
              <PhaseIcon className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
              <span className="text-sm font-medium text-[var(--shield-text)]">
                {PHASE_NAMES[profile.currentPhase]}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Stats row */}
        <Reveal className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Readiness"
            value={readinessPct}
            sub="of journey complete"
            icon={Target}
            accent="emerald"
            animate
          />
          <StatCard
            label="Documents"
            value={`${profile.documentsVerified}/${profile.documentsTotal}`}
            sub="verified & ready"
            icon={FileText}
            accent="amber"
          />
          <StatCard
            label="Actions taken"
            value={approvedCount + editedCount}
            sub={`${approvedCount} approved · ${editedCount} edited`}
            icon={CheckCircle2}
            accent="cyan"
          />
          <StatCard
            label="Days to intake"
            value={Math.max(0, Math.round((new Date("2026-09-15").getTime() - Date.now()) / 86400000))}
            sub={profile.intake}
            icon={Calendar}
            accent="violet"
            animate
          />
        </Reveal>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left: Quick agent tasks */}
          <div className="lg:col-span-2 space-y-6">
            <Reveal>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
                  <h2 className="text-base font-semibold text-[var(--shield-text)]">
                    Agent Quick Actions
                  </h2>
                </div>
                <span className="text-xs text-[var(--shield-text-faint)]">
                  Tap to trigger · results appear instantly
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {QUICK_TASKS.map((task) => (
                  <QuickTaskCard
                    key={task.id}
                    task={task}
                    onRun={runTask}
                    result={taskResults[task.id]}
                  />
                ))}
              </div>
            </Reveal>

            {/* Task result panel */}
            <AnimatePresence>
              {activeResult && taskResults[activeResult]?.status === "done" && (
                <TaskResultPanel
                  result={taskResults[activeResult]}
                  onClose={() => setActiveResult(null)}
                />
              )}
            </AnimatePresence>

            {/* Phase progress */}
            <Reveal>
              <div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.2)] bg-[var(--shield-ink-2)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
                  <h2 className="text-base font-semibold text-[var(--shield-text)]">
                    Journey Progress
                  </h2>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "pre-departure", label: "Pre-Departure", pct: 72, accent: "emerald" },
                    { id: "arrival", label: "Arrival", pct: 0, accent: "amber" },
                    { id: "studying", label: "Studying", pct: 0, accent: "violet" },
                    { id: "job-success", label: "Job Success", pct: 0, accent: "cyan" },
                  ].map((phase) => {
                    const colors = ACCENT_COLORS[phase.accent];
                    const isActive = profile.currentPhase === phase.id;
                    return (
                      <div key={phase.id}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className={isActive ? colors.text : "text-[var(--shield-text-faint)]"}>
                            {phase.label}
                            {isActive && (
                              <span className="ml-2 text-[10px] font-medium uppercase tracking-wide opacity-70">
                                current
                              </span>
                            )}
                          </span>
                          <span className={isActive ? colors.text : "text-[var(--shield-text-faint)]"}>
                            {isActive ? `${readinessPct}%` : phase.pct === 0 ? "not started" : `${phase.pct}%`}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[oklch(0.74_0.17_162/0.08)]">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${colors.dot}`}
                            style={{ width: isActive ? `${readinessPct}%` : `${phase.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Approvals summary */}
            <Reveal>
              <div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.2)] bg-[var(--shield-ink-2)] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
                    <h2 className="text-base font-semibold text-[var(--shield-text)]">
                      Recent Agent Actions
                    </h2>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("agent")}
                      className="flex items-center gap-1 text-xs text-[oklch(0.74_0.17_162)] hover:underline"
                    >
                      View all <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {entries.length === 0 ? (
                  <div className="text-center py-6 text-sm text-[var(--shield-text-faint)]">
                    No actions yet. Run a quick task above to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {entries.slice(0, 4).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 rounded-xl bg-[oklch(0.14_0.018_165)] p-3"
                      >
                        <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                          entry.action === "approved"
                            ? "bg-[oklch(0.74_0.17_162)]"
                            : entry.action === "edited"
                            ? "bg-[oklch(0.8_0.15_80)]"
                            : "bg-[oklch(0.66_0.19_22)]"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[var(--shield-text)] truncate">
                            {entry.title}
                          </div>
                          <div className="text-xs text-[var(--shield-text-faint)]">
                            {entry.action} · {entry.phase} · {entry.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right: Deadlines + shortcuts */}
          <div className="space-y-5">
            {/* Upcoming deadlines */}
            <Reveal>
              <div className="rounded-2xl border border-[oklch(0.66_0.19_22/0.3)] bg-[var(--shield-ink-2)] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[oklch(0.66_0.19_22)]" />
                    <h2 className="text-base font-semibold text-[var(--shield-text)]">
                      Urgent Deadlines
                    </h2>
                  </div>
                  <button
                    onClick={fetchDeadlines}
                    disabled={loadingDeadlines}
                    className="text-xs text-[var(--shield-text-faint)] hover:text-[oklch(0.74_0.17_162)] transition"
                  >
                    {loadingDeadlines ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </button>
                </div>
                <div className="space-y-3">
                  {displayedDeadlines.map((dl) => (
                    <div key={dl.id} className="rounded-xl bg-[oklch(0.14_0.018_165)] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-[var(--shield-text)]">
                            {dl.title}
                          </div>
                          <div className="text-xs text-[var(--shield-text-faint)]">{dl.phase}</div>
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            dl.severity === "critical"
                              ? "bg-[oklch(0.66_0.19_22/0.15)] text-[oklch(0.66_0.19_22)]"
                              : "bg-[oklch(0.8_0.15_80/0.15)] text-[oklch(0.8_0.15_80)]"
                          }`}
                        >
                          {dl.daysUntil}d
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-[oklch(0.74_0.17_162)]">
                        → {dl.agentAction}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={fetchDeadlines}
                  disabled={loadingDeadlines}
                  className="mt-4 w-full rounded-lg border border-[oklch(0.74_0.17_162/0.2)] py-2 text-xs text-[oklch(0.74_0.17_162)] hover:bg-[oklch(0.74_0.17_162/0.08)] transition"
                >
                  {loadingDeadlines ? "Agent scanning…" : "Ask agent for full scan"}
                </button>
              </div>
            </Reveal>

            {/* View shortcuts */}
            <Reveal>
              <div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.2)] bg-[var(--shield-ink-2)] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
                  <h2 className="text-base font-semibold text-[var(--shield-text)]">
                    Jump to
                  </h2>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Agent Chat", view: "agent", icon: Sparkles, desc: "Talk to your AI agent" },
                    { label: "Journey Map", view: "journey", icon: Globe, desc: "Your 4-phase roadmap" },
                    { label: "Countries", view: "countries", icon: Globe, desc: "Visa rules by country" },
                    { label: "Network & Jobs", view: "network", icon: Briefcase, desc: "Applications & contacts" },
                    { label: "Connectors", view: "connectors", icon: Activity, desc: "16 platform integrations" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.view}
                        onClick={() => onNavigate?.(item.view)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-[oklch(0.74_0.17_162/0.06)]"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />
                          <div>
                            <div className="text-xs font-medium text-[var(--shield-text)]">{item.label}</div>
                            <div className="text-[10px] text-[var(--shield-text-faint)]">{item.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Student profile card */}
            <Reveal>
              <div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.2)] bg-[oklch(0.74_0.17_162/0.05)] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.74_0.17_162/0.15)] text-sm font-bold text-[oklch(0.74_0.17_162)]">
                    {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--shield-text)]">{profile.name}</div>
                    <div className="text-xs text-[var(--shield-text-faint)]">{profile.origin}</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--shield-text-faint)]">Destination</span>
                    <span className="font-medium text-[var(--shield-text)]">{profile.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--shield-text-faint)]">Intake</span>
                    <span className="font-medium text-[var(--shield-text)]">{profile.intake}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--shield-text-faint)]">Readiness</span>
                    <span className="font-medium text-[oklch(0.74_0.17_162)]">{readinessPct}%</span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[oklch(0.74_0.17_162/0.12)]">
                  <div
                    className="h-full rounded-full bg-[oklch(0.74_0.17_162)]"
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Bottom section navigation */}
        <Reveal className="mt-10">
          <div className="rounded-2xl border border-[oklch(0.74_0.17_162/0.2)] bg-[var(--shield-ink-2)] p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[oklch(0.74_0.17_162)]" />
              <h2 className="text-base font-semibold text-[var(--shield-text)]">
                What the agent can do for you today
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Gap-check your documents",
                  detail: "Scan all 13 docs against the UK Student Visa checklist",
                  view: "journey",
                  accent: "emerald",
                },
                {
                  icon: Mail,
                  title: "Draft any email",
                  detail: "Consulate, landlord, bank, university — real drafts",
                  view: "agent",
                  accent: "amber",
                },
                {
                  icon: Globe,
                  title: "Compare destination countries",
                  detail: "Side-by-side visa rules across 10 countries",
                  view: "countries",
                  accent: "cyan",
                },
                {
                  icon: Briefcase,
                  title: "Scan & apply for jobs",
                  detail: "Sponsorship-filtered roles + tailored CV per application",
                  view: "network",
                  accent: "violet",
                },
                {
                  icon: Activity,
                  title: "Connect your platforms",
                  detail: "LinkedIn, Rightmove, Gmail — 16 integrations live",
                  view: "connectors",
                  accent: "emerald",
                },
                {
                  icon: Clock,
                  title: "Track every deadline",
                  detail: "27 deadlines · the agent nudges before they bite",
                  view: "journey",
                  accent: "amber",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                const colors = ACCENT_COLORS[item.accent];
                return (
                  <button
                    key={i}
                    onClick={() => onNavigate?.(item.view)}
                    className={`flex items-start gap-3 rounded-xl border ${colors.border} bg-[oklch(0.14_0.018_165)] p-4 text-left transition hover:${colors.bg}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--shield-text)]">{item.title}</div>
                      <div className="mt-0.5 text-xs text-[var(--shield-text-faint)]">{item.detail}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
