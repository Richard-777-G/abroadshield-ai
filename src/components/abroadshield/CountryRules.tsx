"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, Landmark, Briefcase, CalendarClock, HeartPulse, Building2, Check } from "lucide-react";
import { COUNTRIES } from "./data";

export default function CountryRules() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = COUNTRIES[activeIdx];

  const fields = [
    { label: "Student visa", value: active.studentVisa, icon: Landmark },
    { label: "Work-hour cap", value: active.workCap, icon: Briefcase },
    { label: "Post-study window", value: active.postStudyWindow, icon: CalendarClock },
    { label: "Registration", value: active.registration, icon: Building2 },
    { label: "Insurance", value: active.insurance, icon: HeartPulse },
    { label: "Bank account", value: active.bankAccount, icon: Building2 },
  ];

  return (
    <section className="relative w-full bg-[var(--shield-ink)] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.75_0.13_210/0.35)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* left: pitch */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.82_0.13_210)]">
              <span className="h-px w-8 bg-[oklch(0.75_0.13_210/0.5)]" />
              Country-specific rules baked in
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
              It already knows{" "}
              <span className="text-[oklch(0.82_0.13_210)]">the rules.</span>
              <br />
              You never explain from scratch.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
              The milestone-template table — country → phase → required steps — is arguably
              the most valuable proprietary data the product owns. A wrong requirement is
              worse than a missing one when visa-rejection stakes are real. Pick a country
              to see what the agent already has memorized.
            </p>

            {/* country selector */}
            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {COUNTRIES.map((c, i) => (
                <button
                  key={c.country}
                  onClick={() => setActiveIdx(i)}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    i === activeIdx
                      ? "border-[oklch(0.75_0.13_210/0.5)] bg-[oklch(0.75_0.13_210/0.1)] as-ring-glow"
                      : "border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.4)] hover:border-[oklch(0.75_0.13_210/0.35)]"
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--shield-text)]">
                      {c.country}
                    </div>
                    <div className="text-[11px] text-[var(--shield-text-dim)]">
                      {c.currency}
                    </div>
                  </div>
                  {i === activeIdx && (
                    <Check className="ml-auto h-4 w-4 text-[oklch(0.82_0.13_210)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* right: rules detail */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.country}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-3xl border border-[oklch(0.75_0.13_210/0.35)] as-glass-strong"
              >
                {/* header */}
                <div className="relative flex items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.5)] px-6 py-5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[oklch(0.75_0.13_210/0.18)] blur-2xl" />
                  <div className="relative flex items-center gap-3">
                    <span className="text-3xl">{active.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-3.5 w-3.5 text-[oklch(0.82_0.13_210)]" />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
                          Destination profile
                        </span>
                      </div>
                      <h3 className="mt-0.5 text-xl font-semibold text-[var(--shield-text)]">
                        {active.country}
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full border border-[oklch(0.75_0.13_210/0.4)] bg-[oklch(0.75_0.13_210/0.1)] px-3 py-1 text-xs font-semibold text-[oklch(0.82_0.13_210)]">
                    {active.currency}
                  </span>
                </div>

                {/* fields grid */}
                <div className="grid gap-px overflow-hidden sm:grid-cols-2">
                  {fields.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.label}
                        className="bg-[oklch(0.2_0.03_220/0.4)] px-5 py-4"
                      >
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-[var(--shield-text-dim)]">
                          <Icon className="h-3.5 w-3.5 text-[oklch(0.82_0.13_210)]" />
                          {f.label}
                        </div>
                        <div className="mt-1.5 text-sm font-medium leading-snug text-[var(--shield-text)]">
                          {f.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* highlights */}
                <div className="border-t border-[var(--shield-border)] bg-[oklch(0.16_0.02_220/0.5)] px-6 py-5">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
                    <Check className="h-3.5 w-3.5" />
                    What the agent will flag for you
                  </div>
                  <ul className="space-y-2">
                    {active.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.2_0.03_220/0.4)] px-3 py-2.5 text-sm text-[var(--shield-text)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.75_0.13_210)]" />
                        <span className="leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
