"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, ChevronRight } from "lucide-react";
import { AGENT_FEED, ACCENT_MAP, PHASES, type PhaseId } from "./data";

const KIND_LABEL: Record<string, string> = {
  nudge: "Proactive nudge",
  draft: "Draft ready",
  check: "Gap-check",
  search: "Searching",
  alert: "Alert",
  submit: "Form queued",
};

const PHASE_NAME: Record<PhaseId, string> = {
  "pre-departure": "Pre-Departure",
  arrival: "Arrival",
  studying: "Studying & Part-Time",
  "job-success": "Job Success",
};

const PHASES_ACCENT: Record<PhaseId, "emerald" | "amber" | "violet" | "cyan"> = {
  "pre-departure": "emerald",
  arrival: "violet",
  studying: "amber",
  "job-success": "cyan",
};

export default function AgentActivityPanel() {
  // rotating "live" feed: cycle which item is highlighted as newest
  const [hot, setHot] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHot((h) => (h + 1) % AGENT_FEED.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const visible = AGENT_FEED.slice(0, 6);

  return (
    <section className="relative w-full bg-[var(--shield-ink)] py-20 sm:py-28">
      {/* top divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.15_165/0.4)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* left: pitch */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.78_0.16_70)]">
              <span className="h-px w-8 bg-[oklch(0.78_0.16_70/0.5)]" />
              Proactive, not reactive
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
              The agent{" "}
              <span className="as-text-gradient-amber">acts first.</span>
              <br />
              You approve, it sends.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
              It doesn&apos;t wait to be asked. It reviews a visa document before the
              appointment, not after a rejection. It flags a deadline while there&apos;s
              still time to act. It drafts the message a first-time traveler doesn&apos;t
              know how to write — ready for you to approve and send.
            </p>

            {/* agent status */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[oklch(0.72_0.15_165/0.35)] as-glass px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.72_0.15_165)] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.15_165)]" />
              </span>
              <div>
                <div className="text-sm font-semibold text-[var(--shield-text)]">
                  Agent online · watching 27 deadlines
                </div>
                <div className="text-xs text-[var(--shield-text-dim)]">
                  Last action 2 min ago · Next review in 14 min
                </div>
              </div>
            </div>

            {/* counter trio */}
            <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[var(--shield-border)]">
              {[
                { k: "5", v: "Drafts ready" },
                { k: "11", v: "Docs verified" },
                { k: "2", v: "Alerts today" },
              ].map((s) => (
                <div key={s.v} className="bg-[oklch(0.2_0.03_220/0.4)] px-3 py-4 text-center">
                  <div className="text-2xl font-semibold text-[oklch(0.82_0.16_165)]">
                    {s.k}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--shield-text-dim)]">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right: live feed */}
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                <Activity className="h-3.5 w-3.5 text-[oklch(0.72_0.15_165)]" />
                Live agent activity
              </div>
              <span className="text-xs text-[var(--shield-text-dim)]">
                Real-time · demo feed
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visible.map((item, idx) => {
                  const isHot = idx === hot;
                  const accent = ACCENT_MAP[PHASES_ACCENT[item.phase]];
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: isHot ? 1.0 : 0.985,
                      }}
                      transition={{ duration: 0.4, delay: idx * 0.04 }}
                      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur transition-colors ${
                        isHot
                          ? `as-glass-strong ${accent.border} ${accent.glow}`
                          : "as-glass border-[var(--shield-border)]"
                      }`}
                    >
                      {/* left rail accent */}
                      <div
                        className={`absolute inset-y-0 left-0 w-1 ${accent.dot} ${isHot ? "opacity-100" : "opacity-40"}`}
                      />
                      <div className="flex items-start gap-3 pl-2">
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${accent.bg} ${accent.border}`}
                        >
                          <Icon className={`h-4 w-4 ${accent.text}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                isHot
                                  ? `${accent.bg} ${accent.border} ${accent.text}`
                                  : "border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] text-[var(--shield-text-dim)]"
                              }`}
                            >
                              <Zap className="h-2.5 w-2.5" />
                              {KIND_LABEL[item.kind]}
                            </span>
                            <span className="text-[11px] text-[var(--shield-text-dim)]">
                              {item.time}
                            </span>
                          </div>
                          <div className="mt-1.5 text-sm font-medium text-[var(--shield-text)]">
                            {item.title}
                          </div>
                          <div className="mt-1 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                            {item.detail}
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--shield-text-dim)]">
                            <span className="opacity-60">Phase:</span>
                            <span className={accent.text}>
                              {PHASE_NAME[item.phase]}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`mt-1 h-4 w-4 shrink-0 transition ${
                            isHot ? accent.text : "text-[var(--shield-text-dim)] opacity-50"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* footer note */}
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--shield-border)] p-4 text-center">
              <p className="text-xs text-[var(--shield-text-dim)]">
                <span className="font-semibold text-[oklch(0.82_0.16_165)]">Human-in-the-loop:</span>{" "}
                the agent never sends a single thing on your behalf without your one-tap
                approval. It does the work — you stay in control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
