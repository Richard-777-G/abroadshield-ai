"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";

export type PolicyEvidenceView = {
  ruleId: string;
  ruleVersionId: string | null;
  status: string;
  authority: string | null;
  sourceUrl: string | null;
  reason?: string;
};

export default function PolicyEvidenceCard({ evidence }: { evidence: PolicyEvidenceView | null }) {
  return <section className="mt-6 rounded-[28px] border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5 sm:p-7">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[var(--shield-text-faint)]"><ShieldCheck className="h-3.5 w-3.5"/>Evidence & policy</div>
        <h2 className="mt-2 text-lg font-semibold">Rules are shown with their evidence state.</h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--shield-text-dim)]">The workspace does not silently turn a policy source into a legal certainty. Provenance and uncertainty stay visible.</p>
      </div>
    </div>
    {evidence ? <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-[var(--shield-border)] p-4"><div className="text-[9px] uppercase tracking-wider text-[var(--shield-text-faint)]">Verification</div><div className="mt-2 text-sm font-semibold">{evidence.status}</div></div>
      <div className="rounded-2xl border border-[var(--shield-border)] p-4"><div className="text-[9px] uppercase tracking-wider text-[var(--shield-text-faint)]">Policy version</div><div className="mt-2 break-all text-xs font-semibold">{evidence.ruleVersionId ?? "No selected version"}</div></div>
      <div className="rounded-2xl border border-[var(--shield-border)] p-4"><div className="text-[9px] uppercase tracking-wider text-[var(--shield-text-faint)]">Authority</div><div className="mt-2 text-xs font-semibold">{evidence.authority ?? "Not available"}</div></div>
    </div> : <div className="mt-5 rounded-2xl border border-[var(--shield-border)] p-4 text-xs text-[var(--shield-text-dim)]">No versioned policy is currently attached to this destination requirement. The system will not invent one.</div>}
    {evidence?.reason ? <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-5 text-[var(--shield-text-dim)]"><span className="font-semibold text-[var(--shield-text)]">Review state:</span> {evidence.reason}</div> : null}
    {evidence?.sourceUrl ? <a href={evidence.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[oklch(0.85_0.19_158)]">Open authoritative source <ExternalLink className="h-3 w-3"/></a> : null}
  </section>;
}
