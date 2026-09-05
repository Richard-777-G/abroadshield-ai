"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Lock, Crown } from "lucide-react";
import { TIERS } from "./data";
import Reveal from "./Reveal";

const TIER_ICON = { free: Lock, shield: Sparkles, jobsuccess: Crown } as const;

export default function PricingTiers({ onStart }: { onStart?: () => void }) {
  return (
    <section id="pricing" className="relative w-full border-t border-[var(--shield-border)] bg-transparent py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-9 max-w-2xl">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[oklch(0.82_0.15_80)]"><span className="h-px w-6 bg-[oklch(0.8_0.15_80/.5)]" />Plans</div>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.05] tracking-[-.035em] sm:text-5xl">Start free. Pay when the agent becomes useful.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--shield-text-dim)]">A simple progression from journey basics to deeper agentic workflows. Pricing shown here is product direction, not a claim of current transactions.</p>
        </Reveal>
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const Icon = TIER_ICON[tier.id as keyof typeof TIER_ICON];
            const highlighted = tier.highlighted;
            return <motion.article key={tier.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: .45, delay: i * .07 }} whileHover={{ y: -4 }} className={`relative overflow-hidden rounded-[24px] border p-5 sm:p-6 ${highlighted ? "border-[oklch(0.74_0.17_162/.38)] bg-[oklch(0.16_0.02_165/.78)] shadow-[0_20px_70px_oklch(0.03_0.008_165/.32)]" : "border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/.7)]"}`}>
              {highlighted && <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[oklch(0.74_0.17_162/.1)] blur-3xl" />}
              <div className="relative flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${highlighted ? "border-[oklch(0.74_0.17_162/.4)] bg-[oklch(0.74_0.17_162/.09)]" : "border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/.65)]"}`}><Icon className={`h-4 w-4 ${highlighted ? "text-[oklch(0.85_0.19_158)]" : "text-[var(--shield-text-dim)]"}`} /></span><div><h3 className="text-base font-semibold">{tier.name}</h3><div className="text-[10px] text-[var(--shield-text-faint)]">{tier.cadence}</div></div></div>{highlighted && <span className="rounded-full border border-[oklch(0.74_0.17_162/.3)] bg-[oklch(0.74_0.17_162/.06)] px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-[oklch(0.85_0.19_158)]">Recommended</span>}</div>
              <div className="relative mt-5 text-3xl font-semibold tracking-tight text-[var(--shield-text)]">{tier.price}</div>
              <p className="relative mt-2 text-xs leading-5 text-[var(--shield-text-dim)]">{tier.tagline}</p>
              <ul className="relative mt-5 space-y-2.5">{tier.features.map((f) => <li key={f.text} className={`flex items-start gap-2.5 text-xs leading-5 ${f.included ? "text-[var(--shield-text)]" : "text-[var(--shield-text-faint)]"}`}><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${f.included ? "bg-[oklch(0.74_0.17_162/.14)] text-[oklch(0.85_0.19_158)]" : "bg-white/5"}`}>{f.included ? <Check className="h-2.5 w-2.5" /> : <span className="text-[9px]">—</span>}</span><span>{f.text}{f.agentic && f.included && <span className="ml-1.5 rounded-full border border-[oklch(0.74_0.17_162/.25)] px-1.5 py-px text-[8px] uppercase tracking-wide text-[oklch(0.85_0.19_158)]">agentic</span>}</span></li>)}</ul>
              <button type="button" onClick={onStart} className={`relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${highlighted ? "bg-[var(--shield-text)] text-[var(--shield-ink)] hover:bg-white" : "border border-[var(--shield-border)] bg-white/[.03] text-[var(--shield-text)] hover:border-[oklch(0.74_0.17_162/.35)] hover:bg-white/[.06]"}`}>{tier.cta}<Sparkles className="h-3 w-3" /></button>
            </motion.article>;
          })}
        </div>
        <div className="mt-5 text-center text-[10px] leading-5 text-[var(--shield-text-faint)]">Future partnership and affiliate models are directional product strategy, not current signed relationships or revenue.</div>
      </div>
    </section>
  );
}
