"use client";

import { useState } from "react";
import {
  Bookmark,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  MapPin,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
} from "lucide-react";
import type {
  Opportunity,
  OpportunityMatch,
} from "@/lib/abroadshield/opportunity-types";
import type { ApplicationPreparationPlan } from "@/lib/abroadshield/opportunity-service";

interface OpportunityResultCardProps {
  opportunity: Opportunity;
  match?: OpportunityMatch;
  initialSaved?: boolean;
}

export default function OpportunityResultCard({
  opportunity,
  match,
  initialSaved = false,
}: OpportunityResultCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [prepPlan, setPrepPlan] = useState<ApplicationPreparationPlan | null>(
    null,
  );
  const [prepExpanded, setPrepExpanded] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);

  const destinationUrl = opportunity.applicationUrl || opportunity.sourceUrl;

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/abroadshield/opportunities/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSaved(true);
      } else {
        setSaveError(data.error || "Failed to save opportunity.");
      }
    } catch {
      setSaveError("Network error saving opportunity.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrepare = async () => {
    if (prepPlan) {
      setPrepExpanded(!prepExpanded);
      return;
    }

    setPreparing(true);
    setPrepError(null);

    try {
      const res = await fetch("/api/abroadshield/opportunities/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.plan) {
        setPrepPlan(data.plan);
        setPrepExpanded(true);
        // Also reflect that it's now tracked as saved or preparing
        setSaved(true);
      } else {
        setPrepError(data.error || "Could not generate preparation plan.");
      }
    } catch {
      setPrepError("Network error loading preparation plan.");
    } finally {
      setPreparing(false);
    }
  };

  const handlePreFillPrompt = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("abroadshield:prefill-chat", { detail: prompt }),
    );
  };

  // Format contract type nicely
  const formatContract = (contract: string) => {
    return contract
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Freshness badge
  const renderFreshnessBadge = () => {
    if (opportunity.freshness === "fresh") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.12)] px-2 py-0.5 text-[11px] font-medium text-[oklch(0.85_0.19_158)]">
          <Clock className="h-3 w-3" /> Fresh (≤7d)
        </span>
      );
    }
    if (opportunity.freshness === "aging") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
          <Clock className="h-3 w-3" /> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-[var(--shield-text-dim)]">
        <Clock className="h-3 w-3" /> Verified
      </span>
    );
  };

  // Match badge
  const renderFitBadge = () => {
    if (!match) return null;
    if (match.fit === "high") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.2)] px-2.5 py-0.5 text-xs font-semibold text-[oklch(0.92_0.18_155)] shadow-sm">
          <Sparkles className="h-3 w-3 text-[oklch(0.85_0.19_158)]" /> High Fit
        </span>
      );
    }
    if (match.fit === "medium") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
          Medium Fit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-300">
        Potential Fit
      </span>
    );
  };

  // Statutory work authorization badge:
  // Must NOT claim "Eligible under 964h rule" unless deterministic facts confirm it.
  const renderEligibilityBadge = () => {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <span>
          <strong>Work Authorization:</strong> Requires verification (Subject to 964h annual limit)
        </span>
      </div>
    );
  };

  return (
    <div className="group my-3 overflow-hidden rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.20_0.025_165/0.85)] p-4 shadow-lg backdrop-blur-md transition hover:border-[oklch(0.74_0.17_162/0.4)]">
      {/* Top Bar: Source badge & Freshness & Fit */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.15_0.02_165)] px-2 py-0.5 text-[11px] font-mono text-[var(--shield-text-dim)] border border-white/10">
            <ShieldCheck className="h-3 w-3 text-[oklch(0.74_0.17_162)]" />
            Verified Source: {opportunity.provenance?.provider || "France Travail"} (L1)
          </span>
          {renderFreshnessBadge()}
        </div>
        <div>{renderFitBadge()}</div>
      </div>

      {/* Title & Employer */}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-[var(--shield-text)] group-hover:text-[oklch(0.92_0.18_155)] transition">
          {opportunity.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--shield-text-dim)]">
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />
            <span className="font-medium text-[var(--shield-text)]">
              {opportunity.employer || "Employer via France Travail"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-amber-400/80" />
            <span>{opportunity.location || "Paris, France"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span>{formatContract(opportunity.contractType)}</span>
          </div>
        </div>
      </div>

      {/* Match Reasons Chips */}
      {match && match.reasons && match.reasons.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {match.reasons.slice(0, 4).map((reason, idx) => (
            <span
              key={idx}
              className="rounded-full bg-[oklch(0.74_0.17_162/0.09)] border border-[oklch(0.74_0.17_162/0.25)] px-2 py-0.5 text-[11px] text-[oklch(0.85_0.19_158)]"
            >
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      {/* Eligibility Warning/Notice */}
      <div className="mt-3">{renderEligibilityBadge()}</div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
        {/* Open Verified Listing */}
        <a
          href={destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/0.8)] px-3 py-2 text-xs font-medium text-[var(--shield-text)] transition hover:border-[oklch(0.74_0.17_162/0.5)] hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />
          Open verified listing
        </a>

        {/* Save to Journey */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saved || saving}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
            saved
              ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 cursor-default"
              : "border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/0.8)] text-[var(--shield-text)] hover:border-[oklch(0.74_0.17_162/0.5)] hover:text-white"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Saved in Journey
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />
              Save to Journey
            </>
          )}
        </button>

        {/* Prepare Application (L1 Real Preparation) */}
        <button
          type="button"
          onClick={handlePrepare}
          disabled={preparing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.15)] px-3 py-2 text-xs font-medium text-[oklch(0.88_0.18_155)] transition hover:bg-[oklch(0.74_0.17_162/0.25)] hover:border-[oklch(0.74_0.17_162/0.6)]"
        >
          {preparing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Analyzing requirements…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />
              Prepare application
              {prepPlan && (
                prepExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                )
              )}
            </>
          )}
        </button>
      </div>

      {saveError && (
        <p className="mt-2 text-xs text-red-400">{saveError}</p>
      )}
      {prepError && (
        <p className="mt-2 text-xs text-red-400">{prepError}</p>
      )}

      {/* Preparation Plan Drawer / Panel */}
      {prepPlan && prepExpanded && (
        <div className="mt-4 rounded-xl border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.15_0.02_165/0.9)] p-3.5 text-xs text-[var(--shield-text)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 font-semibold text-[oklch(0.85_0.19_158)]">
              <FileText className="h-4 w-4" />
              Application Preparation Dossier
            </div>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-[var(--shield-text-dim)]">
              L1 Discovery & Prep
            </span>
          </div>

          {/* Important Notice: No fake auto-apply */}
          <div className="mt-2.5 rounded-lg border border-sky-500/20 bg-sky-500/10 p-2 text-[11px] text-sky-200">
            {prepPlan.externalApplicationNotice}
          </div>

          {/* Keywords and Strengths */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-[var(--shield-text-dim)] uppercase tracking-wider">
                Matching Strengths
              </div>
              <ul className="mt-1 space-y-1 list-disc list-inside text-[11px] text-[var(--shield-text)]">
                {prepPlan.analysis.matchingStrengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-[var(--shield-text-dim)] uppercase tracking-wider">
                Key Keywords to Highlight
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {prepPlan.analysis.keyKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Gaps/Checks */}
          {prepPlan.analysis.potentialGaps.length > 0 && (
            <div className="mt-2.5">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Compliance & Authorization Checks
              </div>
              <ul className="mt-1 space-y-1 list-disc list-inside text-[11px] text-amber-200/90">
                {prepPlan.analysis.potentialGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tailoring Actions */}
          <div className="mt-3.5 pt-2.5 border-t border-white/10">
            <div className="text-[11px] font-semibold text-[oklch(0.85_0.19_158)] mb-2">
              Actionable Next Steps with Agent:
            </div>
            <div className="flex flex-col gap-2">
              {prepPlan.recommendedActions.map((act) => (
                <div
                  key={act.step}
                  className="flex items-center justify-between gap-2 rounded-lg bg-black/20 p-2 border border-white/5"
                >
                  <div className="text-[11px]">
                    <span className="font-semibold text-white">
                      {act.step}. {act.title}:
                    </span>{" "}
                    <span className="text-[var(--shield-text-dim)]">
                      {act.description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreFillPrompt(act.actionablePrompt)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-md bg-[oklch(0.74_0.17_162/0.2)] border border-[oklch(0.74_0.17_162/0.4)] px-2 py-1 text-[10px] font-medium text-[oklch(0.92_0.18_155)] hover:bg-[oklch(0.74_0.17_162/0.3)]"
                  >
                    <Send className="h-3 w-3" />
                    Ask Agent
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
