"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Lock, Crown } from "lucide-react";
import { TIERS } from "./data";
import Reveal from "./Reveal";

const TIER_ICON = {
  free: Lock,
  shield: Sparkles,
  jobsuccess: Crown,
} as const;

export default function PricingTiers() {
  return (
    <section id="pricing" className="relative w-full bg-transparent py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.8_0.15_80/0.35)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* heading */}
        <Reveal className="mb-12 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.8_0.15_80)]">
            <span className="h-px w-8 bg-[oklch(0.8_0.15_80/0.5)]" />
            Direct-to-student, from day one
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            Free for the students who need it most.{" "}
            <span className="as-text-gradient-amber">Paid when the agent does the work.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            Consultant/agency licensing was proposed twice and rejected twice. The model is
            direct-to-student — free tier for the checklist + nudges, agentic actions gated
            behind a paid tier that unlocks the moment the agent starts doing real work.
          </p>
        </Reveal>

        {/* tiers */}
        <div className="grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier, i) => {
            const Icon = TIER_ICON[tier.id as keyof typeof TIER_ICON];
            const highlighted = tier.highlighted;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className={`as-card-hover relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${
                  highlighted
                    ? "as-gradient-border border-transparent as-glass-strong as-glow-emerald"
                    : "border-[var(--shield-border)] as-glass"
                }`}
              >
                {highlighted && (
                  <>
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[oklch(0.74_0.17_162/0.15)] blur-3xl" />
                    <div className="absolute right-5 top-5">
                      <span className="rounded-full border border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.15)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[oklch(0.85_0.19_158)]">
                        Most chosen
                      </span>
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                        highlighted
                          ? "border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)]"
                          : "border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)]"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          highlighted
                            ? "text-[oklch(0.85_0.19_158)]"
                            : "text-[var(--shield-text-dim)]"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--shield-text)]">
                        {tier.name}
                      </h3>
                      <div className="text-[11px] text-[var(--shield-text-dim)]">
                        {tier.cadence}
                      </div>
                    </div>
                  </div>

                  {/* price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-semibold tracking-tight ${
                        highlighted
                          ? "text-[oklch(0.85_0.19_158)]"
                          : "text-[var(--shield-text)]"
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span className="text-sm text-[var(--shield-text-dim)]">
                      {tier.cadence.includes("month") ? "" : ""}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)]">
                    {tier.tagline}
                  </p>

                  {/* features */}
                  <ul className="mt-6 space-y-2.5">
                    {tier.features.map((f) => (
                      <li
                        key={f.text}
                        className={`flex items-start gap-2.5 text-sm ${
                          f.included ? "text-[var(--shield-text)]" : "text-[var(--shield-text-dim)] opacity-60"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            f.included
                              ? "bg-[oklch(0.74_0.17_162/0.2)] text-[oklch(0.85_0.19_158)]"
                              : "bg-[oklch(0.3_0.02_220/0.6)] text-[var(--shield-text-dim)]"
                          }`}
                        >
                          {f.included ? (
                            <Check className="h-2.5 w-2.5" />
                          ) : (
                            <span className="text-[10px]">✕</span>
                          )}
                        </span>
                        <span className="leading-relaxed">
                          {f.text}
                          {f.agentic && f.included && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.08)] px-1.5 py-px text-[9px] font-semibold uppercase text-[oklch(0.85_0.19_158)]">
                              <Sparkles className="h-2 w-2" />
                              agentic
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* cta */}
                  <button
                    className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${
                      highlighted
                        ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165))] hover:bg-[oklch(0.85_0.19_158)] as-glow-emerald"
                        : "border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] text-[var(--shield-text)] hover:border-[oklch(0.74_0.17_162/0.4)] hover:bg-[oklch(0.24_0.028_165/0.7)]"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* footnote */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs text-[var(--shield-text-dim)]">
          <span>· Affiliate commissions on insurance, forex, SIM, housing — no added cost to the student</span>
          <span>· No consultant / agency licensing, ever</span>
          <span>· Future partnerships kept separate from near-term revenue</span>
        </div>
      </div>
    </section>
  );
}
