"use client";

import { ArrowUpRight, CheckCircle2, CircleDot, MapPinned, ShieldCheck } from "lucide-react";

const phases = [
  { n: "01", label: "Prepare", detail: "Rules · documents · deadlines", state: "active" },
  { n: "02", label: "Arrive", detail: "Housing · banking · registration", state: "next" },
  { n: "03", label: "Build", detail: "Study · work · stay compliant", state: "next" },
  { n: "04", label: "Launch", detail: "Jobs · network · visa runway", state: "next" },
];

export default function LandingSignal() {
  return (
    <section className="relative mx-auto mt-10 max-w-7xl overflow-hidden rounded-[2rem] border border-[oklch(0.6_0.04_165/0.18)] bg-[oklch(0.13_0.018_165/0.72)] shadow-2xl">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_80%_20%,oklch(0.74_0.17_162/0.12),transparent_34%),linear-gradient(115deg,transparent_20%,oklch(0.74_0.17_162/0.035),transparent_60%)]" />
      <div className="relative grid lg:grid-cols-[1.05fr_1.4fr]">
        <div className="border-b border-[var(--shield-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.8_0.16_162)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)] shadow-[0_0_12px_oklch(0.74_0.17_162/0.8)]" />
            One continuous workspace
          </div>
          <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-3xl">From destination rules to the next real-world action.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--shield-text-dim)]">AbroadShield keeps the student profile, requirements, evidence, decisions and completed work connected as the journey moves forward.</p>
          <div className="mt-7 grid gap-2 sm:grid-cols-2">
            {[
              [ShieldCheck, "Country-aware", "Rules shape the workflow"],
              [CheckCircle2, "Evidence-first", "Work becomes a record"],
            ].map(([Icon, title, detail]) => {
              const I = Icon as typeof ShieldCheck;
              return <div key={title as string} className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.18_0.02_165/0.45)] p-3"><I className="h-4 w-4 text-[oklch(0.82_0.18_162)]" /><div className="mt-2 text-xs font-semibold">{title as string}</div><div className="mt-1 text-[10px] text-[var(--shield-text-faint)]">{detail as string}</div></div>;
            })}
          </div>
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between">
            <div><div className="text-[10px] uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Journey control rail</div><div className="mt-1 text-sm font-semibold">Your next four operating states</div></div>
            <div className="rounded-full border border-[var(--shield-border)] px-2.5 py-1 text-[9px] text-[var(--shield-text-faint)]">01 → 04</div>
          </div>
          <div className="relative mt-8">
            <div className="absolute left-5 right-5 top-5 h-px bg-[var(--shield-border)]" />
            <div className="relative grid grid-cols-4 gap-2">
              {phases.map((phase, i) => <div key={phase.n} className="min-w-0">
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ${i === 0 ? "border-[oklch(0.74_0.17_162/0.7)] bg-[oklch(0.74_0.17_162/0.14)] text-[oklch(0.86_0.19_158)]" : "border-[var(--shield-border)] bg-[oklch(0.14_0.018_165)] text-[var(--shield-text-faint)]"}`}><span className="font-mono text-[10px]">{phase.n}</span></div>
                <div className="mt-4 text-xs font-semibold">{phase.label}</div>
                <div className="mt-1 pr-2 text-[10px] leading-4 text-[var(--shield-text-faint)]">{phase.detail}</div>
              </div>)}
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-[oklch(0.74_0.17_162/0.18)] bg-[oklch(0.74_0.17_162/0.045)] p-4">
            <div className="flex items-start gap-3"><MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.82_0.18_162)]" /><div className="min-w-0"><div className="text-[10px] uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Current context</div><div className="mt-1 text-sm font-semibold">Destination → stage → action</div><div className="mt-1 text-[11px] leading-5 text-[var(--shield-text-dim)]">The agent should know where you are, what matters now, and what evidence is still missing before it proposes the next action.</div></div><ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-[var(--shield-text-faint)]" /></div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[9px] text-[var(--shield-text-faint)]"><CircleDot className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" /> Human approval remains the control boundary for outbound actions.</div>
        </div>
      </div>
    </section>
  );
}
