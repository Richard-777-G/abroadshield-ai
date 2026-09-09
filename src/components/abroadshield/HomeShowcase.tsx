"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  Home,
  Layers,
  Lock,
  Plane,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import Reveal from "./Reveal";

interface LifeStage {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  icon: typeof Compass;
  agentTask: string;
  statutoryRule: string;
  deliverables: string[];
}

const LIFE_STAGES: LifeStage[] = [
  {
    id: "dream",
    step: "01",
    title: "Dream",
    subtitle: "Global Orientation & ROI",
    icon: Compass,
    agentTask: "Evaluate tuition vs. post-study salary outcomes across France, UK, Germany and Canada.",
    statutoryRule: "Monitors international student visa quota caps and post-study work authorization changes.",
    deliverables: ["Destination comparison matrix", "Budget feasibility model", "Language immersion trajectory"],
  },
  {
    id: "decide",
    step: "02",
    title: "Decide",
    subtitle: "Course & University Fit",
    icon: GraduationCap,
    agentTask: "Match student academic background with certified Bologna-compliant European degrees.",
    statutoryRule: "Validates institution accreditation (RNCP levels in France, H+ Anabin in Germany).",
    deliverables: ["Course syllabus fit score", "Scholarship deadlines calendar", "Standardized test roadmap"],
  },
  {
    id: "prepare",
    step: "03",
    title: "Prepare",
    subtitle: "Visa, Funding & Biometrics",
    icon: FileCheck2,
    agentTask: "Sequence visa application checklist, financial sponsorship letters, and consular appointments.",
    statutoryRule: "Enforces statutory minimum living funds proof (€615/mo in France, £1,334/mo in London).",
    deliverables: ["Consular dossier audit", "Blocked account / AVI verification", "Accommodation certificate"],
  },
  {
    id: "arrive",
    step: "04",
    title: "Arrive",
    subtitle: "Border, SIM & Check-in",
    icon: Plane,
    agentTask: "Orchestrate 72-hour arrival checklist: border clearance, airport transfer, and local SIM activation.",
    statutoryRule: "Monitors validation deadline for VLS-TS visa within 3 months of arrival via Étrangers en France.",
    deliverables: ["Border document binder", "Transit & Navigo pass guide", "OFII medical check appointment"],
  },
  {
    id: "study",
    step: "05",
    title: "Study",
    subtitle: "Academic & Campus Life",
    icon: Layers,
    agentTask: "Track university academic calendar, exam periods, and official administrative requests.",
    statutoryRule: "Ensures course attendance thresholds required to maintain student residence permit validity.",
    deliverables: ["Campus portal sync", "Professor formal email drafts", "Study group collaboration"],
  },
  {
    id: "live",
    step: "06",
    title: "Live",
    subtitle: "CAF, CPAM & Banking",
    icon: Home,
    agentTask: "Guide monthly French CAF housing subsidy application and Ameli social security registration.",
    statutoryRule: "Prepares statutory attestations without claiming government submission until user signs.",
    deliverables: ["CAF dossier optimization", "CPAM Carte Vitale tracking", "French bank account setup"],
  },
  {
    id: "work",
    step: "07",
    title: "Work",
    subtitle: "Internships & Part-time",
    icon: Building2,
    agentTask: "Search verified opportunities via official gateways (France Travail / 1jeune1solution).",
    statutoryRule: "Enforces strict 964h/year legal work ceiling; flags employer convention de stage requirements.",
    deliverables: ["CV tailored to European standards", "Legally compliant application plan", "Work-permit verification"],
  },
  {
    id: "build",
    step: "08",
    title: "Build the Future",
    subtitle: "Post-Study Visas & Careers",
    icon: TrendingUp,
    agentTask: "Formulate transition strategy from student permit to post-study work authorization (APS/RECE).",
    statutoryRule: "Calculates salary minimums for Talent Passport / EU Blue Card conversion.",
    deliverables: ["Post-study visa timeline", "Full-time employer target list", "Permanent residence roadmap"],
  },
];

const LIFE_360_PILLARS = [
  {
    title: "Statutory & Immigration",
    icon: Scale,
    desc: "Deterministic policy engine enforcing primary immigration law (Code du travail, AufenthG, UKVI rules).",
    badge: "100% Deterministic",
  },
  {
    title: "Verified Opportunity Engine",
    icon: Building2,
    desc: "Direct integration with public employment gateways (France Travail). Never fabricates job postings.",
    badge: "L1 Discovery",
  },
  {
    title: "Local Life & Subsidies",
    icon: HeartHandshake,
    desc: "Navigates local administration: CAF housing allowance, CPAM healthcare, and French student banking.",
    badge: "360° Life Support",
  },
  {
    title: "Human Approval Gate",
    icon: Lock,
    desc: "Outbound emails and formal applications always pause for your explicit review and cryptographic confirmation.",
    badge: "Controlled Action",
  },
];

export default function HomeShowcase({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [selectedStageId, setSelectedStageId] = useState<string>("work");
  const currentStage = LIFE_STAGES.find((s) => s.id === selectedStageId) || LIFE_STAGES[6];

  return (
    <div className="relative w-full bg-[var(--shield-ink)]">
      {/* SECTION 1: The 8-Stage Life Vector */}
      <section className="as-public-section">
        <div className="as-public-container">
          <Reveal className="max-w-3xl">
            <div className="as-public-eyebrow">
              <Compass className="h-3.5 w-3.5" />
              <span>Continuous Student Journey Vector</span>
            </div>
            <h2 className="as-public-title mt-3 text-3xl sm:text-4xl lg:text-5xl">
              One co-pilot for the entire <br />
              <span className="as-text-gradient">international student lifecycle.</span>
            </h2>
            <p className="as-public-copy mt-4 max-w-2xl">
              Students juggle 10 fragmented platforms: spreadsheets, visa portals, job boards, bank portals, and immigration forums. AbroadShield connects every phase into a continuous AI relationship.
            </p>
          </Reveal>

          {/* Interactive 8-Stage Life Vector Scrubber */}
          <div className="mt-10">
            {/* Stage Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 as-scroll">
              {LIFE_STAGES.map((stage) => {
                const active = stage.id === selectedStageId;
                const Icon = stage.icon;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`group flex min-w-[130px] flex-1 flex-col rounded-2xl border p-3.5 text-left transition ${
                      active
                        ? "border-[oklch(0.76_0.18_160/0.8)] bg-[oklch(0.76_0.18_160/0.14)] shadow-[0_10px_25px_-10px_oklch(0.76_0.18_160/0.4)]"
                        : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] hover:border-[var(--shield-border-strong)] hover:bg-[oklch(0.18_0.02_255/0.6)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold ${
                          active ? "text-[var(--shield-emerald-bright)]" : "text-[var(--shield-text-faint)]"
                        }`}
                      >
                        {stage.step}
                      </span>
                      <Icon
                        className={`h-4 w-4 ${
                          active ? "text-[var(--shield-emerald-bright)]" : "text-[var(--shield-text-faint)]"
                        }`}
                      />
                    </div>
                    <div className="mt-3 text-xs font-bold text-white">{stage.title}</div>
                    <div className="mt-0.5 truncate text-[10px] text-[var(--shield-text-dim)]">
                      {stage.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Detailed Interactive Showcase Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 rounded-3xl border border-[var(--shield-border)] bg-[linear-gradient(180deg,oklch(0.16_0.02_255/0.95),oklch(0.12_0.015_255/0.98))] p-6 shadow-2xl sm:p-8"
              >
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.1)] px-3 py-1 text-xs font-mono font-semibold text-[var(--shield-emerald-bright)]">
                      <span>PHASE {currentStage.step} // {currentStage.title.toUpperCase()}</span>
                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                      {currentStage.subtitle}
                    </h3>

                    <div className="mt-5 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                        <Bot className="h-4 w-4" />
                        <span>Autonomous Agent Execution</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white">
                        {currentStage.agentTask}
                      </p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[oklch(0.82_0.16_75/0.3)] bg-[oklch(0.82_0.16_75/0.06)] p-4">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--shield-amber-bright)]">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Statutory Guardrail &amp; Compliance Check</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                        {currentStage.statutoryRule}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6">
                    <div>
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--shield-text-faint)]">
                        Tangible Student Outcomes &amp; Artifacts
                      </div>
                      <ul className="mt-4 space-y-3">
                        {currentStage.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.76_0.18_160/0.15)] text-[var(--shield-emerald-bright)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-xs font-medium text-white sm:text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 border-t border-[var(--shield-border)] pt-5">
                      <button
                        type="button"
                        onClick={() => onNavigate?.("agent")}
                        className="as-public-button-primary w-full rounded-xl py-2.5 text-xs font-bold"
                      >
                        <span>Execute {currentStage.title} in Agent</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 2: 360° Life Architecture Matrix */}
      <section className="as-public-section">
        <div className="as-public-container">
          <Reveal className="max-w-3xl">
            <div className="as-public-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              <span>360° Ecosystem Architecture</span>
            </div>
            <h2 className="as-public-title mt-3 text-3xl sm:text-4xl lg:text-5xl">
              Engineered for reality, <br />
              <span className="as-text-gradient">not just chatbots.</span>
            </h2>
            <p className="as-public-copy mt-4 max-w-2xl">
              Immigration and student livelihoods cannot tolerate hallucinations. AbroadShield separates conversational interaction from verified evidence and deterministic policy logic.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LIFE_360_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="as-public-card as-public-card--raised flex flex-col justify-between p-6 transition hover:-translate-y-1 hover:border-[oklch(0.76_0.18_160/0.4)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="as-public-icon">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="rounded-full border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.08)] px-2 py-0.5 text-[9px] font-mono font-semibold uppercase text-[var(--shield-emerald-bright)]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base font-bold text-white">{pillar.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[var(--shield-border)] pt-4 text-[10px] font-mono text-[var(--shield-text-faint)]">
                    // ABROADSHIELD CORE PILLAR {i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: The Reality-Checked Opportunity Engine */}
      <section className="as-public-section">
        <div className="as-public-container">
          <div className="rounded-3xl border border-[var(--shield-border)] bg-[linear-gradient(135deg,oklch(0.18_0.025_255/0.8),oklch(0.12_0.015_255/0.95))] p-7 shadow-2xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="as-public-eyebrow">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Real Opportunity Discovery · Zero Fabricated Postings</span>
                </div>
                <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  Official public gateways. <br />
                  <span className="as-text-gradient">Verified statutory limits.</span>
                </h3>
                <p className="as-public-copy mt-4 text-sm leading-relaxed">
                  Most student platforms scrape job boards and show stale or fictitious listings. AbroadShield connects directly to public employment APIs (like France Travail), validates every role against your visa’s working hours ceiling, and prepares tailored application dossiers.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
                  <span className="rounded-lg border border-[var(--shield-border)] bg-[var(--shield-ink)] px-3 py-1.5 text-white">
                    ✓ France Travail Gateway
                  </span>
                  <span className="rounded-lg border border-[var(--shield-border)] bg-[var(--shield-ink)] px-3 py-1.5 text-white">
                    ✓ 964h Annual Limit Checker
                  </span>
                  <span className="rounded-lg border border-[var(--shield-border)] bg-[var(--shield-ink)] px-3 py-1.5 text-white">
                    ✓ CV Standard Adapter
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.76_0.18_160/0.15)] text-[var(--shield-emerald-bright)]">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="mt-4 text-base font-bold text-white">
                  Experience AbroadShield Live
                </div>
                <p className="mt-1.5 text-xs text-[var(--shield-text-dim)]">
                  Open the private workspace to search real opportunities, check visa rules, and orchestrate your life abroad.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.("agent")}
                  className="as-public-button-primary mt-5 w-full rounded-xl py-3 text-xs font-bold shadow-lg"
                >
                  <span>Start with the AI Co-Pilot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
