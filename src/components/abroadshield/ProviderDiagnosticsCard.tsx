"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Key,
  Lock,
  Shield,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface ProviderDiagnosticsCardProps {
  sourceId?: string;
  sourceErrors?: Array<{ sourceId: string; message: string }>;
  onExploreWithAgent?: () => void;
}

export default function ProviderDiagnosticsCard({
  sourceId = "france-travail",
  sourceErrors = [],
  onExploreWithAgent,
}: ProviderDiagnosticsCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const envSnippet = `FRANCE_TRAVAIL_CLIENT_ID="your_client_id_here"\nFRANCE_TRAVAIL_CLIENT_SECRET="your_client_secret_here"`;

  const copyConfig = () => {
    void navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const primaryError =
    sourceErrors.find((e) => e.sourceId === sourceId)?.message ||
    "Official gateway credentials are not configured in this environment.";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-amber-500/40 bg-[linear-gradient(180deg,oklch(0.18_0.025_75/0.25),oklch(0.12_0.015_255/0.95))] p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">France Travail Gateway</h4>
              <span className="rounded-full border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-amber-300">
                Credentials Required
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--shield-text-dim)]">
              Official French Republic Employment &amp; Internship API (francetravail.io)
            </p>
          </div>
        </div>
      </div>

      {/* Honest L1 Notice */}
      <div className="mt-3.5 rounded-xl border border-white/5 bg-[var(--shield-ink)] p-3 text-xs leading-relaxed text-[var(--shield-text-dim)]">
        <div className="flex items-center gap-1.5 font-semibold text-amber-300">
          <Shield className="h-3.5 w-3.5" />
          <span>AbroadShield L1 Honesty Boundary</span>
        </div>
        <p className="mt-1 text-[11px]">
          AbroadShield connects exclusively to official government and university job registries. In accordance with product safety rules, we <strong className="text-white">never generate fake vacancies or simulated listings</strong> merely to populate the screen.
        </p>
      </div>

      {/* Diagnostics / Error Details */}
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--shield-text-faint)]">
        <span className="font-mono text-[10px]">GATEWAY STATUS // {primaryError}</span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:underline"
        >
          <span>{expanded ? "Hide Setup Instructions" : "Configure API Keys"}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Expandable Setup Drawer */}
      {expanded && (
        <div className="mt-3 rounded-xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-white">Required Environment Configuration:</span>
            <button
              type="button"
              onClick={copyConfig}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--shield-border)] px-2 py-1 text-[10px] font-semibold text-[var(--shield-text-dim)] hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy .env snippet"}</span>
            </button>
          </div>

          <pre className="mt-2 overflow-x-auto rounded-lg bg-black/50 p-2.5 font-mono text-[11px] text-emerald-300">
            {envSnippet}
          </pre>

          <p className="mt-2.5 text-[11px] text-[var(--shield-text-dim)]">
            To enable live job querying: Register an application at{" "}
            <a
              href="https://francetravail.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline inline-flex items-center gap-0.5"
            >
              francetravail.io <ExternalLink className="h-2.5 w-2.5" />
            </a>{" "}
            under the <em>Offres d&apos;emploi v2</em> package and add the credentials to your Vercel / environment variables.
          </p>
        </div>
      )}
    </div>
  );
}
