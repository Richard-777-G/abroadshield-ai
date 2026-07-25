"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  Landmark,
  Briefcase,
  CalendarClock,
  HeartPulse,
  Building2,
  Check,
  GitCompare,
  Eye,
} from "lucide-react";
import { COUNTRIES, type CountryRule } from "./data";
import Reveal from "./Reveal";

type Mode = "single" | "compare";

const FIELDS: { label: string; key: keyof CountryRule; icon: typeof Landmark }[] = [
  { label: "Student visa", key: "studentVisa", icon: Landmark },
  { label: "Work-hour cap", key: "workCap", icon: Briefcase },
  { label: "Post-study window", key: "postStudyWindow", icon: CalendarClock },
  { label: "Registration", key: "registration", icon: Building2 },
  { label: "Insurance", key: "insurance", icon: HeartPulse },
  { label: "Bank account", key: "bankAccount", icon: Building2 },
];

export default function CountryRules() {
  const [mode, setMode] = useState<Mode>("single");
  const [activeIdx, setActiveIdx] = useState(0);
  const [compareA, setCompareA] = useState(0);
  const [compareB, setCompareB] = useState(4); // UK vs Germany by default

  const active = COUNTRIES[activeIdx];
  const countryA = COUNTRIES[compareA];
  const countryB = COUNTRIES[compareB];

  return (
    <section className="relative w-full bg-transparent py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.13_210/0.35)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* left: pitch + selector */}
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.82_0.13_210)]">
              <span className="h-px w-8 bg-[oklch(0.74_0.13_210/0.5)]" />
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
              worse than a missing one when visa-rejection stakes are real.
            </p>

            {/* mode toggle */}
            <div className="mt-7 inline-flex rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-1">
              <button
                onClick={() => setMode("single")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  mode === "single"
                    ? "bg-[oklch(0.74_0.13_210)] text-[oklch(0.14_0.018_165)]"
                    : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Single
              </button>
              <button
                onClick={() => setMode("compare")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  mode === "compare"
                    ? "bg-[oklch(0.74_0.13_210)] text-[oklch(0.14_0.018_165)]"
                    : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare
              </button>
            </div>

            {/* country selector — single or two-column for compare */}
            {mode === "single" ? (
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COUNTRIES.map((c, i) => (
                  <button
                    key={c.country}
                    onClick={() => setActiveIdx(i)}
                    className={`as-card-hover group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left ${
                      i === activeIdx
                        ? "border-[oklch(0.74_0.13_210/0.5)] bg-[oklch(0.74_0.13_210/0.1)] as-ring-glow"
                        : "border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)]"
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
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
                    Country A
                  </div>
                  <select
                    value={compareA}
                    onChange={(e) => setCompareA(Number(e.target.value))}
                    className="w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.6)] px-4 py-2.5 text-sm font-medium text-[var(--shield-text)] focus:border-[oklch(0.74_0.13_210/0.5)] focus:outline-none"
                  >
                    {COUNTRIES.map((c, i) => (
                      <option key={c.country} value={i} className="bg-[oklch(0.18_0.022_165)]">
                        {c.flag} {c.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.86_0.17_80)]">
                    Country B
                  </div>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(Number(e.target.value))}
                    className="w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.6)] px-4 py-2.5 text-sm font-medium text-[var(--shield-text)] focus:border-[oklch(0.8_0.15_80/0.5)] focus:outline-none"
                  >
                    {COUNTRIES.map((c, i) => (
                      <option key={c.country} value={i} className="bg-[oklch(0.18_0.022_165)]">
                        {c.flag} {c.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </Reveal>

          {/* right: detail or comparison */}
          <Reveal delay={0.15} className="relative">
            <AnimatePresence mode="wait">
              {mode === "single" ? (
                <motion.div
                  key={`single-${active.country}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden rounded-3xl border border-[oklch(0.74_0.13_210/0.35)] as-glass-strong"
                >
                  {/* header */}
                  <div className="relative flex items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-6 py-5">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[oklch(0.74_0.13_210/0.18)] blur-2xl" />
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
                    <span className="rounded-full border border-[oklch(0.74_0.13_210/0.4)] bg-[oklch(0.74_0.13_210/0.1)] px-3 py-1 text-xs font-semibold text-[oklch(0.82_0.13_210)]">
                      {active.currency}
                    </span>
                  </div>

                  {/* fields grid */}
                  <div className="grid gap-px overflow-hidden sm:grid-cols-2">
                    {FIELDS.map((f) => {
                      const Icon = f.icon;
                      return (
                        <div
                          key={f.label}
                          className="bg-[oklch(0.22_0.025_165/0.4)] px-5 py-4"
                        >
                          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-[var(--shield-text-dim)]">
                            <Icon className="h-3.5 w-3.5 text-[oklch(0.82_0.13_210)]" />
                            {f.label}
                          </div>
                          <div className="mt-1.5 text-sm font-medium leading-snug text-[var(--shield-text)]">
                            {active[f.key] as string}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* highlights */}
                  <div className="border-t border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/0.5)] px-6 py-5">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
                      <Check className="h-3.5 w-3.5" />
                      What the agent will flag for you
                    </div>
                    <ul className="space-y-2">
                      {active.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2.5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-3 py-2.5 text-sm text-[var(--shield-text)]"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.74_0.13_210)]" />
                          <span className="leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`compare-${compareA}-${compareB}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden rounded-3xl border border-[var(--shield-border)] as-glass-strong"
                >
                  {/* compare header — two flags side by side */}
                  <div className="grid grid-cols-2 border-b border-[var(--shield-border)]">
                    <div className="relative border-r border-[var(--shield-border)] bg-[oklch(0.74_0.13_210/0.08)] px-6 py-5">
                      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[oklch(0.74_0.13_210/0.15)] blur-2xl" />
                      <div className="relative flex items-center gap-3">
                        <span className="text-3xl">{countryA.flag}</span>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
                            Country A
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--shield-text)]">
                            {countryA.country}
                          </h3>
                          <div className="text-[11px] text-[var(--shield-text-dim)]">
                            {countryA.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="relative bg-[oklch(0.8_0.15_80/0.08)] px-6 py-5">
                      <div className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[oklch(0.8_0.15_80/0.15)] blur-2xl" />
                      <div className="relative flex items-center gap-3">
                        <span className="text-3xl">{countryB.flag}</span>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.86_0.17_80)]">
                            Country B
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--shield-text)]">
                            {countryB.country}
                          </h3>
                          <div className="text-[11px] text-[var(--shield-text-dim)]">
                            {countryB.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* comparison rows */}
                  <div className="divide-y divide-[var(--shield-border)]">
                    {FIELDS.map((f) => {
                      const Icon = f.icon;
                      const valA = countryA[f.key] as string;
                      const valB = countryB[f.key] as string;
                      const same = valA === valB;
                      return (
                        <div key={f.label} className="grid grid-cols-[auto_1fr_1fr] items-stretch">
                          {/* field label */}
                          <div className="flex items-center gap-2 border-r border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-4 py-3.5">
                            <Icon className="h-3.5 w-3.5 shrink-0 text-[oklch(0.82_0.13_210)]" />
                            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--shield-text-dim)]">
                              {f.label}
                            </span>
                          </div>
                          {/* value A */}
                          <div className="border-r border-[var(--shield-border)] px-4 py-3.5 text-xs leading-snug text-[var(--shield-text)]">
                            {valA}
                          </div>
                          {/* value B */}
                          <div className="px-4 py-3.5 text-xs leading-snug text-[var(--shield-text)]">
                            {valB}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* comparison summary + best-for recommendation */}
                  <div className="border-t border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/0.5)] px-6 py-5">
                    {compareA === compareB ? (
                      <div className="flex items-center gap-2 text-[11px] text-[var(--shield-text-dim)]">
                        <GitCompare className="h-3.5 w-3.5 text-[oklch(0.82_0.13_210)]" />
                        <span>Pick two different countries to compare.</span>
                      </div>
                    ) : (
                      <CompareRecommendation a={countryA} b={countryB} idxA={compareA} idxB={compareB} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Compare recommendation — analyses two countries across key student
 * priorities and surfaces a "best for" verdict per dimension plus an
 * overall recommendation.
 */
function CompareRecommendation({
  a,
  b,
}: {
  a: CountryRule;
  b: CountryRule;
  idxA: number;
  idxB: number;
}) {
  // Extract numeric work-hour caps (e.g. "20 hrs/week" → 20, "48 hrs/fortnight" → 24/week)
  const extractWeekHours = (s: string): number => {
    const fort = s.match(/(\d+)\s*hrs?\/fortnight/i);
    if (fort) return Number(fort[1]) / 2;
    const week = s.match(/(\d+)\s*hrs?\/week/i);
    if (week) return Number(week[1]);
    const day = s.match(/(\d+)\s*full-days/i);
    if (day) return Number(day[1]) * 8 / 7; // approx weekly
    return 0;
  };
  // Extract post-study window in months (e.g. "2 years" → 24, "18 months" → 18)
  const extractMonths = (s: string): number => {
    const yr = s.match(/(\d+)\s*yr/i);
    if (yr) return Number(yr[1]) * 12;
    const mo = s.match(/(\d+)\s*month/i);
    if (mo) return Number(mo[1]);
    return 0;
  };

  const hoursA = extractWeekHours(a.workCap);
  const hoursB = extractWeekHours(b.workCap);
  const postA = extractMonths(a.postStudyWindow);
  const postB = extractMonths(b.postStudyWindow);
  // Registration speed — fewer days = faster = better
  const regDaysA = (a.registration.match(/(\d+)\s*days?/i) || [, 99])[1] as number;
  const regDaysB = (b.registration.match(/(\d+)\s*days?/i) || [, 99])[1] as number;

  const dims: {
    label: string;
    winner: "a" | "b" | "tie";
    reason: string;
  }[] = [
    {
      label: "Part-time work hours",
      winner: hoursA > hoursB ? "a" : hoursB > hoursA ? "b" : "tie",
      reason:
        hoursA === hoursB
          ? "Same cap"
          : `${Math.max(hoursA, hoursB)} hrs/wk vs ${Math.min(hoursA, hoursB)}`,
    },
    {
      label: "Post-study window",
      winner: postA > postB ? "a" : postB > postA ? "b" : "tie",
      reason:
        postA === postB
          ? "Same length"
          : `${Math.max(postA, postB)}mo vs ${Math.min(postA, postB)}mo`,
    },
    {
      label: "Registration speed",
      winner: regDaysA < regDaysB ? "a" : regDaysB < regDaysA ? "b" : "tie",
      reason:
        regDaysA === regDaysB
          ? "Same window"
          : `${Math.min(regDaysA, regDaysB)}d vs ${Math.max(regDaysA, regDaysB)}d`,
    },
  ];

  // Overall winner — count dimension wins
  const winsA = dims.filter((d) => d.winner === "a").length;
  const winsB = dims.filter((d) => d.winner === "b").length;
  const overall = winsA > winsB ? "a" : winsB > winsA ? "b" : "tie";

  const winnerName = overall === "a" ? a.country : overall === "b" ? b.country : null;

  return (
    <div className="space-y-4">
      {/* dimension breakdown */}
      <div className="space-y-2">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
          <GitCompare className="h-3.5 w-3.5" />
          Best for — dimension by dimension
        </div>
        {dims.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-3 py-2.5"
          >
            <span className="flex-1 text-xs font-medium text-[var(--shield-text)]">
              {d.label}
            </span>
            {d.winner === "a" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.74_0.13_210/0.4)] bg-[oklch(0.74_0.13_210/0.12)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.82_0.13_210)]">
                {a.flag} {a.country.split(" ")[0]} wins
              </span>
            )}
            {d.winner === "b" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.8_0.15_80/0.4)] bg-[oklch(0.8_0.15_80/0.12)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.86_0.17_80)]">
                {b.flag} {b.country.split(" ")[0]} wins
              </span>
            )}
            {d.winner === "tie" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-2 py-0.5 text-[10px] font-semibold text-[var(--shield-text-dim)]">
                Tie
              </span>
            )}
            <span className="text-[11px] text-[var(--shield-text-dim)]">{d.reason}</span>
          </div>
        ))}
      </div>

      {/* overall verdict */}
      <div className="rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)] p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.12)]">
            <Check className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)]">
              Agent verdict
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--shield-text)]">
              {winnerName ? (
                <>
                  <span className="font-semibold">{winnerName}</span> edges ahead on{" "}
                  {Math.max(winsA, winsB)} of {dims.length} dimensions. But the right pick
                  depends on your priority — the agent will tailor its recommendation to your
                  specific situation when you ask.
                </>
              ) : (
                <>
                  It&apos;s a tie across the board. The agent will break it down by your
                  specific priority (work hours vs post-study window vs registration speed)
                  when you ask.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
