"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, BriefcaseBusiness, Building2, Mail, Network, Search, Users } from "lucide-react";

type Tab = "jobs" | "network";

type Action = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: typeof Search;
};

const ACTIONS: Record<Tab, Action[]> = {
  jobs: [
    { id: "job-search", title: "Search for target roles", description: "Ask the agent to research roles against your current journey context and career target. Live vacancy data is only returned when a supported search source is available.", prompt: "Search for current roles aligned with my career goal, destination and study route. Use live sources where available and clearly distinguish live results from unavailable data.", icon: Search },
    { id: "job-fit", title: "Assess role fit", description: "Give the agent a job description and it can assess fit against your persistent profile without inventing missing experience.", prompt: "I want to assess a role against my journey profile. I will paste the job description next.", icon: BriefcaseBusiness },
    { id: "application-plan", title: "Prepare an application", description: "Build an application plan or draft from the evidence already in your journey. External submission remains approval-gated.", prompt: "Prepare an application plan for my current target role. Do not submit anything externally; identify missing evidence and ask me for what is required.", icon: Building2 },
  ],
  network: [
    { id: "network-plan", title: "Build a networking plan", description: "Turn your career target into a concrete outreach sequence, prioritizing the people and signals that matter for the current stage.", prompt: "Build my networking plan for the current journey stage. Prioritize target people, reasons to contact them, evidence I should show, and a practical outreach sequence.", icon: Network },
    { id: "message-draft", title: "Draft an outreach message", description: "Prepare a message using your journey context. Sending is never implied; outbound communication requires explicit approval and a supported connector.", prompt: "Draft a concise professional networking message for a relevant person in my target field. Use my journey context, do not invent shared connections, and stop at the draft for my approval.", icon: Mail },
    { id: "network-priority", title: "Find the next relationship to build", description: "Ask the agent to reason from your current stage, career target and existing journey events rather than showing fabricated contacts.", prompt: "What is the highest-value networking action I should take next for my current journey stage and career goal? Give me one concrete action and the evidence I should prepare.", icon: Users },
  ],
};

export default function NetworkingJobs({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [tab, setTab] = useState<Tab>("jobs");
  const actions = useMemo(() => ACTIONS[tab], [tab]);

  const runInAgent = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("abroadshield:prefill-chat", { detail: prompt }));
    onNavigate?.("agent");
  };

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 lg:py-9">
        <header className="mb-7">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.22em] text-[oklch(0.74_0.17_162)]"><Activity className="h-3 w-3" />Career network</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Turn the career phase into executable work.</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--shield-text-dim)]">This workspace no longer presents fabricated contacts, applications or vacancies. Each action below routes into the real agent workflow and uses your persistent journey context.</p>
        </header>

        <div className="mb-6 inline-flex rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-1" role="tablist" aria-label="Career workspace">
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={BriefcaseBusiness}>Jobs & applications</TabButton>
          <TabButton active={tab === "network"} onClick={() => setTab("network")} icon={Users}>Networking</TabButton>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ id, title, description, prompt, icon: Icon }) => (
            <article key={id} className="flex min-h-[230px] flex-col rounded-2xl border border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.22)] bg-[oklch(0.74_0.17_162/0.07)] text-[oklch(0.85_0.19_158)]"><Icon className="h-4 w-4" /></div>
              <h2 className="mt-5 text-sm font-semibold">{title}</h2>
              <p className="mt-2 flex-1 text-xs leading-5 text-[var(--shield-text-dim)]">{description}</p>
              <button type="button" onClick={() => runInAgent(prompt)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[oklch(0.74_0.17_162)] px-3 py-2.5 text-xs font-semibold text-[oklch(0.12_0.016_165)] transition hover:bg-[oklch(0.85_0.19_158)]">Work with agent <ArrowRight className="h-3.5 w-3.5" /></button>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.018_165)] p-5">
          <div className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.85_0.19_158)]" /><div><div className="text-xs font-semibold">What is live here</div><p className="mt-1 text-xs leading-5 text-[var(--shield-text-dim)]">The action launcher, agent routing and persistent journey context are live. A job/contact database is not represented as populated until real records or a supported live search connector exists.</p></div></div>
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Users; children: React.ReactNode }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${active ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165)]" : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}><Icon className="h-3.5 w-3.5" />{children}</button>;
}
