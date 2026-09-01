"use client";

import { motion } from "framer-motion";
import type { ViewId } from "./ViewSwitcher";

interface ViewHeroConfig {
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  eyebrow: string;
}

const VIEW_HEROES: Record<ViewId, ViewHeroConfig> = {
  journey: {
    eyebrow: "The Four-Phase Journey",
    title: "One relationship carrying",
    highlight: "the same memory",
    subtitle:
      "from planning and departure through arrival, study, work, and the transition into a career. What the student builds in one phase remains useful in the next.",
    image: "/sections/hero-journey.png",
  },
  agent: {
    eyebrow: "Talk to the actual agent",
    title: "Ask it to",
    highlight: "do the work.",
    subtitle:
      "This isn't a scripted demo. The agent carries the student's journey in memory and responds with real drafts, real checks, and real shortlists — ready for review and approval.",
    image: "/sections/hero-agent.png",
  },
  countries: {
    eyebrow: "Country-specific rules",
    title: "It already knows",
    highlight: "the rules.",
    subtitle:
      "Visa requirements, official guidance, work restrictions, and post-study pathways are organized around the destination — so advice stays grounded in the student's actual route.",
    image: "/sections/hero-countries.png",
  },
  network: {
    eyebrow: "Networking & Job Hub",
    title: "The agent doesn't just advise.",
    highlight: "It helps you act.",
    subtitle:
      "Track networking, surface relevant opportunities, and prioritize roles around the student's profile, visa runway, and sponsorship requirements — with the student in control.",
    image: "/sections/hero-network.png",
  },
  connectors: {
    eyebrow: "Connectors & Integrations",
    title: "It works across",
    highlight: "the platforms you use.",
    subtitle:
      "Connect the tools that matter. The agent can search, shortlist, prepare, and coordinate work across connected platforms — with approval at the points that matter.",
    image: "/sections/hero-connectors.png",
  },
  pricing: {
    eyebrow: "Direct-to-student",
    title: "Start with the guidance you need.",
    highlight: "Pay when the work expands.",
    subtitle:
      "The model is built around students rather than agencies: useful guidance and planning first, with deeper agentic work available when it creates enough value to justify the upgrade.",
    image: "/sections/hero-pricing.png",
  },
};

export default function ViewHero({ viewId }: { viewId: ViewId }) {
  const config = VIEW_HEROES[viewId];

  return (
    <section className="relative w-full overflow-hidden bg-transparent pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[160px] overflow-hidden rounded-2xl border border-[oklch(0.6_0.04_165/0.2)] bg-[oklch(0.18_0.02_165/0.5)] sm:h-[200px]"
        >
          <img
            src={config.image}
            alt=""
            className="h-full w-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.018_165/0.92)] via-[oklch(0.14_0.018_165/0.2)] to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-7 max-w-3xl"
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
            {config.eyebrow}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">
            {config.title}{" "}
            <span className="as-text-gradient">{config.highlight}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            {config.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
