"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { PHASES, ACCENT_MAP, type Phase } from "./data";
import Reveal, { StaggerGroup, staggerItem } from "./Reveal";

const STATUS_LABEL: Record<Phase["tasks"][number]["status"], string> = {
  done: "Done",
  active: "In progress",
  queued: "Queued",
  "at-risk": "At risk",
};

const STATUS_STYLE: Record<Phase["tasks"][number]["status"], string> = {
  done: "text-[oklch(0.78_0.11_165)] bg-[oklch(0.62_0.09_165/0.12)] border-[oklch(0.62_0.09_165/0.35)]",
  active:
    "text-[oklch(0.8_0.1_75)] bg-[oklch(0.74_0.11_75/0.12)] border-[oklch(0.74_0.11_75/0.35)]",
  queued:
    "text-[var(--shield-text-dim)] bg-[oklch(0.3_0.02_220/0.5)] border-[oklch(0.5_0.04_200/0.25)]",
  "at-risk":
    "text-[oklch(0.72_0.2_25)] bg-[oklch(0.65_0.2_25/0.12)] border-[oklch(0.65_0.2_25/0.4)]",
};

export default function JourneyExplorer() {
  const [activeId, setActiveId] = useState<Phase["id"]>("pre-departure");
  const active = PHASES.find((p) => p.id === activeId)!;
  const accent = ACCENT_MAP[active.accent];

  return (
    <section id="journey" className="relative w-full bg-[var(--shield-ink)] py-20 sm:py-28">
      {/* section heading */}
      <Reveal className="mx-auto mb-12 max-w-7xl px-5 sm:px-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.78_0.11_165)]">
          <span className="h-px w-8 bg-[oklch(0.62_0.09_165/0.5)]" />
          The Four-Phase Journey
        </div>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
          One relationship carrying{" "}
          <span className="as-text-gradient">the same memory</span> through every leg.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
          The trust built during a stressful visa week is still there — compounding,
          not resetting — when the same student sits down for a job interview two years
          later. Tap a station to see what the agent actually does there.
        </p>
      </Reveal>

      {/* 3D-perspective bridge */}
      <Reveal delay={0.1} className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="as-perspective">
          <div className="as-preserve-3d relative">
            {/* connecting path */}
            <div className="absolute left-0 right-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[oklch(0.62_0.09_165/0.35)] to-transparent" />
            <div className="absolute left-0 right-0 top-1/2 -z-10 h-32 -translate-y-1/2 as-bg-grid-fine opacity-30 [transform:rotateX(60deg)translateZ(-40px)]" />

            {/* station selector */}
            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {PHASES.map((p, i) => {
                const a = ACCENT_MAP[p.accent];
                const isActive = p.id === activeId;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveId(p.id)}
                    className="group relative text-left transition-transform duration-300"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <motion.div
                      animate={{
                        rotateX: isActive ? 0 : 6,
                        translateY: isActive ? -6 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 220, damping: 22 }}
                      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur sm:p-5 ${
                        isActive
                          ? `as-glass-strong ${a.border} ${a.glow}`
                          : "as-glass border-[var(--shield-border)]"
                      }`}
                    >
                      {/* active inner glow */}
                      {isActive && (
                        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_80%_at_50%_0%,oklch(0.62_0.09_165/0.18),transparent_65%)]" />
                      )}
                      {/* phase index */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-[11px] tracking-wider ${
                            isActive ? a.text : "text-[var(--shield-text-dim)]"
                          }`}
                        >
                          PHASE 0{i + 1}
                        </span>
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                            isActive
                              ? `${a.bg} ${a.border}`
                              : "bg-[oklch(0.3_0.02_220/0.4)] border-[var(--shield-border)]"
                          }`}
                        >
                          <Icon
                            className={`h-4.5 w-4.5 ${
                              isActive ? a.text : "text-[var(--shield-text-dim)]"
                            }`}
                          />
                        </span>
                      </div>
                      <div
                        className={`mt-3 text-base font-semibold sm:text-lg ${
                          isActive ? "text-[var(--shield-text)]" : "text-[var(--shield-text-dim)]"
                        }`}
                      >
                        {p.name}
                      </div>
                      <div className="mt-1 text-xs text-[var(--shield-text-dim)]">
                        {p.tagline}
                      </div>

                      {/* progress rail */}
                      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[oklch(0.3_0.02_220/0.6)]">
                        <motion.div
                          className={`h-full ${a.dot}`}
                          initial={{ width: 0 }}
                          animate={{ width: isActive ? "100%" : "0%" }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </motion.div>

                    {/* connector arrow */}
                    {i < PHASES.length - 1 && (
                      <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 sm:block">
                        <ChevronRight className="h-4 w-4 text-[oklch(0.5_0.04_200/0.5)]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* active phase detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]"
          >
            {/* left: description + agentic actions */}
            <div className={`rounded-3xl border ${accent.border} as-glass-strong p-6 sm:p-8`}>
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accent.bg} ${accent.border}`}>
                  <active.icon className={`h-6 w-6 ${accent.text}`} />
                </div>
                <div>
                  <div className={`font-mono text-[11px] uppercase tracking-wider ${accent.text}`}>
                    Phase 0{active.index + 1} · Milestone
                  </div>
                  <h3 className="mt-1 text-2xl font-semibold text-[var(--shield-text)] sm:text-3xl">
                    {active.name}
                  </h3>
                  <p className="mt-2 text-sm text-[oklch(0.82_0.12_200/0.85)]">
                    {active.milestone}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[var(--shield-text-dim)]">
                {active.description}
              </p>

              {/* agentic actions */}
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                  <Sparkles className={`h-3.5 w-3.5 ${accent.text}`} />
                  What the agent does here
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {active.agenticActions.map((action) => (
                    <li
                      key={action}
                      className="flex items-start gap-2 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.185_0.014_235/0.4)] p-3 text-sm text-[var(--shield-text)]"
                    >
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accent.text}`} />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* stats */}
              <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--shield-border)]">
                {active.stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-[oklch(0.185_0.014_235/0.5)] px-3 py-3"
                  >
                    <div className={`text-lg font-semibold ${accent.text}`}>
                      {s.value}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-tight text-[var(--shield-text-dim)]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right: task list */}
            <div className="rounded-3xl border border-[var(--shield-border)] as-glass p-6 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                  Live tasks
                </h4>
                <span className={`text-xs ${accent.text}`}>
                  {active.tasks.length} tracked
                </span>
              </div>

              <div className="as-scroll max-h-[440px] space-y-3 overflow-y-auto pr-1">
                {active.tasks.map((task) => {
                  const TaskIcon = task.icon;
                  return (
                    <div
                      key={task.id}
                      className="group rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.185_0.014_235/0.4)] p-4 transition hover:border-[oklch(0.62_0.09_165/0.4)] hover:bg-[oklch(0.2_0.014_235/0.6)]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--shield-border)] bg-[oklch(0.16_0.02_220/0.6)]">
                          <TaskIcon className={`h-4 w-4 ${accent.text}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold leading-snug text-[var(--shield-text)]">
                            {task.title}
                          </div>
                          <div className="mt-1.5 text-xs leading-relaxed text-[oklch(0.7_0.02_200/0.95)]">
                            {task.detail}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--shield-border)] pt-2.5 pl-12">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[task.status]}`}
                          >
                            {STATUS_LABEL[task.status]}
                          </span>
                          {typeof task.due === "number" && (
                            <span className="text-[11px] text-[var(--shield-text-dim)]">
                              {task.due < 0
                                ? `${Math.abs(task.due)}d ago`
                                : task.due === 0
                                  ? "today"
                                  : `in ${task.due}d`}
                            </span>
                          )}
                        </div>
                        {task.agentic && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[oklch(0.62_0.09_165)]">
                            <Sparkles className="h-3 w-3" />
                            agentic
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.185_0.014_235/0.5)] py-2.5 text-xs font-semibold text-[var(--shield-text)] transition hover:border-[oklch(0.62_0.09_165/0.4)] hover:bg-[oklch(0.2_0.014_235/0.7)]"
                onClick={() => {
                  const el = document.getElementById("agent");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Ask the agent to handle next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
