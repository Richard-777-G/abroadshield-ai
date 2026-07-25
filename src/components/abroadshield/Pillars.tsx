"use client";

import { motion } from "framer-motion";
import { PILLARS } from "./data";
import Reveal from "./Reveal";

export default function Pillars() {
  return (
    <section className="relative w-full bg-transparent py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.64_0.16_300/0.3)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-12 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.78_0.16_300)]">
            <span className="h-px w-8 bg-[oklch(0.64_0.16_300/0.5)]" />
            Why not just use Claude or ChatGPT?
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            Four pillars that survived{" "}
            <span className="text-[oklch(0.78_0.16_300)]">pressure-testing</span> across multiple models.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            The honest correction: general assistants <em>do</em> have persistent memory
            today. The differentiation isn&apos;t that they forget — it&apos;s that they are
            general-purpose, reactive by default, and not structured around one
            country&apos;s rules or one student&apos;s specific deadlines.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-3xl border border-[var(--shield-border)] as-glass p-6 transition hover:border-[oklch(0.74_0.17_162/0.4)]"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[oklch(0.74_0.17_162/0.12)] blur-2xl transition group-hover:bg-[oklch(0.74_0.17_162/0.2)]" />
                <div className="relative">
                  <div className="font-mono text-[11px] tracking-wider text-[var(--shield-text-dim)]">
                    PILLAR 0{i + 1}
                  </div>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)]">
                    <Icon className="h-5 w-5 text-[oklch(0.85_0.19_158)]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--shield-text)]">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--shield-text-dim)]">
                    {p.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* moat strip */}
        <div className="mt-8 rounded-3xl border border-[var(--shield-border)] as-glass p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { k: "Distribution", v: "Real, strongest today — tier-2/3 towns, regional languages", tone: "emerald" },
              { k: "Workflow lock-in", v: "Plausible — becomes real once full history lives here", tone: "amber" },
              { k: "Data moat", v: "Doesn't exist yet — built by tracking real outcomes", tone: "violet" },
              { k: "Compliance", v: "Thin but real — country-specific visa rules", tone: "cyan" },
              { k: "Brand & trust", v: "Earned over time — builds with consistent delivery", tone: "emerald" },
            ].map((m) => (
              <div key={m.k}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)]">
                  {m.k}
                </div>
                <div className="mt-1.5 text-sm leading-relaxed text-[var(--shield-text-dim)]">
                  {m.v}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-[var(--shield-border)] pt-4 text-xs text-[var(--shield-text-dim)]">
            <span className="font-semibold text-[var(--shield-text)]">Verdict:</span> build
            the boring infrastructure first — the state machine and outbound nudge engine
            — not the personality. The sequencing and tracking engine is the hard,
            defensible part.
          </div>
        </div>
      </div>
    </section>
  );
}
