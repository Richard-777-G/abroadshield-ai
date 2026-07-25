"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, MapPin, Languages, Wifi } from "lucide-react";

export default function VisionCTA() {
  return (
    <section className="relative w-full overflow-hidden bg-transparent py-24 sm:py-32">
      {/* background layers */}
      <div className="pointer-events-none absolute inset-0 as-bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 as-radial-emerald" />
      <div className="pointer-events-none absolute inset-0 as-noise" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-[oklch(0.74_0.17_162/0.15)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-[oklch(0.8_0.15_80/0.12)] blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.08)] px-3 py-1 text-[11px] font-medium tracking-wide text-[oklch(0.85_0.19_158)]">
            <Shield className="h-3 w-3" />
            The vision
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--shield-text)] sm:text-5xl lg:text-6xl">
            Success is a student, at a hard moment in an unfamiliar country, turning to the
            same AI that got them through their{" "}
            <span className="as-text-gradient">visa</span> — because it already knows their
            story.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--shield-text-dim)]">
            Built for the full size of the real market — including tier-2 and tier-3
            towns, regional languages, slower connections, and families for whom this is the
            single largest financial decision they will ever make.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#agent"
              className="group inline-flex items-center gap-2 rounded-full bg-[oklch(0.74_0.17_162)] px-6 py-3.5 text-sm font-semibold text-[oklch(0.14_0.018_165))] transition hover:bg-[oklch(0.85_0.19_158)] as-glow-emerald"
            >
              <Shield className="h-4 w-4" />
              Talk to the agent
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[oklch(0.24_0.028_165/0.6)] px-6 py-3.5 text-sm font-semibold text-[var(--shield-text)] backdrop-blur transition hover:border-[oklch(0.74_0.17_162/0.5)]"
            >
              See the tiers
            </a>
          </div>

          {/* built-for badges */}
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: MapPin, title: "Every town", detail: "Not just the metro. Tier-2 & tier-3 first." },
              { icon: Languages, title: "Language they trust", detail: "Marathi, Hindi, Tamil — and counting." },
              { icon: Wifi, title: "Slow-connection ready", detail: "Lightweight nudges, not heavy web apps." },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)]">
                    <Icon className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--shield-text)]">
                      {b.title}
                    </div>
                    <div className="text-[11px] text-[var(--shield-text-dim)]">
                      {b.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
