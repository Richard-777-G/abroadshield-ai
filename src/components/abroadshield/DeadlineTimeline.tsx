"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Filter,
} from "lucide-react";
import Reveal from "./Reveal";
import {
  DEADLINES,
  SEVERITY_STYLE,
  PHASES,
  ACCENT_MAP,
  type PhaseId,
  type Deadline,
} from "./data";

const PHASES_ACCENT: Record<PhaseId, "emerald" | "amber" | "violet" | "cyan"> = {
  "pre-departure": "emerald",
  arrival: "violet",
  studying: "amber",
  "job-success": "cyan",
};

const PHASE_NAME: Record<PhaseId, string> = {
  "pre-departure": "Pre-Departure",
  arrival: "Arrival",
  studying: "Studying & Part-Time",
  "job-success": "Job Success",
};

type Filter = "all" | PhaseId;

export default function DeadlineTimeline() {
  const [filter, setFilter] = useState<Filter>("all");
  const [hovered, setHovered] = useState<Deadline | null>(null);
  const [selected, setSelected] = useState<Deadline | null>(null);

  // Compute the timeline range so all deadlines fit on the rail.
  const { minDay, maxDay, span } = useMemo(() => {
    const days = DEADLINES.map((d) => d.day);
    const min = Math.min(...days, -42);
    const max = Math.max(...days, 365);
    return { minDay: min, maxDay: max, span: max - min };
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? DEADLINES : DEADLINES.filter((d) => d.phase === filter)),
    [filter]
  );

  // bucket deadlines into phase lanes for the swimlane view
  const lanes = useMemo(() => {
    const map = new Map<PhaseId, Deadline[]>();
    PHASES.forEach((p) => map.set(p.id, []));
    DEADLINES.forEach((d) => {
      map.get(d.phase)?.push(d);
    });
    return map;
  }, []);

  const todayPct = ((0 - minDay) / span) * 100;

  const active = hovered ?? selected;

  return (
    <section className="relative w-full bg-transparent py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.8_0.15_80/0.35)] to-transparent" />
      <div className="pointer-events-none absolute inset-0 as-bg-grid-fine opacity-20" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* heading */}
        <Reveal className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.8_0.15_80)]">
            <span className="h-px w-8 bg-[oklch(0.8_0.15_80/0.5)]" />
            27 deadlines · one rail
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            It flags a deadline{" "}
            <span className="as-text-gradient-amber">while there&apos;s still time</span> to act.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            The proactive-nudge pillar — the agent&apos;s strongest differentiator. Every
            deadline the agent is tracking, across all four phases, on one continuous rail.
            Today is the bright marker. Hover any dot for detail.
          </p>
        </Reveal>

        {/* filters + legend */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-1">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              All phases
            </FilterChip>
            {PHASES.map((p) => (
              <FilterChip
                key={p.id}
                active={filter === p.id}
                onClick={() => setFilter(p.id)}
                accent={PHASES_ACCENT[p.id]}
              >
                {PHASE_NAME[p.id].split(" ")[0]}
              </FilterChip>
            ))}
          </div>

          {/* legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--shield-text-dim)]">
            {(
              [
                { k: "done", label: "Completed" },
                { k: "info", label: "Upcoming" },
                { k: "warning", label: "Action needed" },
                { k: "critical", label: "Critical" },
              ] as const
            ).map((l) => (
              <span key={l.k} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${SEVERITY_STYLE[l.k].dot}`} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* the rail */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--shield-border)] as-glass-strong p-5 sm:p-7">
          {/* swimlanes */}
          <div className="space-y-2">
            {PHASES.map((phase) => {
              const items = lanes.get(phase.id) ?? [];
              const accent = ACCENT_MAP[phase.accent];
              const dimmed = filter !== "all" && filter !== phase.id;
              return (
                <div
                  key={phase.id}
                  className={`relative grid grid-cols-[120px_1fr] items-center gap-3 sm:grid-cols-[160px_1fr] ${
                    dimmed ? "opacity-30" : "opacity-100"
                  } transition-opacity`}
                >
                  {/* lane label */}
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${accent.dot}`} />
                    <span className="truncate text-xs font-medium text-[var(--shield-text)]">
                      {PHASE_NAME[phase.id]}
                    </span>
                    <span className="text-[10px] text-[var(--shield-text-dim)]">
                      {items.length}
                    </span>
                  </div>

                  {/* lane track */}
                  <div className="relative h-10 rounded-lg border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)/0.6)]">
                    {/* phase tint */}
                    <div
                      className={`absolute inset-0 rounded-lg ${accent.bg} opacity-40`}
                    />
                    {/* today marker (only show on first lane visually, but keep on all) */}
                    <div
                      className="absolute inset-y-0 z-20 w-px bg-[oklch(0.85_0.19_158)]"
                      style={{ left: `${todayPct}%` }}
                    >
                      <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[oklch(0.85_0.19_158)] as-pulse" />
                    </div>
                    {/* day ticks */}
                    {[-30, 0, 30, 90, 180, 365].map((tick) => {
                      const pct = ((tick - minDay) / span) * 100;
                      if (pct < 0 || pct > 100) return null;
                      return (
                        <div
                          key={tick}
                          className="absolute inset-y-0 w-px bg-[oklch(0.5_0.04_200/0.15)]"
                          style={{ left: `${pct}%` }}
                        />
                      );
                    })}
                    {/* deadline dots */}
                    {items.map((d) => {
                      const pct = ((d.day - minDay) / span) * 100;
                      const sev = SEVERITY_STYLE[d.severity];
                      const isActive = active?.id === d.id;
                      // stagger vertically when dots share the same day so they don't overlap
                      const sameDayCount = items.filter((x) => x.day === d.day).length;
                      const sameDayIdx = items.filter((x) => x.day === d.day).indexOf(d);
                      const stagger =
                        sameDayCount > 1 ? (sameDayIdx - (sameDayCount - 1) / 2) * 12 : 0;
                      return (
                        <button
                          key={d.id}
                          onMouseEnter={() => setHovered(d)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => setSelected(d)}
                          className="group absolute top-1/2 z-10 flex h-7 w-7 items-center justify-center"
                          style={{
                            left: `${pct}%`,
                            transform: `translate(-50%, calc(-50% + ${stagger}px))`,
                          }}
                          aria-label={`${d.label} — ${d.day < 0 ? `${Math.abs(d.day)}d ago` : d.day === 0 ? "today" : `in ${d.day}d`}`}
                        >
                          <span
                            className={`pointer-events-none block h-3.5 w-3.5 rounded-full ${sev.dot} ring-2 ring-offset-1 ring-offset-[oklch(0.14_0.018_165))] transition-all ${
                              isActive ? `scale-150 ${sev.ring} ring-2` : "ring-[oklch(0.14_0.018_165))]"
                            } group-hover:scale-150`}
                          />
                          {d.severity === "critical" && (
                            <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 animate-ping rounded-full bg-[oklch(0.65_0.2_25)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* day axis labels */}
          <div className="mt-3 grid grid-cols-[120px_1fr] gap-3 sm:grid-cols-[160px_1fr]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--shield-text-dim)]">
              Day axis
            </div>
            <div className="relative h-4 text-[10px] text-[var(--shield-text-dim)]">
              {[
                { d: -30, l: "−30d" },
                { d: 0, l: "Today" },
                { d: 30, l: "+30d" },
                { d: 90, l: "+90d" },
                { d: 180, l: "+6mo" },
                { d: 365, l: "+1yr" },
              ].map((t) => {
                const pct = ((t.d - minDay) / span) * 100;
                if (pct < 2 || pct > 98) return null;
                const isToday = t.d === 0;
                return (
                  <span
                    key={t.d}
                    className={`absolute -translate-x-1/2 ${
                      isToday ? "font-semibold text-[oklch(0.85_0.19_158)]" : ""
                    }`}
                    style={{ left: `${pct}%` }}
                  >
                    {t.l}
                  </span>
                );
              })}
            </div>
          </div>

          {/* detail popover */}
          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mt-5 overflow-hidden rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.85)] p-4 backdrop-blur"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                        SEVERITY_STYLE[active.severity].ring
                      } ring-1`}
                    >
                      <SeverityIcon severity={active.severity} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[var(--shield-text)]">
                          {active.label}
                        </h4>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            SEVERITY_STYLE[active.severity].text
                          } border-current bg-[oklch(0.14_0.018_165)/0.6)]`}
                        >
                          {SEVERITY_STYLE[active.severity].label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--shield-text-dim)]">
                        <span className={ACCENT_MAP[PHASES_ACCENT[active.phase]].text}>
                          {PHASE_NAME[active.phase]}
                        </span>
                        {active.group && <span>· {active.group}</span>}
                        <span>
                          ·{" "}
                          {active.day < 0
                            ? `${Math.abs(active.day)} days ago`
                            : active.day === 0
                              ? "Today"
                              : `In ${active.day} days`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* agent cue */}
                  <div className="flex items-center gap-1.5 rounded-full border border-[oklch(0.74_0.17_162/0.35)] bg-[oklch(0.74_0.17_162/0.08)] px-2.5 py-1 text-[10px] font-medium text-[oklch(0.85_0.19_158)]">
                    <Zap className="h-3 w-3" />
                    {active.severity === "done"
                      ? "Logged by agent"
                      : active.severity === "critical"
                        ? "Agent nudged you"
                        : "Agent watching"}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* count summary */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--shield-border)] pt-4 sm:grid-cols-4">
            {(
              [
                { k: "done", icon: CheckCircle2, label: "Completed" },
                { k: "info", icon: Info, label: "Upcoming" },
                { k: "warning", icon: AlertTriangle, label: "Action needed" },
                { k: "critical", icon: CalendarClock, label: "Critical" },
              ] as const
            ).map((s) => {
              const count = visible.filter((d) => d.severity === s.k).length;
              const Icon = s.icon;
              return (
                <div
                  key={s.k}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-3 py-2.5"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${SEVERITY_STYLE[s.k].dot} bg-opacity-20`}
                  >
                    <Icon className="h-3.5 w-3.5 text-[oklch(0.14_0.018_165))]" />
                  </span>
                  <div>
                    <div className="text-lg font-semibold text-[var(--shield-text)]">
                      {count}
                    </div>
                    <div className="text-[10px] text-[var(--shield-text-dim)]">
                      {s.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SeverityIcon({ severity }: { severity: Deadline["severity"] }) {
  const cls = "h-4 w-4";
  if (severity === "done") return <CheckCircle2 className={`${cls} text-[oklch(0.65_0.02_200)]`} />;
  if (severity === "info") return <Info className={`${cls} text-[oklch(0.85_0.19_158)]`} />;
  if (severity === "warning") return <AlertTriangle className={`${cls} text-[oklch(0.86_0.17_80)]`} />;
  return <CalendarClock className={`${cls} text-[oklch(0.72_0.2_25)]`} />;
}

function FilterChip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: "emerald" | "amber" | "violet" | "cyan";
}) {
  const accentDot = accent ? ACCENT_MAP[accent].dot : "bg-[oklch(0.74_0.17_162)]";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165))]"
          : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
      }`}
    >
      {accent && <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[oklch(0.14_0.018_165))]" : accentDot}`} />}
      {children}
    </button>
  );
}
