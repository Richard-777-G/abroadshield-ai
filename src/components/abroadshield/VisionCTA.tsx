"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, MapPin, Languages, Wifi } from "lucide-react";

export default function VisionCTA({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return (
    <section className="relative w-full overflow-hidden border-t border-[var(--shield-border)] bg-transparent py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 as-bg-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 as-radial-emerald opacity-70" />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="rounded-[28px] border border-[oklch(0.74_0.17_162/.2)] bg-[oklch(0.15_0.02_165/.68)] p-6 shadow-[0_24px_80px_oklch(0.03_0.008_165/.25)] sm:p-9">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/.3)] bg-[oklch(0.74_0.17_162/.06)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[oklch(0.85_0.19_158)]"><Shield className="h-3 w-3" />The vision</div>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-[-.035em] sm:text-5xl">One relationship that keeps the student moving when the journey gets difficult.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--shield-text-dim)] sm:text-base">The long-term vision is a trusted AI layer that carries context across decisions, relocation, study and the transition into work.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate?.("agent")} className="group inline-flex items-center gap-2 rounded-full bg-[var(--shield-text)] px-5 py-3 text-sm font-semibold text-[var(--shield-ink)] transition hover:-translate-y-0.5 hover:bg-white"><Shield className="h-4 w-4" />Talk to the agent<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></button>
              <button type="button" onClick={() => onNavigate?.("pricing")} className="inline-flex items-center gap-2 rounded-full border border-[var(--shield-border-strong)] bg-[oklch(0.1_0.013_165/.55)] px-5 py-3 text-sm font-semibold text-[var(--shield-text)] transition hover:-translate-y-0.5 hover:bg-[oklch(0.18_0.022_165/.7)]">See the tiers</button>
            </div>
          </div>
          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {[
              { icon: MapPin, title: "Every town", detail: "Designed for regional access." },
              { icon: Languages, title: "Language-aware", detail: "Built to expand beyond English." },
              { icon: Wifi, title: "Connection-conscious", detail: "Useful without demanding a heavy interface." },
            ].map((b) => { const Icon = b.icon; return <div key={b.title} className="flex items-center gap-3 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.09_0.012_165/.55)] px-4 py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/.3)] bg-[oklch(0.74_0.17_162/.06)]"><Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></span><div><div className="text-xs font-semibold">{b.title}</div><div className="text-[10px] text-[var(--shield-text-faint)]">{b.detail}</div></div></div>; })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
