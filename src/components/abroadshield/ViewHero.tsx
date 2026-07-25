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
      "through every leg. The trust built during a stressful visa week is still there — compounding, not resetting — when the same student sits down for a job interview two years later.",
    image: "/sections/hero-journey.png",
  },
  agent: {
    eyebrow: "Talk to the actual agent",
    title: "Ask it to",
    highlight: "do the work.",
    subtitle:
      "This isn't a scripted demo. The agent carries Aarav's full journey in memory and responds with real drafts, real checks, and real shortlists — ready for your approval.",
    image: "/sections/hero-agent.png",
  },
  countries: {
    eyebrow: "Country-specific rules baked in",
    title: "It already knows",
    highlight: "the rules.",
    subtitle:
      "The milestone-template table — country → phase → required steps. Official embassy links, visa checklists, work-hour caps, and post-study windows for 10 destinations. Pick a country to see what the agent has memorized.",
    image: "/sections/hero-countries.png",
  },
  network: {
    eyebrow: "Networking & Job Hub",
    title: "The agent doesn't just advise.",
    highlight: "It applies.",
    subtitle:
      "An always-on networking tracker — who's been contacted, who replied, who needs a nudge — plus a live job board filtered by your visa runway and sponsorship eligibility.",
    image: "/sections/hero-network.png",
  },
  connectors: {
    eyebrow: "Connectors & Integrations",
    title: "It operates every platform",
    highlight: "you need.",
    subtitle:
      "Connect the tools you already use. The agent searches, shortlists, drafts, and applies — across job portals, email, housing sites, and finance apps. Real platforms, real actions, with your approval.",
    image: "/sections/hero-connectors.png",
  },
  pricing: {
    eyebrow: "Direct-to-student, from day one",
    title: "Free for the students who need it most.",
    highlight: "Paid when the agent does the work.",
    subtitle:
      "Consultant/agency licensing was rejected twice. The model is direct-to-student — free tier for the checklist + nudges, agentic actions gated behind a paid tier.",
    image: "/sections/hero-pricing.png",
  },
};

export default function ViewHero({ viewId }: { viewId: ViewId }) {
  const config = VIEW_HEROES[viewId];

  return (
    <section className="relative w-full overflow-hidden bg-transparent pt-24 sm:pt-28">
      {/* hero image banner */}
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[180px] overflow-hidden rounded-3xl border border-[oklch(0.6_0.04_165/0.2)] sm:h-[220px]"
        >
          <img
            src={config.image}
            alt={config.title}
            className="h-full w-full object-cover opacity-50"
            loading="lazy"
          />
          {/* gradient scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.018_165/0.98)] via-[oklch(0.14_0.018_165/0.4)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.14_0.018_165/0.6)] to-transparent" />
        </motion.div>
      </div>

      {/* heading text */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative -mt-20 max-w-2xl"
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
            {config.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            {config.title}{" "}
            <span className="as-text-gradient">{config.highlight}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            {config.subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
