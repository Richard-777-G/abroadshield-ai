"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plug,
  Briefcase,
  Mail,
  Home,
  GraduationCap,
  Plane,
  CreditCard,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Zap,
  ArrowRight,
  Link2,
} from "lucide-react";
import Reveal from "./Reveal";

interface Connector {
  id: string;
  name: string;
  category: "jobs" | "email" | "housing" | "education" | "travel" | "finance" | "apps";
  url: string;
  description: string;
  agentAction: string;
  phase: string;
  logo: string; // emoji or short text as a lightweight logo
  logoColor: string;
}

const CONNECTORS: Connector[] = [
  // Jobs
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "jobs",
    url: "https://linkedin.com",
    description: "Professional network — the agent finds alumni, hiring managers, and sponsored roles.",
    agentAction: "Agent scans openings, drafts outreach messages, tracks follow-ups",
    phase: "Job Success",
    logo: "in",
    logoColor: "#0A66C2",
  },
  {
    id: "indeed",
    name: "Indeed",
    category: "jobs",
    url: "https://indeed.com",
    description: "Job board — the agent filters by sponsorship eligibility and match score.",
    agentAction: "Agent shortlists sponsored roles, tailors your CV per application",
    phase: "Job Success",
    logo: "✦",
    logoColor: "#2557A7",
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    category: "jobs",
    url: "https://glassdoor.com",
    description: "Salaries, reviews, interview prep — the agent builds your prep deck per role.",
    agentAction: "Agent pulls salary data + interview questions per role",
    phase: "Job Success",
    logo: "G",
    logoColor: "#0CAA41",
  },
  {
    id: "handshake",
    name: "Handshake",
    category: "jobs",
    url: "https://joinhandshake.com",
    description: "University career portal — on-campus roles that fit your work-hour cap.",
    agentAction: "Agent flags on-campus roles within your 20-hr cap",
    phase: "Studying",
    logo: "H",
    logoColor: "#8E1FE8",
  },
  // Email
  {
    id: "gmail",
    name: "Gmail",
    category: "email",
    url: "https://gmail.com",
    description: "The agent drafts consulate, landlord, and bank emails — you approve, it sends.",
    agentAction: "Agent drafts + sends approved emails on your behalf",
    phase: "All phases",
    logo: "✉",
    logoColor: "#EA4335",
  },
  {
    id: "outlook",
    name: "Outlook",
    category: "email",
    url: "https://outlook.com",
    description: "University email — the agent tracks supervisor and admin correspondence.",
    agentAction: "Agent tracks thread status + drafts replies",
    phase: "Studying",
    logo: "O",
    logoColor: "#0078D4",
  },
  // Housing
  {
    id: "rightmove",
    name: "Rightmove",
    category: "housing",
    url: "https://rightmove.co.uk",
    description: "UK housing — the agent shortlists by budget, commute, and bills-included.",
    agentAction: "Agent filters 5 listings matching £650/mo + 35-min commute",
    phase: "Arrival",
    logo: "R",
    logoColor: "#00DEB6",
  },
  {
    id: "spareroom",
    name: "SpareRoom",
    category: "housing",
    url: "https://spareroom.co.uk",
    description: "Flatshare — the agent drafts viewing requests in your approved tone.",
    agentAction: "Agent drafts landlord messages, ready for your approval",
    phase: "Arrival",
    logo: "S",
    logoColor: "#FF6B35",
  },
  {
    id: "zoopla",
    name: "Zoopla",
    category: "housing",
    url: "https://zoopla.com",
    description: "Property comparison — the agent compares listings by total cost, not markup.",
    agentAction: "Agent shortlists by total monthly cost including bills",
    phase: "Arrival",
    logo: "Z",
    logoColor: "#1FB6FF",
  },
  // Education
  {
    id: "ucas",
    name: "UCAS",
    category: "education",
    url: "https://ucas.com",
    description: "UK university applications — the agent tracks your CAS and enrollment.",
    agentAction: "Agent tracks CAS letter status + enrollment deadline",
    phase: "Pre-Departure",
    logo: "U",
    logoColor: "#00529C",
  },
  {
    id: "university-portal",
    name: "University Portal",
    category: "education",
    url: "#",
    description: "Your university's portal — the agent tracks coursework + academic deadlines.",
    agentAction: "Agent blocks your calendar before coursework deadlines",
    phase: "Studying",
    logo: "🎓",
    logoColor: "#8B5CF6",
  },
  // Travel
  {
    id: "skyscanner",
    name: "Skyscanner",
    category: "travel",
    url: "https://skyscanner.com",
    description: "Flights — the agent tracks the booking window and alerts on price drops.",
    agentAction: "Agent monitors flight prices + alerts on optimal booking window",
    phase: "Pre-Departure",
    logo: "✈",
    logoColor: "#0770E3",
  },
  // Finance
  {
    id: "wise",
    name: "Wise",
    category: "finance",
    url: "https://wise.com",
    description: "Forex + multi-currency — the agent compares today's rate vs markup.",
    agentAction: "Agent shortlists forex providers by total cost, not markup",
    phase: "Pre-Departure",
    logo: "W",
    logoColor: "#9FE870",
  },
  {
    id: "revolut",
    name: "Revolut",
    category: "finance",
    url: "https://revolut.com",
    description: "Student account + spending tracker — the agent logs every transaction.",
    agentAction: "Agent tracks spend vs your remaining runway weekly",
    phase: "Studying",
    logo: "R",
    logoColor: "#0075EB",
  },
  // Apps
  {
    id: "whatsapp",
    name: "WhatsApp",
    category: "apps",
    url: "https://whatsapp.com",
    description: "The agent's primary channel — proactive deadline nudges, opt-in required.",
    agentAction: "Agent sends Utility-category nudges before deadlines",
    phase: "All phases",
    logo: "💬",
    logoColor: "#25D366",
  },
  {
    id: "notion",
    name: "Notion",
    category: "apps",
    url: "https://notion.so",
    description: "Your journey hub — the agent syncs your checklist + memory vault.",
    agentAction: "Agent syncs your checklist status + memory items",
    phase: "All phases",
    logo: "N",
    logoColor: "#FFFFFF",
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Plug },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "email", label: "Email", icon: Mail },
  { id: "housing", label: "Housing", icon: Home },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "finance", label: "Finance", icon: CreditCard },
  { id: "apps", label: "Apps", icon: Smartphone },
] as const;

export default function Connectors() {
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const askAgentToAct = (connector: { name: string; agentAction: string; phase: string }) => {
    // Dispatch a custom event that the AgentChat can listen to for pre-filling
    const prompt = `Act on ${connector.name}: ${connector.agentAction}. Phase: ${connector.phase}.`;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("abroadshield:prefill-chat", { detail: prompt }));
      window.dispatchEvent(new CustomEvent("abroadshield:navigate", { detail: "agent" }));
    }
  };

  const visible = filter === "all" ? CONNECTORS : CONNECTORS.filter((c) => c.category === filter);

  return (
    <section id="connectors" className="relative w-full bg-transparent py-20 sm:py-28 scroll-mt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.17_162/0.35)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* heading */}
        <Reveal className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
            <Plug className="h-3.5 w-3.5" />
            Connectors &amp; Integrations
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            The agent doesn&apos;t just advise.{" "}
            <span className="as-text-gradient">It operates every platform you need.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            Connect the tools you already use. The agent searches, shortlists, drafts, and applies —
            across job portals, email, housing sites, and finance apps. Real platforms, real
            actions, with your approval at every step. Click any connector to see what the agent does
            with it.
          </p>
        </Reveal>

        {/* category filter */}
        <Reveal delay={0.1} className="mb-6">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const active = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-[oklch(0.74_0.17_162/0.5)] bg-[oklch(0.74_0.17_162/0.12)] text-[oklch(0.85_0.19_158)]"
                      : "border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.4)] text-[var(--shield-text-dim)] hover:border-[oklch(0.74_0.17_162/0.3)] hover:text-[var(--shield-text)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* connectors grid */}
        <Reveal delay={0.15}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c, i) => {
              const isOpen = openId === c.id;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="as-card-hover overflow-hidden rounded-2xl border border-[var(--shield-border)] as-glass"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : c.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    {/* logo */}
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--shield-border)] text-sm font-bold"
                      style={{
                        background: `${c.logoColor}15`,
                        color: c.logoColor,
                        borderColor: `${c.logoColor}40`,
                      }}
                    >
                      {c.logo}
                    </span>
                    {/* info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--shield-text)]">
                          {c.name}
                        </span>
                        <span className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-[var(--shield-text-dim)]">
                          {c.category}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-[var(--shield-text-dim)]">
                        {c.description}
                      </div>
                    </div>
                    {/* connected badge */}
                    <span className="flex shrink-0 items-center gap-1 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[oklch(0.85_0.19_158)]">
                      <Link2 className="h-2.5 w-2.5" />
                      Connected
                    </span>
                  </button>

                  {/* expandable agent-action panel */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[var(--shield-border)] bg-[oklch(0.74_0.17_162/0.05)] p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.1)]">
                              <Zap className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                            </span>
                            <div className="flex-1">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)]">
                                What the agent does here
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-[var(--shield-text)]">
                                {c.agentAction}
                              </p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-2 py-0.5 text-[10px] font-medium text-[var(--shield-text-dim)]">
                                  Phase: {c.phase}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.98_0.005_160)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-white"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Open {c.name}
                                </a>
                                <button
                                  onClick={() => askAgentToAct(c)}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.85_0.19_158)] transition hover:bg-[oklch(0.74_0.17_162/0.18)]"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Ask agent to act
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        {/* footer note */}
        <Reveal delay={0.2}>
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--shield-border)] p-4 text-center">
            <p className="text-xs text-[var(--shield-text-dim)]">
              <Plug className="mr-1.5 inline h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" />
              {CONNECTORS.length} platforms connected. The agent operates them with your approval —
              nothing leaves without your one-tap sign-off.{" "}
              <span className="font-semibold text-[oklch(0.85_0.19_158)]">
                Real platforms, real actions.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
