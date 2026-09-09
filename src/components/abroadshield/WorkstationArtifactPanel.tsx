"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bookmark,
  Scale,
  FileCheck2,
  ExternalLink,
  RefreshCw,
  Loader2,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  Info,
} from "lucide-react";
import type { SavedOpportunityRecord } from "@/lib/abroadshield/opportunity-service";

export type ArtifactTab = "dossier" | "statutory" | "application";

interface WorkstationArtifactPanelProps {
  open: boolean;
  onClose: () => void;
  activeTab?: ArtifactTab;
  onTabChange?: (tab: ArtifactTab) => void;
  onTriggerPrompt?: (prompt: string) => void;
}

export default function WorkstationArtifactPanel({
  open,
  onClose,
  activeTab: controlledTab,
  onTabChange,
  onTriggerPrompt,
}: WorkstationArtifactPanelProps) {
  const [internalTab, setInternalTab] = useState<ArtifactTab>("dossier");
  const tab = controlledTab ?? internalTab;
  const setTab = (t: ArtifactTab) => {
    setInternalTab(t);
    onTabChange?.(t);
  };

  const [savedOpportunities, setSavedOpportunities] = useState<SavedOpportunityRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/abroadshield/opportunities/save", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.opportunities)) {
          setSavedOpportunities(data.opportunities);
        }
      }
    } catch {
      // offline / demo fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tab === "dossier") {
      void loadOpportunities();
    }
  }, [open, tab]);

  if (!open) return null;

  return (
    <aside
      aria-label="Intelligence Artifact Inspector"
      className="as-artifact-drawer fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-[480px] lg:relative lg:z-auto lg:w-[420px] xl:w-[460px]"
    >
      {/* Inspector Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--shield-border)] px-4 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-[var(--shield-emerald-bright)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Artifact &amp; Intelligence Inspector
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--shield-text-dim)] transition hover:bg-white/5 hover:text-white"
          aria-label="Close inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-2 py-1.5">
        <button
          type="button"
          onClick={() => setTab("dossier")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
            tab === "dossier"
              ? "bg-white/10 text-white shadow-sm"
              : "text-[var(--shield-text-dim)] hover:text-white"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
          <span>Saved Dossier</span>
          {savedOpportunities.length > 0 && (
            <span className="ml-1 rounded-full bg-[var(--shield-emerald-deep)] px-1.5 py-0.2 text-[9px] font-mono text-[var(--shield-emerald-bright)]">
              {savedOpportunities.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("statutory")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
            tab === "statutory"
              ? "bg-white/10 text-white shadow-sm"
              : "text-[var(--shield-text-dim)] hover:text-white"
          }`}
        >
          <Scale className="h-3.5 w-3.5 text-[var(--shield-cyan)]" />
          <span>Statutory Proof</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("application")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
            tab === "application"
              ? "bg-white/10 text-white shadow-sm"
              : "text-[var(--shield-text-dim)] hover:text-white"
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5 text-amber-400" />
          <span>Plan &amp; Drafts</span>
        </button>
      </div>

      {/* Panel Body Content */}
      <div className="as-scroll flex-1 overflow-y-auto p-4 sm:p-5">
        {tab === "dossier" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--shield-text-faint)]">
                PERSISTENT TARGET OPPORTUNITIES
              </span>
              <button
                type="button"
                onClick={() => void loadOpportunities()}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] text-[var(--shield-text-dim)] hover:text-white"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-[var(--shield-emerald-bright)]" : ""}`} />
                <span>Sync</span>
              </button>
            </div>

            {loading && savedOpportunities.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-xs text-[var(--shield-text-dim)]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[var(--shield-emerald-bright)]" />
                <span>Loading saved dossier…</span>
              </div>
            ) : savedOpportunities.length > 0 ? (
              savedOpportunities.map((op) => (
                <div
                  key={op.id}
                  className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4 transition hover:border-[var(--shield-border-strong)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.1)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--shield-emerald-bright)] uppercase">
                      {op.contractType.replaceAll("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--shield-text-faint)]">
                      {op.location || "France"}
                    </span>
                  </div>
                  <h4 className="mt-2.5 text-sm font-bold text-white line-clamp-1">{op.title}</h4>
                  <p className="mt-0.5 text-xs text-[var(--shield-text-dim)]">{op.employer}</p>

                  <div className="mt-4 flex items-center gap-2 pt-2.5 border-t border-[var(--shield-border)]">
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPrompt?.(
                          `Prepare application plan and tailored European CV dossier for "${op.title}" at ${op.employer}. Check 964h statutory work-limit compliance.`
                        );
                      }}
                      className="as-public-button-primary flex-1 rounded-lg py-1.5 text-xs font-semibold"
                    >
                      <Zap className="h-3 w-3 fill-current" />
                      <span>Prepare with Agent</span>
                    </button>
                    {op.sourceUrl && (
                      <a
                        href={op.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-2.5 py-1.5 text-xs text-[var(--shield-text-dim)] hover:text-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--shield-border)] p-6 text-center">
                <Bookmark className="mx-auto h-8 w-8 text-[var(--shield-text-faint)]" />
                <p className="mt-2 text-xs text-[var(--shield-text-dim)]">
                  Your persistent career dossier is empty.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onTriggerPrompt?.(
                      "Find internships in Paris related to my master's course compliant with student visa limits."
                    );
                  }}
                  className="as-public-button-primary mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Search France Travail Roles</span>
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "statutory" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.08)] p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                <span className="text-xs font-bold text-white">Active Jurisdiction: France</span>
              </div>
              <div className="mt-2 space-y-2 text-xs text-[var(--shield-text-dim)]">
                <div className="font-mono text-[11px] text-white">
                  Code du travail · Article R5221-26
                </div>
                <p className="leading-relaxed">
                  International students holding a valid VLS-TS or student residency permit are
                  authorized to work up to <strong>964 hours per year</strong> (60% of annual
                  statutory working hours) without needing a prior administrative work authorization
                  (autorisation de travail).
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--shield-cyan)]" />
                <span className="text-xs font-bold text-white">Convention de Stage (Internships)</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                Mandatory university curricular internships executed under a 3-party{" "}
                <em>Convention de Stage</em> do <strong>not</strong> consume the 964-hour annual
                work ceiling when performed as an integrated component of your curriculum.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Comparative European Frameworks</span>
              </div>
              <ul className="mt-2 space-y-2 text-xs text-[var(--shield-text-dim)]">
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-white">🇬🇧 UK:</span>
                  <span>UKVI 20 hours/week term-time ceiling; full-time during official vacation periods.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-white">🇩🇪 Germany:</span>
                  <span>AufenthG § 16b: 120 full days or 240 half days per calendar year.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {tab === "application" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink)] p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--shield-text-faint)]">
                APPLICATION READINESS DOSSIER
              </span>
              <h4 className="mt-1 text-sm font-bold text-white">European CV &amp; Dossier Checklist</h4>

              <div className="mt-3 space-y-2.5 text-xs text-[var(--shield-text-dim)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                  <span>French 1-page CV formatted (no photo requirement, clean chronology)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                  <span>Visa work authorization clause explicitly stated in header</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" />
                  <span>University Convention de Stage template verified with academic office</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onTriggerPrompt?.(
                    "Draft my European CV work-authorization statement and prepare my cover email template for my next internship application."
                  );
                }}
                className="as-public-button-primary mt-4 w-full rounded-xl py-2 text-xs font-bold"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Generate Dossier in Chat</span>
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Building2 className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
                <span>Outbound Communication Gate</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                The agent will draft professional outreach messages and cover notes, but will strictly halt at the draft state and require your explicit sign-off before sending anything through connected channels.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
