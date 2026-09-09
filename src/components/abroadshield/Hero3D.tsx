"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { HERO_STRINGS, type LocaleId } from "./data";

interface PersonaScenario {
  id: string;
  destination: string;
  flag: string;
  course: string;
  university: string;
  intent: string;
  statutoryLimit: string;
  legalArticle: string;
  opportunity: {
    title: string;
    company: string;
    location: string;
    contract: string;
    matchScore: number;
    reasons: string[];
    statutoryBadge: string;
  };
}

const SCENARIOS: PersonaScenario[] = [
  {
    id: "paris",
    destination: "Paris, France",
    flag: "🇫🇷",
    course: "MSc Computer Science & AI",
    university: "Télécom Paris / IP Paris",
    intent: "Find 6-month AI internships in Paris compliant with student visa caps.",
    statutoryLimit: "Max 964h/year permitted (60% annual duration)",
    legalArticle: "Code du travail · Art. R5221-26",
    opportunity: {
      title: "Deep Learning & Computer Vision Intern",
      company: "Mistral AI Partner Lab",
      location: "Paris (13e) · Station F",
      contract: "Convention de Stage · 6 Months",
      matchScore: 96,
      reasons: ["Direct course fit (AI/PyTorch)", "Within 964h visa cap", "Station F Paris hub"],
      statutoryBadge: "Statutory 964h/yr Check: Verified Safe",
    },
  },
  {
    id: "london",
    destination: "London, UK",
    flag: "🇬🇧",
    course: "MSc Quantitative Finance",
    university: "Imperial College London",
    intent: "Target off-cycle finance internships eligible for Graduate Route.",
    statutoryLimit: "Max 20h/week during term time",
    legalArticle: "UKVI Student Sponsor Guidance · App. ST",
    opportunity: {
      title: "Quantitative Research Analyst Intern",
      company: "Canary Wharf Algorithmic Desk",
      location: "London · Canary Wharf (E14)",
      contract: "Off-cycle Internship · 16 Weeks",
      matchScore: 94,
      reasons: ["MSc Quant fit", "20h/wk term-time compliant", "Graduate Route sponsorship path"],
      statutoryBadge: "UKVI 20h/week Limit: Verified Safe",
    },
  },
  {
    id: "berlin",
    destination: "Berlin, Germany",
    flag: "🇩🇪",
    course: "MSc Software Systems",
    university: "TU Berlin",
    intent: "Search Werkstudent developer roles under 120-day rule.",
    statutoryLimit: "120 full days or 240 half days per calendar year",
    legalArticle: "Aufenthaltsgesetz · § 16b Abs. 3",
    opportunity: {
      title: "Werkstudent Cloud Backend Engineer",
      company: "Zalando Tech Hub",
      location: "Berlin · Friedrichshain",
      contract: "Werkstudent (20h/wk) · Ongoing",
      matchScore: 93,
      reasons: ["Go/Distributed systems match", "120-day rule tracked", "Berlin transit zone A/B"],
      statutoryBadge: "AufenthG 120-Day Limit: Verified Safe",
    },
  },
];

export default function Hero3D({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [locale, setLocale] = useState<LocaleId>("en");
  const [activeScenarioId, setActiveScenarioId] = useState<string>("paris");
  const [savedSim, setSavedSim] = useState<boolean>(false);
  const [prepSim, setPrepSim] = useState<boolean>(false);

  const t = HERO_STRINGS[locale] || HERO_STRINGS.en;
  const currentScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  const handleScenarioChange = (id: string) => {
    setActiveScenarioId(id);
    setSavedSim(false);
    setPrepSim(false);
  };

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-[var(--shield-border)] bg-[var(--shield-ink)] pt-16 sm:pt-20"
    >
      {/* Background Ambience */}
      <div aria-hidden className="pointer-events-none absolute inset-0 as-bg-grid opacity-35" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[70rem] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.76_0.18_160/0.14),transparent_70%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between py-6">
          <div className="as-public-eyebrow">
            <span className="h-2 w-2 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
            <span>AbroadShield AI · Autonomous Student Co-Pilot</span>
          </div>
          <LanguageToggle locale={locale} onChange={setLocale} />
        </div>

        {/* Main Grid: Editorial Message + Live Interactive Co-Pilot Console */}
        <div className="grid items-center gap-10 pb-16 pt-4 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:pb-24 lg:pt-6">
          {/* Left Column: Vision & Action */}
          <div className="max-w-[580px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.08)] px-3 py-1 text-[11px] font-semibold tracking-wide text-[oklch(0.87_0.19_155)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen AI for Life Abroad</span>
            </div>

            <h1 className="as-public-title mt-5 text-[clamp(2.5rem,5.2vw,4.4rem)]">
              The AI co-pilot <br />
              that understands <br />
              <span className="as-text-gradient">your life abroad.</span>
            </h1>

            <p className="as-public-copy mt-6 text-balance text-base sm:text-lg">
              Not another administrative portal or generic chatbot. AbroadShield continuously models your visa regulations, course constraints, living budget, and career goals into a unified operating intelligence.
            </p>

            {/* Interactive Persona / Journey Switcher */}
            <div className="mt-7">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--shield-text-faint)]">
                Live Interactive Demonstration · Select Destination Route:
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SCENARIOS.map((scenario) => {
                  const active = scenario.id === activeScenarioId;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => handleScenarioChange(scenario.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "border-[oklch(0.76_0.18_160/0.8)] bg-[oklch(0.76_0.18_160/0.18)] text-[var(--shield-text)] shadow-[0_0_20px_-5px_oklch(0.76_0.18_160/0.4)]"
                          : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text-dim)] hover:border-[var(--shield-border-strong)] hover:text-white"
                      }`}
                    >
                      <span>{scenario.flag}</span>
                      <span>{scenario.destination}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct CTA Group */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate?.("agent")}
                className="as-public-button-primary group rounded-full px-6 py-3.5 text-sm font-bold shadow-2xl"
              >
                <Zap className="h-4 w-4 fill-current text-black" />
                <span>Launch Agent Co-Pilot</span>
                <ArrowRight className="h-4 w-4 text-black transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.("journey")}
                className="as-public-button-secondary rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                <span>Explore 8-Stage Life Vector</span>
              </button>
            </div>

            {/* High-Trust Guarantee Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--shield-border)] pt-5 text-[11px] text-[var(--shield-text-faint)]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                <span>Deterministic statutory rules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                <span>Zero fabricated jobs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                <span>Human approval required for actions</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Co-Pilot Console */}
          <div className="relative">
            {/* Console Frame */}
            <div className="as-dock relative overflow-hidden rounded-3xl p-5 shadow-2xl sm:p-6">
              {/* Scanline Effect */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[oklch(0.76_0.18_160/0.06)] to-transparent as-scanline" />

              {/* Console Header */}
              <div className="flex items-center justify-between border-b border-[var(--shield-border)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[oklch(0.76_0.18_160/0.15)] text-[var(--shield-emerald-bright)]">
                    <BrainCircuit className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--shield-text)]">
                      AbroadShield Intelligence Terminal
                    </div>
                    <div className="text-[10px] font-mono text-[var(--shield-text-faint)]">
                      L1 Autonomous Co-Pilot Core · Online
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.1)] px-2.5 py-1 text-[10px] font-mono font-semibold text-[var(--shield-emerald-bright)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
                  LIVE REASONING
                </div>
              </div>

              {/* Dynamic Content Animated per Persona */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScenario.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 space-y-4"
                >
                  {/* Student Input Bubble */}
                  <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.12_0.015_255/0.8)] p-3.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--shield-text-faint)]">
                      <span>STUDENT CONTEXT &amp; REQUEST</span>
                      <span>{currentScenario.university}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-[var(--shield-text)]">
                      “{currentScenario.intent}”
                    </p>
                  </div>

                  {/* Agent Reasoning & Statutory Layer */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-3">
                      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Statutory Limit</span>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[var(--shield-text)]">
                        {currentScenario.statutoryLimit}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--shield-text-faint)]">
                        {currentScenario.legalArticle}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-3">
                      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--shield-cyan)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Context Fit</span>
                      </div>
                      <div className="mt-1 text-xs font-semibold text-[var(--shield-text)]">
                        {currentScenario.opportunity.matchScore}% Match Score
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--shield-text-faint)]">
                        Course relevance &amp; local transit
                      </div>
                    </div>
                  </div>

                  {/* Live Synthesized Opportunity Card */}
                  <div className="rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[linear-gradient(180deg,oklch(0.18_0.022_255/0.9),oklch(0.13_0.018_255/0.95))] p-4 shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.76_0.18_160/0.15)] px-2 py-0.5 text-[10px] font-semibold text-[var(--shield-emerald-bright)]">
                          <span>★ {currentScenario.opportunity.matchScore}% Strong Context Fit</span>
                        </div>
                        <h3 className="mt-2 text-sm font-bold text-white">
                          {currentScenario.opportunity.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--shield-text-dim)]">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-[var(--shield-emerald-bright)]" />
                            {currentScenario.opportunity.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-amber-400/80" />
                            {currentScenario.opportunity.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-sky-400" />
                            {currentScenario.opportunity.contract}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {currentScenario.opportunity.reasons.map((reason, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-[oklch(0.76_0.18_160/0.25)] bg-[oklch(0.76_0.18_160/0.08)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.87_0.19_155)]"
                        >
                          ✓ {reason}
                        </span>
                      ))}
                    </div>

                    {/* Statutory Guarantee Badge */}
                    <div className="mt-3 rounded-lg border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.1)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--shield-emerald-bright)]">
                      <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />
                      {currentScenario.opportunity.statutoryBadge}
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--shield-border)] pt-3">
                      <button
                        type="button"
                        onClick={() => setSavedSim(!savedSim)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          savedSim
                            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                            : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text)] hover:border-[var(--shield-border-strong)]"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{savedSim ? "Saved to Journey" : "Save to Journey"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrepSim(!prepSim)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          prepSim
                            ? "border-[oklch(0.76_0.18_160/0.8)] bg-[oklch(0.76_0.18_160/0.3)] text-white"
                            : "border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[oklch(0.87_0.19_155)] hover:bg-[oklch(0.76_0.18_160/0.2)]"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{prepSim ? "Application Plan Ready" : "Prepare Application"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigate?.("agent")}
                        className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-[var(--shield-text-dim)] hover:text-white"
                      >
                        <span>Open in Agent</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Expandable Preparation Drawer in Hero */}
                    {prepSim && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-3 text-xs"
                      >
                        <div className="font-semibold text-white">AbroadShield Tailoring Roadmap:</div>
                        <ul className="mt-1.5 space-y-1 text-[11px] text-[var(--shield-text-dim)]">
                          <li>• French/EU standard CV format (No US-style objective section).</li>
                          <li>• Highlighted course modules: Machine Learning &amp; Algorithm Optimization.</li>
                          <li>• Auto-included student visa work authorization clause (Article R5221-26).</li>
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
