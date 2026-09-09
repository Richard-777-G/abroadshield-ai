"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CheckCircle,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type { SavedOpportunityRecord } from "@/lib/abroadshield/opportunity-service";

type Tab = "jobs" | "network";

type Action = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: typeof Search;
};

const ACTIONS: Record<Tab, Action[]> = {
  jobs: [
    {
      id: "job-search",
      title: "Search Verified Target Roles",
      description: "Ask the agent to query official employment databases (France Travail) against your persistent journey profile and destination limits.",
      prompt: "Find internships in Paris related to my course compliant with student visa limits.",
      icon: Search,
    },
    {
      id: "job-fit",
      title: "Assess Opportunity Context Fit",
      description: "Paste a role description to evaluate statutory feasibility (e.g. 964h legal ceiling in France) and course relevance without fabricated experience.",
      prompt: "I want to assess an opportunity against my journey profile. I will paste the job description next.",
      icon: BriefcaseBusiness,
    },
    {
      id: "application-plan",
      title: "Prepare Tailored Application Dossier",
      description: "Build an application plan with European CV tailoring, convention de stage requirements, and draft emails for your approval.",
      prompt: "Prepare an application plan for my target internship. Include European CV formatting and visa work-authorization clauses.",
      icon: Building2,
    },
  ],
  network: [
    {
      id: "network-plan",
      title: "Build Strategic Outreach Sequence",
      description: "Turn your career target into a concrete professional outreach strategy, targeting university alumni and lab researchers.",
      prompt: "Build my professional networking sequence for the current journey stage. Prioritize target people, reasons to contact them, and evidence I should show.",
      icon: Network,
    },
    {
      id: "message-draft",
      title: "Draft Professional Contact Message",
      description: "Prepare an outreach draft based on your verified credentials. Sending is approval-gated and never executed without explicit signoff.",
      prompt: "Draft a concise professional outreach email to an alumni in my target field in Paris. Stop at the draft for my approval.",
      icon: Mail,
    },
    {
      id: "network-priority",
      title: "Identify Highest-Leverage Contact",
      description: "Reason from your current phase, study direction and career goals to determine the single highest-value connection to make this week.",
      prompt: "What is the single highest-value networking action I should take this week for my study abroad stage? Give me one concrete action.",
      icon: Users,
    },
  ],
};

export default function NetworkingJobs({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [tab, setTab] = useState<Tab>("jobs");
  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunityRecord[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const actions = useMemo(() => ACTIONS[tab], [tab]);

  const loadSavedOpportunities = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/abroadshield/opportunities/save", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.opportunities)) {
          setSavedOpportunities(data.opportunities);
        }
      }
    } catch {
      // Graceful fallback for offline or unauthenticated mode
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    void loadSavedOpportunities();
  }, []);

  const runInAgent = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("abroadshield:prefill-chat", { detail: prompt }));
    onNavigate?.("agent");
  };

  return (
    <section className="w-full pb-16">
      <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 lg:py-9">
        <header className="mb-8 border-b border-[var(--shield-border)] pb-6">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--shield-emerald-bright)]">
            <Activity className="h-3.5 w-3.5" />
            <span>Opportunities &amp; Career Work</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Turn your study move into career capital.
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-sm">
            Zero fabricated vacancies or simulated contacts. Every action below routes into the real agent execution engine using your persistent journey context.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="mb-8 inline-flex rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-1.5" role="tablist">
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={BriefcaseBusiness}>
            Jobs &amp; Applications
          </TabButton>
          <TabButton active={tab === "network"} onClick={() => setTab("network")} icon={Users}>
            Professional Network
          </TabButton>
        </div>

        {/* Action Cards Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ id, title, description, prompt, icon: Icon }) => (
            <article
              key={id}
              className="flex min-h-[250px] flex-col justify-between rounded-3xl border border-[var(--shield-border)] bg-[linear-gradient(180deg,oklch(0.16_0.02_255/0.95),oklch(0.12_0.015_255/0.98))] p-6 shadow-xl transition hover:border-[oklch(0.76_0.18_160/0.4)]"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-sm font-bold text-white">{title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => runInAgent(prompt)}
                className="as-public-button-primary mt-6 w-full rounded-xl py-2.5 text-xs font-bold"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Execute in Agent</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </article>
          ))}
        </div>

        {/* Saved Opportunities Dossier (Jobs Tab) */}
        {tab === "jobs" && (
          <div className="mt-10 rounded-3xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--shield-emerald-bright)]">
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>PERSISTENT CAREER DOSSIER</span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-white">Saved Target Opportunities</h2>
                <p className="text-xs text-[var(--shield-text-dim)]">
                  Roles saved across your journey sessions, eligible under destination statutory limits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadSavedOpportunities()}
                disabled={loadingSaved}
                className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink)] px-3 py-1.5 text-xs font-medium text-white transition hover:border-[var(--shield-border-bright)]"
              >
                <RefreshCw className={`h-3 w-3 ${loadingSaved ? "animate-spin text-[var(--shield-emerald-bright)]" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingSaved && savedOpportunities.length === 0 ? (
              <div className="mt-6 flex items-center justify-center py-10 text-xs text-[var(--shield-text-dim)]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[var(--shield-emerald-bright)]" />
                <span>Loading your saved opportunities...</span>
              </div>
            ) : savedOpportunities.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {savedOpportunities.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-5 transition hover:border-[oklch(0.76_0.18_160/0.4)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.1)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--shield-emerald-bright)] uppercase">
                          {item.contractType.replaceAll("_", " ")}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--shield-text-faint)]">
                          {item.location || "Verified Destination"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                      <p className="mt-1 text-xs text-[var(--shield-text-dim)]">{item.employer}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--shield-border)]">
                      <button
                        type="button"
                        onClick={() => runInAgent(`Prepare my application dossier for "${item.title}" at ${item.employer}. Check European CV formatting and statutory work limits.`)}
                        className="as-public-button-primary flex-1 rounded-lg py-1.5 text-xs font-semibold"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Prepare Dossier</span>
                      </button>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1.5 text-xs text-[var(--shield-text-dim)] transition hover:text-white"
                        >
                          <span>Listing</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[var(--shield-border)] p-6 text-center">
                <p className="text-xs text-[var(--shield-text-dim)]">
                  No opportunities saved to your dossier yet. Ask the AI Co-Pilot to search verified roles or explore the hero simulator.
                </p>
                <button
                  type="button"
                  onClick={() => runInAgent("Find internships in Paris related to my course compliant with student visa limits.")}
                  className="as-public-button-primary mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search Opportunities with Agent</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reality Guarantee Notice */}
        <div className="mt-8 rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--shield-emerald-bright)]" />
            <div>
              <div className="text-xs font-bold text-white">AbroadShield Reality Standard</div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                Opportunity retrieval uses primary government and institutional sources (France Travail / 1jeune1solution). If external credentials are not configured, AbroadShield presents an honest diagnostic card instead of mock records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
        active
          ? "bg-[var(--shield-emerald-bright)] text-black shadow-sm"
          : "text-[var(--shield-text-dim)] hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
