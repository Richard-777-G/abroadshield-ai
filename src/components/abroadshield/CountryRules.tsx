"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  ExternalLink,
  GitCompare,
  Globe2,
  HeartPulse,
  Landmark,
  ListChecks,
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
  const [compareB, setCompareB] = useState(4);

  const active = COUNTRIES[activeIdx];
  const countryA = COUNTRIES[compareA];
  const countryB = COUNTRIES[compareB];

  return (
    <section className="relative w-full bg-transparent py-14 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--shield-emerald)]/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-12">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-emerald-bright)]">
              <Globe2 className="h-3.5 w-3.5" />
              Country intelligence
            </div>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl lg:text-[2.7rem] lg:leading-[1.08]">
              Compare the route before you commit to it.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--shield-text-dim)]">
              Explore country-specific study, work and settlement signals in one place. Use the official links below as the source of truth for high-stakes requirements.
            </p>

            <div className="mt-6 inline-flex rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)]/80 p-1" role="group" aria-label="Country intelligence mode">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50 ${
                  mode === "single"
                    ? "bg-[var(--shield-emerald)] text-[var(--shield-ink)]"
                    : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                }`}
                aria-pressed={mode === "single"}
              >
                <Globe2 className="h-3.5 w-3.5" />
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode("compare")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50 ${
                  mode === "compare"
                    ? "bg-[var(--shield-emerald)] text-[var(--shield-ink)]"
                    : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                }`}
                aria-pressed={mode === "compare"}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare
              </button>
            </div>

            {mode === "single" ? (
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COUNTRIES.map((country, index) => {
                  const selected = index === activeIdx;
                  return (
                    <button
                      key={country.country}
                      type="button"
                      onClick={() => setActiveIdx(index)}
                      aria-pressed={selected}
                      className={`group flex min-w-0 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50 ${
                        selected
                          ? "border-[var(--shield-emerald)]/35 bg-[var(--shield-emerald)]/10 shadow-[0_10px_32px_-22px_var(--shield-emerald)]"
                          : "border-[var(--shield-border)] bg-[var(--shield-ink-2)]/55 hover:border-[var(--shield-border-strong)] hover:bg-[var(--shield-ink-2)]"
                      }`}
                    >
                      <span className="text-xl leading-none" aria-hidden="true">{country.flag}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[var(--shield-text)]">{country.country}</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--shield-text-faint)]">{country.currency}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-[var(--shield-emerald-bright)]" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <CountrySelect label="Country A" value={compareA} onChange={setCompareA} accent="emerald" />
                <CountrySelect label="Country B" value={compareB} onChange={setCompareB} accent="warm" />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1} className="relative min-w-0">
            <AnimatePresence mode="wait">
              {mode === "single" ? (
                <motion.div
                  key={`single-${active.country}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-panel)] shadow-[0_28px_80px_-55px_black]"
                >
                  <div className="relative border-b border-[var(--shield-border)] px-5 py-5 sm:px-6">
                    <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[var(--shield-emerald)]/8 blur-3xl" />
                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-3xl leading-none" aria-hidden="true">{active.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-emerald-bright)]">
                            <Globe2 className="h-3.5 w-3.5" />
                            Destination profile
                          </div>
                          <h3 className="mt-1 truncate text-xl font-semibold text-[var(--shield-text)]">{active.country}</h3>
                        </div>
                      </div>
                      <span className="rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-[10px] font-semibold text-[var(--shield-text-dim)]">
                        {active.currency}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-px overflow-hidden bg-[var(--shield-border)] sm:grid-cols-2">
                    {FIELDS.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.label} className="bg-[var(--shield-ink-2)]/80 px-4 py-4 sm:px-5">
                          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shield-text-faint)]">
                            <Icon className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                            {field.label}
                          </div>
                          <div className="mt-1.5 text-sm font-medium leading-5 text-[var(--shield-text)]">{active[field.key] as string}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-[var(--shield-border)] px-5 py-5 sm:px-6">
                    <SectionLabel icon={<Check className="h-3.5 w-3.5" />}>Signals to verify for your route</SectionLabel>
                    <ul className="mt-3 grid gap-2">
                      {active.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-2.5 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)]/65 px-3 py-2.5 text-xs leading-5 text-[var(--shield-text)]">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--shield-emerald)]" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-px border-t border-[var(--shield-border)] bg-[var(--shield-border)] sm:grid-cols-4">
                    <Fact label="Avg tuition" value={active.avgTuition} />
                    <Fact label="Living cost" value={active.avgLivingCost} />
                    <Fact label="Language" value={active.language} />
                    <Fact label="Student cities" value={active.cities.length.toString()} />
                  </div>

                  <div className="border-t border-[var(--shield-border)] px-5 py-5 sm:px-6">
                    <SectionLabel icon={<Landmark className="h-3.5 w-3.5" />}>Official embassy &amp; government links</SectionLabel>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {active.embassyLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-w-0 items-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)]/65 px-3 py-2.5 text-xs text-[var(--shield-text)] transition hover:border-[var(--shield-emerald)]/35 hover:bg-[var(--shield-ink-2)] focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--shield-emerald-bright)]" />
                          <span className="min-w-0 flex-1 leading-5">{link.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--shield-text-faint)] transition group-hover:text-[var(--shield-emerald-bright)]" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--shield-border)] px-5 py-5 sm:px-6">
                    <SectionLabel icon={<ListChecks className="h-3.5 w-3.5" />} accent="warm">Pre-departure checklist</SectionLabel>
                    <div className="mt-3 space-y-1.5">
                      {active.checklist.map((checklistItem, index) => (
                        <div key={`${checklistItem.item}-${index}`} className="flex items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)]/55 px-3 py-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[var(--shield-emerald)]/25 bg-[var(--shield-emerald)]/8 text-[9px] font-semibold text-[var(--shield-emerald-bright)]">{index + 1}</span>
                          <span className="min-w-0 flex-1 text-xs leading-5 text-[var(--shield-text)]">{checklistItem.item}</span>
                          <span className="shrink-0 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--shield-text-faint)]">{checklistItem.phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`compare-${compareA}-${compareB}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-panel)] shadow-[0_28px_80px_-55px_black]"
                >
                  <div className="grid grid-cols-2 border-b border-[var(--shield-border)]">
                    <CompareHeader country={countryA} label="Country A" tone="emerald" />
                    <CompareHeader country={countryB} label="Country B" tone="warm" right />
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[620px] divide-y divide-[var(--shield-border)]">
                      {FIELDS.map((field) => {
                        const Icon = field.icon;
                        const valA = countryA[field.key] as string;
                        const valB = countryB[field.key] as string;
                        return (
                          <div key={field.label} className="grid grid-cols-[150px_1fr_1fr]">
                            <div className="flex items-center gap-2 bg-[var(--shield-ink-2)]/80 px-4 py-3.5">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--shield-emerald-bright)]" />
                              <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--shield-text-faint)]">{field.label}</span>
                            </div>
                            <div className="border-l border-[var(--shield-border)] px-4 py-3.5 text-xs leading-5 text-[var(--shield-text)]">{valA}</div>
                            <div className="border-l border-[var(--shield-border)] px-4 py-3.5 text-xs leading-5 text-[var(--shield-text)]">{valB}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[var(--shield-border)] px-5 py-5 sm:px-6">
                    {compareA === compareB ? (
                      <div className="flex items-center gap-2 text-xs text-[var(--shield-text-dim)]">
                        <GitCompare className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                        Pick two different countries to compare their route signals.
                      </div>
                    ) : (
                      <CompareRecommendation a={countryA} b={countryB} />
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

function CountrySelect({ label, value, onChange, accent }: { label: string; value: number; onChange: (value: number) => void; accent: "emerald" | "warm" }) {
  const accentClass = accent === "warm" ? "text-[var(--shield-amber-bright)]" : "text-[var(--shield-emerald-bright)]";
  return (
    <label className="block">
      <span className={`mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] ${accentClass}`}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3.5 py-2.5 text-xs font-semibold text-[var(--shield-text)] focus:outline-none focus:ring-2 focus:ring-[var(--shield-emerald)]/50"
      >
        {COUNTRIES.map((country, index) => (
          <option key={country.country} value={index}>{country.flag} {country.country}</option>
        ))}
      </select>
    </label>
  );
}

function CompareHeader({ country, label, tone, right = false }: { country: CountryRule; label: string; tone: "emerald" | "warm"; right?: boolean }) {
  const accentClass = tone === "warm" ? "text-[var(--shield-amber-bright)]" : "text-[var(--shield-emerald-bright)]";
  const bgClass = tone === "warm" ? "bg-[var(--shield-amber)]/5" : "bg-[var(--shield-emerald)]/5";
  return (
    <div className={`relative min-w-0 px-4 py-5 sm:px-6 ${bgClass} ${right ? "border-l border-[var(--shield-border)]" : ""}`}>
      <div className="relative flex min-w-0 items-center gap-3">
        <span className="text-2xl leading-none" aria-hidden="true">{country.flag}</span>
        <div className="min-w-0">
          <div className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${accentClass}`}>{label}</div>
          <h3 className="mt-1 truncate text-base font-semibold text-[var(--shield-text)] sm:text-lg">{country.country}</h3>
          <div className="mt-0.5 text-[10px] text-[var(--shield-text-faint)]">{country.currency}</div>
        </div>
      </div>
    </div>
  );
}

function CompareRecommendation({ a, b }: { a: CountryRule; b: CountryRule }) {
  const extractWeekHours = (value: string): number => {
    const fortnight = value.match(/(\d+)\s*hrs?\/fortnight/i);
    if (fortnight) return Number(fortnight[1]) / 2;
    const week = value.match(/(\d+)\s*hrs?\/week/i);
    if (week) return Number(week[1]);
    const days = value.match(/(\d+)\s*full-days/i);
    if (days) return Number(days[1]) * 8 / 7;
    return 0;
  };

  const extractMonths = (value: string): number => {
    const years = value.match(/(\d+)\s*yr/i);
    if (years) return Number(years[1]) * 12;
    const months = value.match(/(\d+)\s*month/i);
    if (months) return Number(months[1]);
    return 0;
  };

  const extractRegistrationDays = (value: string): number => Number((value.match(/(\d+)\s*days?/i) || [, "99"])[1]);

  const hoursA = extractWeekHours(a.workCap);
  const hoursB = extractWeekHours(b.workCap);
  const postA = extractMonths(a.postStudyWindow);
  const postB = extractMonths(b.postStudyWindow);
  const regDaysA = extractRegistrationDays(a.registration);
  const regDaysB = extractRegistrationDays(b.registration);

  const dimensions = [
    {
      label: "Part-time work hours",
      winner: hoursA > hoursB ? "a" : hoursB > hoursA ? "b" : "tie",
      reason: hoursA === hoursB ? "Same cap" : `${Math.max(hoursA, hoursB)} hrs/wk vs ${Math.min(hoursA, hoursB)}`,
    },
    {
      label: "Post-study window",
      winner: postA > postB ? "a" : postB > postA ? "b" : "tie",
      reason: postA === postB ? "Same length" : `${Math.max(postA, postB)}mo vs ${Math.min(postA, postB)}mo`,
    },
    {
      label: "Registration speed",
      winner: regDaysA < regDaysB ? "a" : regDaysB < regDaysA ? "b" : "tie",
      reason: regDaysA === regDaysB ? "Same window" : `${Math.min(regDaysA, regDaysB)}d vs ${Math.max(regDaysA, regDaysB)}d`,
    },
  ] as const;

  const winsA = dimensions.filter((dimension) => dimension.winner === "a").length;
  const winsB = dimensions.filter((dimension) => dimension.winner === "b").length;
  const winner = winsA > winsB ? a : winsB > winsA ? b : null;

  return (
    <div>
      <SectionLabel icon={<GitCompare className="h-3.5 w-3.5" />}>Comparison signals</SectionLabel>
      <div className="mt-3 space-y-2">
        {dimensions.map((dimension) => (
          <div key={dimension.label} className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)]/60 px-3 py-2.5">
            <span className="min-w-0 flex-1 text-xs font-medium text-[var(--shield-text)]">{dimension.label}</span>
            {dimension.winner === "a" && <Badge tone="emerald">{a.flag} {a.country.split(" ")[0]} leads</Badge>}
            {dimension.winner === "b" && <Badge tone="warm">{b.flag} {b.country.split(" ")[0]} leads</Badge>}
            {dimension.winner === "tie" && <Badge tone="neutral">Tie</Badge>}
            <span className="text-[10px] text-[var(--shield-text-faint)]">{dimension.reason}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl border border-[var(--shield-emerald)]/20 bg-[var(--shield-emerald)]/7 p-4">
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--shield-emerald-bright)]">Directional verdict</div>
        <p className="mt-1.5 text-xs leading-5 text-[var(--shield-text)]">
          {winner ? (
            <><span className="font-semibold">{winner.country}</span> leads on {Math.max(winsA, winsB)} of {dimensions.length} comparison signals. That is a directional comparison, not a personalised immigration or career recommendation.</>
          ) : (
            <>The selected signals are tied. Your priorities should determine which route deserves deeper research.</>
          )}
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ icon, children, accent = "emerald" }: { icon: React.ReactNode; children: React.ReactNode; accent?: "emerald" | "warm" }) {
  const color = accent === "warm" ? "text-[var(--shield-amber-bright)]" : "text-[var(--shield-emerald-bright)]";
  return <div className={`flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] ${color}`}>{icon}{children}</div>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "emerald" | "warm" | "neutral" }) {
  const classes = tone === "warm"
    ? "border-[var(--shield-amber)]/25 bg-[var(--shield-amber)]/8 text-[var(--shield-amber-bright)]"
    : tone === "emerald"
      ? "border-[var(--shield-emerald)]/25 bg-[var(--shield-emerald)]/8 text-[var(--shield-emerald-bright)]"
      : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text-dim)]";
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${classes}`}>{children}</span>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--shield-ink-2)]/75 px-4 py-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--shield-text-faint)]">{label}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-[var(--shield-text)]">{value}</div>
    </div>
  );
}
