"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  CircleSlash,
  Clock,
  Upload,
  ScanLine,
  Fingerprint,
  IdCard,
  X,
} from "lucide-react";
import { MEMORY, VAULT, STUDENT, PHASES, ACCENT_MAP, type PhaseId } from "./data";
import Reveal from "./Reveal";

const PHASE_NAME: Record<PhaseId, string> = {
  "pre-departure": "Pre-Departure",
  arrival: "Arrival",
  studying: "Studying & Part-Time",
  "job-success": "Job Success",
};

const PHASES_ACCENT: Record<PhaseId, "emerald" | "amber" | "violet" | "cyan"> = {
  "pre-departure": "emerald",
  arrival: "violet",
  studying: "amber",
  "job-success": "cyan",
};

const VAULT_STATUS_STYLE = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    text: "text-[oklch(0.85_0.19_158)]",
    border: "border-[oklch(0.74_0.17_162/0.4)]",
    bg: "bg-[oklch(0.74_0.17_162/0.1)]",
    dot: "bg-[oklch(0.74_0.17_162)]",
  },
  issue: {
    label: "Issue found",
    icon: AlertTriangle,
    text: "text-[oklch(0.86_0.17_80)]",
    border: "border-[oklch(0.8_0.15_80/0.45)]",
    bg: "bg-[oklch(0.8_0.15_80/0.12)]",
    dot: "bg-[oklch(0.8_0.15_80)]",
  },
  missing: {
    label: "Not yet uploaded",
    icon: CircleSlash,
    text: "text-[var(--shield-text-dim)]",
    border: "border-[var(--shield-border)]",
    bg: "bg-[oklch(0.22_0.025_165/0.4)]",
    dot: "bg-[oklch(0.4_0.02_220)]",
  },
  pending: {
    label: "Awaiting review",
    icon: Clock,
    text: "text-[oklch(0.78_0.16_300)]",
    border: "border-[oklch(0.64_0.16_300/0.4)]",
    bg: "bg-[oklch(0.64_0.16_300/0.1)]",
    dot: "bg-[oklch(0.64_0.16_300)]",
  },
} as const;

// simulated gap-check results when "scanning" a passport
const SCAN_STEPS = [
  { label: "Uploading secure copy…", icon: Upload },
  { label: "OCR reading bio page…", icon: ScanLine },
  { label: "Cross-checking fields vs checklist…", icon: Fingerprint },
  { label: "Generating gap report…", icon: IdCard },
];

const SCAN_RESULTS = [
  { field: "Surname", value: "MEHTA", status: "ok" as const },
  { field: "Given names", value: "AARAV", status: "ok" as const },
  { field: "Passport no.", value: "M••••••7", status: "ok" as const },
  { field: "Date of birth", value: "••/••/2003", status: "ok" as const },
  { field: "Expiry", value: "Aug 2028", status: "ok" as const },
  { field: "Photo resolution", value: "640×800 — too low", status: "issue" as const },
  { field: "MRZ checksum", value: "Valid", status: "ok" as const },
  { field: "Page completeness", value: "All pages present", status: "ok" as const },
];

export default function MemoryVault() {
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | "all">("all");
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanDone, setScanDone] = useState(false);

  const filteredVault =
    phaseFilter === "all" ? VAULT : VAULT.filter((d) => d.phase === phaseFilter);

  const runScan = () => {
    setScanning(true);
    setScanDone(false);
    setScanStep(0);
    const step = (i: number) => {
      if (i >= SCAN_STEPS.length) {
        setScanning(false);
        setScanDone(true);
        return;
      }
      setScanStep(i);
      setTimeout(() => step(i + 1), 650);
    };
    setTimeout(() => step(1), 650);
  };

  return (
    <section className="relative w-full bg-transparent py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.3)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* heading */}
        <Reveal className="mb-12 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.74_0.17_162)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
            One continuous memory
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            The vault that{" "}
            <span className="as-text-gradient">never forgets</span> your story.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            Passport scans, visa documents, bank statements, deadlines — the highest-stakes
            PII a person owns, encrypted at rest, organized around one real sequence. The
            trust built during your visa week is still here two years later.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* ---------- left: memory + student card ---------- */}
          <div className="space-y-6">
            {/* student card */}
            <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.74_0.17_162/0.35)] as-glass-strong p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[oklch(0.74_0.17_162/0.15)] blur-2xl" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.15)] text-xl font-semibold text-[oklch(0.85_0.19_158)]">
                  AM
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[var(--shield-text)]">
                      {STUDENT.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.85_0.19_158)]">
                      <ShieldCheck className="h-3 w-3" />
                      Verified student
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--shield-text-dim)]">
                    {STUDENT.origin} → {STUDENT.destination}
                  </p>
                  <p className="text-xs text-[var(--shield-text-dim)]">
                    {STUDENT.course} · {STUDENT.university} · {STUDENT.intake}
                  </p>
                </div>
              </div>

              {/* readiness bar */}
              <div className="relative mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-[var(--shield-text-dim)]">Journey readiness</span>
                  <span className="font-semibold text-[oklch(0.85_0.19_158)]">
                    {STUDENT.readiness}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[oklch(0.3_0.02_220/0.7)]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.14_165)] to-[oklch(0.85_0.19_158)]"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${STUDENT.readiness}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* stat trio */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { k: `${STUDENT.documentsVerified}/${STUDENT.documentsTotal}`, v: "Docs verified" },
                  { k: `${STUDENT.deadlinesTracked}`, v: "Deadlines tracked" },
                  { k: `${STUDENT.draftsReady}`, v: "Drafts ready" },
                ].map((s) => (
                  <div
                    key={s.v}
                    className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-3 py-2.5 text-center"
                  >
                    <div className="text-lg font-semibold text-[oklch(0.85_0.19_158)]">
                      {s.k}
                    </div>
                    <div className="text-[10px] text-[var(--shield-text-dim)]">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* memory items */}
            <div className="rounded-3xl border border-[var(--shield-border)] as-glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                  <Lock className="h-3.5 w-3.5 text-[oklch(0.8_0.15_80)]" />
                  What the agent remembers
                </h4>
                <span className="text-[11px] text-[var(--shield-text-dim)]">
                  {MEMORY.length} facts · encrypted
                </span>
              </div>

              <div className="as-scroll max-h-[340px] space-y-2 overflow-y-auto pr-1">
                {MEMORY.map((m) => {
                  const accent = ACCENT_MAP[PHASES_ACCENT[m.phase]];
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.label}
                      className="flex items-center gap-3 rounded-xl border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-3 py-2.5 transition hover:border-[oklch(0.74_0.17_162/0.3)]"
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${accent.bg} ${accent.border}`}>
                        <Icon className={`h-3.5 w-3.5 ${accent.text}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] uppercase tracking-wide text-[var(--shield-text-dim)]">
                          {m.label}
                        </div>
                        <div className="truncate text-sm text-[var(--shield-text)]">
                          {m.value}
                        </div>
                      </div>
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---------- right: document vault + gap-checker ---------- */}
          <div className="space-y-6">
            {/* gap-checker demo */}
            <div className="relative overflow-hidden rounded-3xl border border-[oklch(0.8_0.15_80/0.4)] as-glass-strong p-6">
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-[oklch(0.8_0.15_80/0.15)] blur-2xl" />
              <div className="relative">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.8_0.15_80)]">
                  <ScanLine className="h-3.5 w-3.5" />
                  Live gap-check
                </div>
                <h4 className="mt-1 text-xl font-semibold text-[var(--shield-text)]">
                  Scan a passport → see the gaps before the consulate does.
                </h4>
                <p className="mt-1.5 text-xs text-[var(--shield-text-dim)]">
                  Pre-Departure gap-checking is one of the four core differentiators.
                  Run a simulated scan — the agent reads the bio page, cross-checks it
                  against the country checklist, and flags the one field that would get
                  your application sent back.
                </p>

                {/* scan surface */}
                <div className="mt-5 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)/0.7)] p-5">
                  <AnimatePresence mode="wait">
                    {!scanning && !scanDone && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center gap-3 py-6 text-center"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-[oklch(0.8_0.15_80/0.4)]">
                          <Upload className="h-6 w-6 text-[oklch(0.86_0.17_80)]" />
                        </div>
                        <div className="text-sm text-[var(--shield-text-dim)]">
                          Drop a passport scan, or run a simulated check
                        </div>
                        <button
                          onClick={runScan}
                          className="mt-1 inline-flex items-center gap-2 rounded-full bg-[oklch(0.8_0.15_80)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.14_0.018_165)))] transition hover:bg-[oklch(0.86_0.17_80))] as-glow-amber"
                        >
                          <ScanLine className="h-4 w-4" />
                          Run simulated gap-check
                        </button>
                      </motion.div>
                    )}

                    {scanning && (
                      <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {SCAN_STEPS.map((s, i) => {
                          const StepIcon = s.icon;
                          const done = i < scanStep;
                          const active = i === scanStep;
                          return (
                            <div
                              key={s.label}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                                done
                                  ? "border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.08)]"
                                  : active
                                    ? "border-[oklch(0.8_0.15_80/0.5)] bg-[oklch(0.8_0.15_80/0.1)]"
                                    : "border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.3)] opacity-50"
                              }`}
                            >
                              {done ? (
                                <CheckCircle2 className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                              ) : active ? (
                                <StepIcon className="h-4 w-4 animate-pulse text-[oklch(0.86_0.17_80)]" />
                              ) : (
                                <StepIcon className="h-4 w-4 text-[var(--shield-text-dim)]" />
                              )}
                              <span
                                className={`text-sm ${
                                  done
                                    ? "text-[var(--shield-text)]"
                                    : active
                                      ? "text-[oklch(0.86_0.17_80)]"
                                      : "text-[var(--shield-text-dim)]"
                                }`}
                              >
                                {s.label}
                              </span>
                              {active && (
                                <span className="ml-auto flex gap-1">
                                  <span className="as-typing-dot h-1.5 w-1.5 rounded-full bg-[oklch(0.86_0.17_80)]" />
                                  <span className="as-typing-dot h-1.5 w-1.5 rounded-full bg-[oklch(0.86_0.17_80)]" />
                                  <span className="as-typing-dot h-1.5 w-1.5 rounded-full bg-[oklch(0.86_0.17_80)]" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}

                    {scanDone && !scanning && (
                      <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[oklch(0.8_0.15_80/0.45)] bg-[oklch(0.8_0.15_80/0.12)]">
                              <FileText className="h-3.5 w-3.5 text-[oklch(0.86_0.17_80)]" />
                            </span>
                            <span className="text-sm font-semibold text-[var(--shield-text)]">
                              passport_bio.jpg
                            </span>
                          </div>
                          <span className="rounded-full border border-[oklch(0.8_0.15_80/0.45)] bg-[oklch(0.8_0.15_80/0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[oklch(0.86_0.17_80)]">
                            1 issue found
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {SCAN_RESULTS.map((r) => (
                            <div
                              key={r.field}
                              className="flex items-center justify-between rounded-lg border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] px-3 py-2 text-xs"
                            >
                              <span className="text-[var(--shield-text-dim)]">{r.field}</span>
                              <span className="flex items-center gap-2">
                                <span className="text-[var(--shield-text)]">{r.value}</span>
                                {r.status === "ok" ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" />
                                ) : (
                                  <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.86_0.17_80)]" />
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* agent action */}
                        <div className="rounded-xl border border-[oklch(0.8_0.15_80/0.45)] bg-[oklch(0.8_0.15_80/0.08)] p-3">
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.86_0.17_80)]" />
                            <p className="text-xs leading-relaxed text-[var(--shield-text)]">
                              <span className="font-semibold">Agent action:</span> photo
                              resolution below the consulate threshold. Re-capture in
                              daylight against a plain background. Drafted a note for your
                              photographer — <span className="text-[oklch(0.86_0.17_80)]">approve to send</span>?
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setScanDone(false);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                        >
                          <X className="h-3 w-3" /> Reset scan
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* document vault */}
            <div className="rounded-3xl border border-[var(--shield-border)] as-glass p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--shield-text-dim)]">
                  <Lock className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />
                  Document vault
                </h4>
                {/* phase filter */}
                <div className="flex flex-wrap gap-1 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-1">
                  <button
                    onClick={() => setPhaseFilter("all")}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      phaseFilter === "all"
                        ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165))]"
                        : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                    }`}
                  >
                    All
                  </button>
                  {PHASES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPhaseFilter(p.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        phaseFilter === p.id
                          ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165))]"
                          : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
                      }`}
                    >
                      {PHASE_NAME[p.id].split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="as-scroll max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {filteredVault.map((doc) => {
                  const s = VAULT_STATUS_STYLE[doc.status];
                  const StatusIcon = s.icon;
                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-3 rounded-xl border ${s.border} ${s.bg} px-3 py-2.5`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)/0.6)]">
                        <FileText className={`h-4 w-4 ${s.text}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-[var(--shield-text)]">
                          {doc.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--shield-text-dim)]">
                          <span className={s.text}>{PHASE_NAME[doc.phase]}</span>
                          {doc.scannedAt && <span>· scanned {doc.scannedAt}</span>}
                        </div>
                        {doc.issue && (
                          <div className="mt-0.5 text-[11px] leading-snug text-[oklch(0.86_0.17_80)]">
                            ⚠ {doc.issue}
                          </div>
                        )}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border ${s.border} ${s.bg} px-2 py-0.5 text-[10px] font-semibold uppercase ${s.text}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
