"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Pencil, X, Clock, Mail, FileText, Search, Users, ShieldCheck, History, AlertCircle, Send,
} from "lucide-react";
import Reveal from "./Reveal";
import { useApprovalsStore, type ApprovalEntry } from "./approvalsStore";

const ACTION_STYLE: Record<ApprovalEntry["action"], { label: string; icon: typeof CheckCircle2; text: string; border: string; bg: string }> = {
  approved: { label: "Approved", icon: CheckCircle2, text: "text-[oklch(0.85_0.19_158)]", border: "border-[oklch(0.74_0.17_162/0.4)]", bg: "bg-[oklch(0.74_0.17_162/0.1)]" },
  edited: { label: "Edited", icon: Pencil, text: "text-[oklch(0.86_0.17_80)]", border: "border-[oklch(0.8_0.15_80/0.4)]", bg: "bg-[oklch(0.8_0.15_80/0.1)]" },
  declined: { label: "Declined", icon: X, text: "text-[oklch(0.72_0.19_22)]", border: "border-[oklch(0.66_0.19_22/0.4)]", bg: "bg-[oklch(0.66_0.19_22/0.1)]" },
};
const KIND_ICON: Record<ApprovalEntry["kind"], typeof Mail> = { email: Mail, form: FileText, search: Search, message: Users, document: ShieldCheck };

export default function ApprovalsHistory() {
  const entries = useApprovalsStore((s) => s.entries);
  const hydrated = useApprovalsStore((s) => s.hydrated);
  const hydrate = useApprovalsStore((s) => s.hydrate);
  useEffect(() => { if (!hydrated) void hydrate(); }, [hydrated, hydrate]);

  const approved = entries.filter((e) => e.action === "approved").length;
  const edited = entries.filter((e) => e.action === "edited").length;
  const declined = entries.filter((e) => e.action === "declined").length;

  return (
    <section className="relative w-full bg-transparent py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.35)] to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]"><span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" /><History className="h-3.5 w-3.5" />Approvals history</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">Every action the agent took, <span className="as-text-gradient">with your stamp on it.</span></h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">Human-in-the-loop, made visible. Nothing leaves without your one-tap approval. The history is persisted to your account and records whether an approved external action actually executed.</p>
        </Reveal>
        <Reveal delay={0.1} className="mb-8"><div className="grid grid-cols-3 gap-3 sm:max-w-md"><StatCard label="Approved" value={approved} icon={CheckCircle2} tone="approved" /><StatCard label="Edited" value={edited} icon={Pencil} tone="edited" /><StatCard label="Declined" value={declined} icon={X} tone="declined" /></div></Reveal>
        <Reveal delay={0.15}>
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[oklch(0.74_0.17_162/0.4)] via-[oklch(0.74_0.17_162/0.2)] to-transparent sm:left-[23px]" />
            <div className="space-y-3">
              {entries.map((entry, i) => {
                const style = ACTION_STYLE[entry.action]; const ActionIcon = style.icon; const KindIcon = KIND_ICON[entry.kind];
                const executionLabel = entry.executionStatus === "sent" ? "Sent" : entry.executionStatus === "failed" ? "Execution failed" : entry.action === "approved" ? "Recorded" : "Decision recorded";
                const executionTone = entry.executionStatus === "failed" ? "text-[oklch(0.72_0.19_22)]" : entry.executionStatus === "sent" ? "text-[oklch(0.85_0.19_158)]" : "text-[var(--shield-text-dim)]";
                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.05 }} className="relative flex gap-4 sm:gap-5">
                    <div className="relative z-10 flex shrink-0 items-center justify-center"><span className={`flex h-10 w-10 items-center justify-center rounded-full border ${style.border} ${style.bg} backdrop-blur sm:h-12 sm:w-12`}><ActionIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${style.text}`} /></span></div>
                    <div className="as-card-hover min-w-0 flex-1 rounded-2xl border border-[var(--shield-border)] as-glass p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><KindIcon className="h-3.5 w-3.5 shrink-0 text-[var(--shield-text-dim)]" /><span className="text-[10px] font-medium uppercase tracking-wide text-[var(--shield-text-dim)]">{entry.phase || "journey"}</span><span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide ${style.border} ${style.bg} ${style.text}`}>{style.label}</span></div><h3 className="mt-1.5 text-sm font-semibold text-[var(--shield-text)] sm:text-base">{entry.title}</h3><div className="mt-0.5 text-xs text-[var(--shield-text-dim)]">→ {entry.recipient}</div><p className="mt-2 text-xs leading-relaxed text-[var(--shield-text-dim)] sm:text-[13px]">{entry.detail}</p><div className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium ${executionTone}`}>{entry.executionStatus === "sent" ? <Send className="h-3 w-3" /> : entry.executionStatus === "failed" ? <AlertCircle className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}{executionLabel}{entry.externalMessageId ? ` · ${entry.externalMessageId}` : ""}{entry.executionError ? ` · ${entry.executionError}` : ""}</div></div><div className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--shield-text-dim)]"><Clock className="h-3 w-3" />{new Date(entry.time).toLocaleString()}</div></div>
                    </div>
                  </motion.div>
                );
              })}
              {hydrated && entries.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--shield-border)] p-8 text-center text-sm text-[var(--shield-text-dim)]">No approval actions recorded yet. They will appear here after you review an agent action.</div>}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.2}><div className="mt-6 rounded-2xl border border-dashed border-[var(--shield-border)] p-4 text-center"><p className="text-xs text-[var(--shield-text-dim)]"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" />The agent never sends anything without your approval. Approval is recorded separately from external execution, so the history does not imply an email or other action happened unless the connector confirms it.</p></div></Reveal>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof CheckCircle2; tone: "approved" | "edited" | "declined" }) {
  const style = ACTION_STYLE[tone];
  return <div className="rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3 text-center"><Icon className={`mx-auto h-4 w-4 ${style.text}`} /><div className="mt-1.5 text-2xl font-semibold text-[var(--shield-text)]">{value}</div><div className="text-[10px] uppercase tracking-wide text-[var(--shield-text-dim)]">{label}</div></div>;
}
