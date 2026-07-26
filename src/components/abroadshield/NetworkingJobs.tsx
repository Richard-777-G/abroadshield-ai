"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  Mail,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Building2,
  Send,
  UserCheck,
  Network,
  Target,
  TrendingUp,
} from "lucide-react";
import Reveal from "./Reveal";

interface NetworkContact {
  id: string;
  name: string;
  role: string;
  company: string;
  status: "replied" | "pending" | "follow-up" | "connected";
  lastTouch: string;
  agentAction: string;
}

interface JobApp {
  id: string;
  role: string;
  company: string;
  location: string;
  sponsored: boolean;
  status: "applied" | "interview" | "offer" | "rejected" | "drafting";
  match: number;
  deadline: string;
}

const CONTACTS: NetworkContact[] = [
  {
    id: "c1",
    name: "Priya Sharma",
    role: "Senior Data Engineer",
    company: "BBC",
    status: "replied",
    lastTouch: "2d ago",
    agentAction: "Agent drafted follow-up nudge — awaiting your approval",
  },
  {
    id: "c2",
    name: "Marcus Chen",
    role: "ML Engineer",
    company: "Monzo",
    status: "connected",
    lastTouch: "5d ago",
    agentAction: "Coffee chat scheduled for next Tuesday",
  },
  {
    id: "c3",
    name: "Dr. Aisha Patel",
    role: "University Alumni Mentor",
    company: "UoM Alumni Network",
    status: "pending",
    lastTouch: "7d ago",
    agentAction: "Agent drafted introduction message — ready to send",
  },
  {
    id: "c4",
    name: "James O'Connor",
    role: "Hiring Manager — Solutions Eng",
    company: "AWS Manchester",
    status: "follow-up",
    lastTouch: "11d ago",
    agentAction: "Agent flagged: reply pending > 5 days. Follow-up draft ready.",
  },
  {
    id: "c5",
    name: "Sofia Rodrigues",
    role: "Talent Acquisition",
    company: "Booking.com",
    status: "replied",
    lastTouch: "1d ago",
    agentAction: "Agent confirmed your interview slot — 14 Aug 10:00",
  },
];

const JOBS: JobApp[] = [
  {
    id: "j1",
    role: "Solutions Engineer",
    company: "AWS",
    location: "Manchester, UK",
    sponsored: true,
    status: "interview",
    match: 92,
    deadline: "Interview 14 Aug",
  },
  {
    id: "j2",
    role: "Data Engineer (Grad)",
    company: "BBC",
    location: "Salford, UK",
    sponsored: true,
    status: "applied",
    match: 88,
    deadline: "Applied 3d ago",
  },
  {
    id: "j3",
    role: "ML Engineer",
    company: "Monzo",
    location: "London, UK",
    sponsored: true,
    status: "drafting",
    match: 85,
    deadline: "Closes in 4d",
  },
  {
    id: "j4",
    role: "Backend Developer",
    company: "Revolut",
    location: "London, UK",
    sponsored: true,
    status: "applied",
    match: 79,
    deadline: "Applied 1w ago",
  },
  {
    id: "j5",
    role: "Junior Data Scientist",
    company: "Local café (unverified)",
    location: "Manchester, UK",
    sponsored: false,
    status: "rejected",
    match: 0,
    deadline: "Agent blocked — no sponsorship",
  },
  {
    id: "j6",
    role: "Analytics Consultant",
    company: "Deloitte",
    location: "Manchester, UK",
    sponsored: true,
    status: "offer",
    match: 90,
    deadline: "Offer received — 12 days to accept",
  },
];

const STATUS_STYLE: Record<
  string,
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  replied: {
    label: "Replied",
    text: "text-[oklch(0.85_0.19_158)]",
    bg: "bg-[oklch(0.74_0.17_162/0.1)]",
    border: "border-[oklch(0.74_0.17_162/0.4)]",
    dot: "bg-[oklch(0.74_0.17_162)]",
  },
  pending: {
    label: "Pending",
    text: "text-[oklch(0.86_0.17_80)]",
    bg: "bg-[oklch(0.8_0.15_80/0.1)]",
    border: "border-[oklch(0.8_0.15_80/0.4)]",
    dot: "bg-[oklch(0.8_0.15_80)]",
  },
  "follow-up": {
    label: "Follow-up",
    text: "text-[oklch(0.86_0.17_80)]",
    bg: "bg-[oklch(0.8_0.15_80/0.1)]",
    border: "border-[oklch(0.8_0.15_80/0.4)]",
    dot: "bg-[oklch(0.8_0.15_80)]",
  },
  connected: {
    label: "Connected",
    text: "text-[oklch(0.82_0.13_210)]",
    bg: "bg-[oklch(0.74_0.13_210/0.1)]",
    border: "border-[oklch(0.74_0.13_210/0.4)]",
    dot: "bg-[oklch(0.74_0.13_210)]",
  },
  applied: {
    label: "Applied",
    text: "text-[oklch(0.85_0.19_158)]",
    bg: "bg-[oklch(0.74_0.17_162/0.1)]",
    border: "border-[oklch(0.74_0.17_162/0.4)]",
    dot: "bg-[oklch(0.74_0.17_162)]",
  },
  interview: {
    label: "Interview",
    text: "text-[oklch(0.86_0.17_80)]",
    bg: "bg-[oklch(0.8_0.15_80/0.1)]",
    border: "border-[oklch(0.8_0.15_80/0.4)]",
    dot: "bg-[oklch(0.8_0.15_80)]",
  },
  offer: {
    label: "Offer",
    text: "text-[oklch(0.82_0.13_210)]",
    bg: "bg-[oklch(0.74_0.13_210/0.1)]",
    border: "border-[oklch(0.74_0.13_210/0.4)]",
    dot: "bg-[oklch(0.74_0.13_210)]",
  },
  rejected: {
    label: "Blocked",
    text: "text-[oklch(0.72_0.19_22)]",
    bg: "bg-[oklch(0.66_0.19_22/0.1)]",
    border: "border-[oklch(0.66_0.19_22/0.4)]",
    dot: "bg-[oklch(0.66_0.19_22)]",
  },
  drafting: {
    label: "Drafting",
    text: "text-[oklch(0.85_0.19_158)]",
    bg: "bg-[oklch(0.74_0.17_162/0.1)]",
    border: "border-[oklch(0.74_0.17_162/0.4)]",
    dot: "bg-[oklch(0.74_0.17_162)]",
  },
};

type Tab = "network" | "jobs";

export default function NetworkingJobs() {
  const [tab, setTab] = useState<Tab>("network");
  const [openId, setOpenId] = useState<string | null>(null);

  const replied = CONTACTS.filter((c) => c.status === "replied" || c.status === "connected").length;
  const pending = CONTACTS.filter((c) => c.status === "pending" || c.status === "follow-up").length;
  const applied = JOBS.filter((j) => j.status === "applied" || j.status === "interview").length;
  const offers = JOBS.filter((j) => j.status === "offer").length;
  const sponsored = JOBS.filter((j) => j.sponsored).length;

  return (
    <section id="network" className="relative w-full bg-transparent py-20 sm:py-28 scroll-mt-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.13_210/0.35)] to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* heading */}
        <Reveal className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.82_0.13_210)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.13_210/0.5)]" />
            <Network className="h-3.5 w-3.5" />
            Networking &amp; Job Hub
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            The agent doesn&apos;t just advise.{" "}
            <span className="as-text-gradient">It applies.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            An always-on networking tracker — who&apos;s been contacted, who replied, who needs a
            nudge — plus a live job board filtered by your visa runway and sponsorship eligibility.
            Click any row to see what the agent is doing about it.
          </p>
        </Reveal>

        {/* stats */}
        <Reveal delay={0.1} className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-2xl">
            <StatCard icon={Users} label="Network replied" value={replied} tone="emerald" />
            <StatCard icon={Clock} label="Pending follow-up" value={pending} tone="amber" />
            <StatCard icon={Briefcase} label="Applications live" value={applied} tone="emerald" />
            <StatCard icon={Target} label="Offers received" value={offers} tone="cyan" />
          </div>
        </Reveal>

        {/* tab toggle */}
        <div className="mb-6 inline-flex rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-1">
          <TabButton active={tab === "network"} onClick={() => setTab("network")} icon={Users}>
            Networking ({CONTACTS.length})
          </TabButton>
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={Briefcase}>
            Job Applications ({JOBS.length})
          </TabButton>
        </div>

        {/* lists */}
        <Reveal delay={0.15}>
          <div className="space-y-2">
            {tab === "network" &&
              CONTACTS.map((c, i) => {
                const style = STATUS_STYLE[c.status];
                const isOpen = openId === c.id;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : c.id)}
                      className="as-card-hover flex w-full items-center gap-3 rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3 text-left"
                    >
                      {/* avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[oklch(0.74_0.13_210/0.3)] bg-[oklch(0.74_0.13_210/0.1)] text-xs font-semibold text-[oklch(0.82_0.13_210)]">
                        {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      {/* info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--shield-text)]">{c.name}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style.border} ${style.bg} ${style.text}`}>
                            <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-xs text-[var(--shield-text-dim)]">
                          {c.role} · {c.company}
                        </div>
                      </div>
                      {/* last touch */}
                      <div className="shrink-0 text-right">
                        <div className="flex items-center justify-end gap-1 text-[11px] text-[var(--shield-text-dim)]">
                          <Clock className="h-3 w-3" />
                          {c.lastTouch}
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 rounded-2xl border border-[oklch(0.74_0.17_162/0.25)] bg-[oklch(0.74_0.17_162/0.06)] p-4">
                            <div className="flex items-start gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[oklch(0.74_0.17_162/0.3)] bg-[oklch(0.74_0.17_162/0.1)]">
                                <Mail className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                              </span>
                              <div className="flex-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.19_158)]">
                                  Agent action
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-[var(--shield-text)]">
                                  {c.agentAction}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.74_0.17_162)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.85_0.19_158)]">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Approve draft
                                  </button>
                                  <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-3 py-1.5 text-xs font-medium text-[var(--shield-text)] transition hover:border-[oklch(0.74_0.17_162/0.4)]">
                                    <Mail className="h-3.5 w-3.5" />
                                    View thread
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

            {tab === "jobs" &&
              JOBS.map((j, i) => {
                const style = STATUS_STYLE[j.status];
                const isOpen = openId === j.id;
                return (
                  <motion.div
                    key={j.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : j.id)}
                      className="as-card-hover flex w-full items-center gap-3 rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3 text-left"
                    >
                      {/* company icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/0.6)]">
                        <Building2 className="h-4 w-4 text-[oklch(0.82_0.13_210)]" />
                      </div>
                      {/* info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--shield-text)]">{j.role}</span>
                          {j.sponsored ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[oklch(0.85_0.19_158)]">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Sponsored
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-[oklch(0.66_0.19_22/0.4)] bg-[oklch(0.66_0.19_22/0.1)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[oklch(0.72_0.19_22)]">
                              No sponsorship
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-[var(--shield-text-dim)]">
                          {j.company} · {j.location}
                        </div>
                      </div>
                      {/* match + status */}
                      <div className="flex shrink-0 items-center gap-3">
                        {j.match > 0 && (
                          <div className="text-right">
                            <div className="text-xs font-semibold text-[oklch(0.85_0.19_158)]">{j.match}%</div>
                            <div className="text-[9px] text-[var(--shield-text-dim)]">match</div>
                          </div>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style.border} ${style.bg} ${style.text}`}>
                          <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1 rounded-2xl border border-[oklch(0.74_0.13_210/0.25)] bg-[oklch(0.74_0.13_210/0.06)] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_210)]">
                                  {j.deadline}
                                </div>
                                <p className="mt-1 text-sm text-[var(--shield-text)]">
                                  {j.sponsored
                                    ? "Agent confirmed this employer sponsors visas. CV tailored for this role is ready for review."
                                    : "Agent flagged: this employer does not appear on the sponsor register. Application blocked to protect your time."}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {j.status === "offer" ? (
                                  <button className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.74_0.13_210)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.82_0.13_210)]">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Review offer
                                  </button>
                                ) : (
                                  <>
                                    <button className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.74_0.17_162)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.85_0.19_158)]">
                                      <Send className="h-3.5 w-3.5" />
                                      {j.status === "drafting" ? "Review draft" : "Tailor CV"}
                                    </button>
                                    <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] px-3 py-1.5 text-xs font-medium text-[var(--shield-text)] transition hover:border-[oklch(0.74_0.13_210/0.4)]">
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                      View JD
                                    </button>
                                  </>
                                )}
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
              <TrendingUp className="mr-1.5 inline h-3.5 w-3.5 text-[oklch(0.85_0.19_158)]" />
              {sponsored} of {JOBS.length} roles confirmed visa-sponsored. The agent re-ranks
              shortlists by sponsorship likelihood to protect your visa runway.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: "emerald" | "amber" | "cyan";
}) {
  const toneMap = {
    emerald: "text-[oklch(0.85_0.19_158)]",
    amber: "text-[oklch(0.86_0.17_80)]",
    cyan: "text-[oklch(0.82_0.13_210)]",
  };
  return (
    <div className="rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3">
      <Icon className={`h-4 w-4 ${toneMap[tone]}`} />
      <div className="mt-1.5 text-2xl font-semibold text-[var(--shield-text)]">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--shield-text-dim)]">{label}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: typeof Users;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-[oklch(0.74_0.13_210)] text-[oklch(0.14_0.018_165)]"
          : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
