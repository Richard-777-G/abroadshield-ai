"use client";

import { useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Reveal from "./Reveal";

type PermissionMode = "review" | "batch";

const STARTER_QUEUE = [
  {
    id: "job-1",
    role: "Data Analyst Graduate Scheme",
    company: "Sponsor-eligible employer",
    status: "Needs your profile",
  },
  {
    id: "job-2",
    role: "Junior Software Engineer",
    company: "Sponsor-eligible employer",
    status: "Waiting for research",
  },
  {
    id: "job-3",
    role: "Business Intelligence Analyst",
    company: "Sponsor-eligible employer",
    status: "Waiting for research",
  },
];

export default function JobOperations() {
  const [roles, setRoles] = useState("Data, software, and analytics roles");
  const [location, setLocation] = useState("Manchester, United Kingdom");
  const [permission, setPermission] = useState<PermissionMode>("review");
  const [queueStarted, setQueueStarted] = useState(false);

  return (
    <section className="relative w-full bg-transparent py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.85_0.19_158)]">
            <span className="h-px w-8 bg-[oklch(0.74_0.17_162/0.5)]" />
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Job Operations Agent
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-5xl">
            Give the agent a target.
            <span className="as-text-gradient"> It builds the work queue.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)] sm:text-base">
            This is the control room for your job-search operation. Set the target, choose
            the permission level, and let AbroadShield research, rank, and prepare work for
            your review.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-[var(--shield-border)] as-glass p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.74_0.17_162/0.13)]">
                  <Search className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--shield-text)]">Search brief</h3>
                  <p className="text-xs text-[var(--shield-text-dim)]">
                    The agent uses this to decide what to research.
                  </p>
                </div>
              </div>

              <label className="mt-5 block text-xs font-medium text-[var(--shield-text)]">
                Roles and skills
                <input
                  value={roles}
                  onChange={(event) => setRoles(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.7)] px-3 py-2.5 text-sm text-[var(--shield-text)] outline-none transition focus:border-[oklch(0.74_0.17_162/0.7)]"
                />
              </label>

              <label className="mt-4 block text-xs font-medium text-[var(--shield-text)]">
                Preferred location
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.7)] px-3 py-2.5 text-sm text-[var(--shield-text)] outline-none transition focus:border-[oklch(0.74_0.17_162/0.7)]"
                />
              </label>

              <div className="mt-5">
                <p className="text-xs font-medium text-[var(--shield-text)]">Sending permission</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <PermissionCard
                    active={permission === "review"}
                    title="Review every application"
                    description="The safest starting point. The agent prepares; you approve."
                    onClick={() => setPermission("review")}
                  />
                  <PermissionCard
                    active={permission === "batch"}
                    title="Controlled batch approval"
                    description="You approve a small pre-set batch after reviewing its rules."
                    onClick={() => setPermission("batch")}
                  />
                </div>
              </div>

              <button
                onClick={() => setQueueStarted(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-4 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-[oklch(0.85_0.19_158)]"
              >
                <Sparkles className="h-4 w-4" />
                Start the research queue
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="rounded-3xl border border-[oklch(0.74_0.13_210/0.3)] bg-[oklch(0.74_0.13_210/0.06)] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[oklch(0.82_0.13_210)]" />
                <h3 className="text-sm font-semibold text-[var(--shield-text)]">What the agent will do</h3>
              </div>
              <ol className="mt-4 space-y-3">
                <WorkflowStep number="01" title="Research" text={"Find opportunities matching " + roles + " in " + location + "."} />
                <WorkflowStep number="02" title="Protect" text="Check location, deadline, visa fit, and duplicate applications." />
                <WorkflowStep number="03" title="Prepare" text="Draft a tailored CV, cover letter, and application answers." />
                <WorkflowStep
                  number="04"
                  title="Ask permission"
                  text={permission === "review"
                    ? "Pause every application for your approval."
                    : "Group only eligible applications into a small review batch."}
                />
              </ol>
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-[oklch(0.74_0.17_162/0.22)] bg-[oklch(0.74_0.17_162/0.07)] p-3 text-xs leading-relaxed text-[var(--shield-text-dim)]">
                <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.85_0.19_158)]" />
                The agent cannot submit applications or send messages until your account, permissions, and connected services are set up.
              </div>
            </div>
          </Reveal>
        </div>

        {queueStarted && (
          <Reveal delay={0.05}>
            <div className="mt-5 rounded-3xl border border-[oklch(0.74_0.17_162/0.32)] bg-[oklch(0.74_0.17_162/0.06)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--shield-text)]">
                    <CheckCircle2 className="h-4 w-4 text-[oklch(0.85_0.19_158)]" />
                    Research queue created
                  </div>
                  <p className="mt-1 text-xs text-[var(--shield-text-dim)]">
                    This first milestone records the job brief and approval policy. Live search connections come next.
                  </p>
                </div>
                <span className="rounded-full border border-[oklch(0.74_0.17_162/0.35)] px-3 py-1 text-xs font-medium text-[oklch(0.85_0.19_158)]">
                  {permission === "review" ? "Individual approval" : "Controlled batch"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {STARTER_QUEUE.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.14_0.018_165/0.45)] p-3">
                    <FileText className="h-4 w-4 text-[oklch(0.82_0.13_210)]" />
                    <p className="mt-2 text-sm font-semibold text-[var(--shield-text)]">{item.role}</p>
                    <p className="mt-1 text-xs text-[var(--shield-text-dim)]">{item.company}</p>
                    <p className="mt-2 text-[11px] text-[oklch(0.85_0.19_158)]">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function PermissionCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition ${
        active
          ? "border-[oklch(0.74_0.17_162/0.75)] bg-[oklch(0.74_0.17_162/0.1)]"
          : "border-[var(--shield-border)] bg-[oklch(0.15_0.02_165/0.45)] hover:border-[oklch(0.74_0.17_162/0.4)]"
      }`}
    >
      <span className="block text-xs font-semibold text-[var(--shield-text)]">{title}</span>
      <span className="mt-1 block text-[11px] leading-relaxed text-[var(--shield-text-dim)]">{description}</span>
    </button>
  );
}

function WorkflowStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 text-xs font-semibold text-[oklch(0.82_0.13_210)]">{number}</span>
      <div>
        <p className="text-xs font-semibold text-[var(--shield-text)]">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--shield-text-dim)]">{text}</p>
      </div>
    </li>
  );
}
