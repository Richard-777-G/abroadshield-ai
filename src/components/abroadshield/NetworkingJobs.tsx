"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  Mail,
  Clock,
  CheckCircle2,
  Building2,
  Network,
  Target,
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

// These are presentation fixtures only. They are intentionally not presented
// as the user's real contacts, applications, offers, or live vacancies.
const CONTACTS: NetworkContact[] = [
  { id: "c1", name: "Example contact", role: "Senior Data Engineer", company: "Example employer", status: "replied", lastTouch: "example", agentAction: "Example follow-up draft — not sent" },
  { id: "c2", name: "Example contact", role: "ML Engineer", company: "Example employer", status: "connected", lastTouch: "example", agentAction: "Example connection record" },
  { id: "c3", name: "Example mentor", role: "University Alumni Mentor", company: "Example alumni network", status: "pending", lastTouch: "example", agentAction: "Example introduction draft — not sent" },
];

const JOBS: JobApp[] = [
  { id: "j1", role: "Example Solutions Engineer", company: "Example employer", location: "Example location", sponsored: true, status: "interview", match: 92, deadline: "Example status — not a live application" },
  { id: "j2", role: "Example Data Engineer", company: "Example employer", location: "Example location", sponsored: true, status: "applied", match: 88, deadline: "Example status — not a live application" },
  { id: "j3", role: "Example ML Engineer", company: "Example employer", location: "Example location", sponsored: true, status: "drafting", match: 85, deadline: "Example status — not a live application" },
];

const STATUS_STYLE: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  replied: { label: "Replied", text: "text-[oklch(0.85_0.19_158)]", bg: "bg-[oklch(0.74_0.17_162/0.1)]", border: "border-[oklch(0.74_0.17_162/0.4)]", dot: "bg-[oklch(0.74_0.17_162)]" },
  pending: { label: "Pending", text: "text-[oklch(0.86_0.17_80)]", bg: "bg-[oklch(0.8_0.15_80/0.1)]", border: "border-[oklch(0.8_0.15_80/0.4)]", dot: "bg-[oklch(0.8_0.15_80)]" },
  "follow-up": { label: "Follow-up", text: "text-[oklch(0.86_0.17_80)]", bg: "bg-[oklch(0.8_0.15_80/0.1)]", border: "border-[oklch(0.8_0.15_80/0.4)]", dot: "bg-[oklch(0.8_0.15_80)]" },
  connected: { label: "Connected", text: "text-[oklch(0.82_0.13_210)]", bg: "bg-[oklch(0.74_0.13_210/0.1)]", border: "border-[oklch(0.74_0.13_210/0.4)]", dot: "bg-[oklch(0.74_0.13_210)]" },
  applied: { label: "Applied", text: "text-[oklch(0.85_0.19_158)]", bg: "bg-[oklch(0.74_0.17_162/0.1)]", border: "border-[oklch(0.74_0.17_162/0.4)]", dot: "bg-[oklch(0.74_0.17_162)]" },
  interview: { label: "Interview", text: "text-[oklch(0.86_0.17_80)]", bg: "bg-[oklch(0.8_0.15_80/0.1)]", border: "border-[oklch(0.8_0.15_80/0.4)]", dot: "bg-[oklch(0.8_0.15_80)]" },
  offer: { label: "Offer", text: "text-[oklch(0.82_0.13_210)]", bg: "bg-[oklch(0.74_0.13_210/0.1)]", border: "border-[oklch(0.74_0.13_210/0.4)]", dot: "bg-[oklch(0.74_0.13_210)]" },
  rejected: { label: "Blocked", text: "text-[oklch(0.72_0.19_22)]", bg: "bg-[oklch(0.66_0.19_22/0.1)]", border: "border-[oklch(0.66_0.19_22/0.4)]", dot: "bg-[oklch(0.66_0.19_22)]" },
  drafting: { label: "Drafting", text: "text-[oklch(0.85_0.19_158)]", bg: "bg-[oklch(0.74_0.17_162/0.1)]", border: "border-[oklch(0.74_0.17_162/0.4)]", dot: "bg-[oklch(0.74_0.17_162)]" },
};

type Tab = "network" | "jobs";

export default function NetworkingJobs() {
  const [tab, setTab] = useState<Tab>("network");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="network" className="relative w-full bg-transparent py-16 sm:py-20 scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[oklch(0.82_0.13_210)]"><Network className="h-3.5 w-3.5" />Networking &amp; Job Hub</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shield-text)] sm:text-4xl">Network and job execution, <span className="as-text-gradient">built for real data.</span></h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--shield-text-dim)]">This workspace is currently a UI fixture. It does not claim the example contacts or applications below are yours, and it does not claim that an external message or application was sent.</p>
        </Reveal>

        <div className="mb-6 rounded-2xl border border-[oklch(0.8_0.15_80/0.3)] bg-[oklch(0.8_0.15_80/0.06)] p-4 text-sm text-[var(--shield-text-dim)]">
          <strong className="text-[var(--shield-text)]">Integration status:</strong> real networking/job records are not connected to the persistent journey database yet. The live execution path is being built separately from these presentation fixtures.
        </div>

        <Reveal delay={0.1} className="mb-7">
          <div className="grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-4">
            <StatCard icon={Users} label="Example contacts" value={CONTACTS.length} />
            <StatCard icon={Clock} label="Example follow-ups" value={CONTACTS.filter((c) => c.status === "pending" || c.status === "follow-up").length} />
            <StatCard icon={Briefcase} label="Example applications" value={JOBS.filter((j) => j.status === "applied" || j.status === "interview").length} />
            <StatCard icon={Target} label="Real offers" value={0} />
          </div>
        </Reveal>

        <div className="mb-5 inline-flex rounded-full border border-[var(--shield-border)] bg-[oklch(0.22_0.025_165/0.5)] p-1">
          <TabButton active={tab === "network"} onClick={() => setTab("network")} icon={Users}>Examples ({CONTACTS.length})</TabButton>
          <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")} icon={Briefcase}>Examples ({JOBS.length})</TabButton>
        </div>

        <Reveal delay={0.15}>
          <div className="space-y-2">
            {tab === "network" && CONTACTS.map((c, i) => <ExampleRow key={c.id} index={i} id={c.id} openId={openId} setOpenId={setOpenId} icon={Users} title={c.name} subtitle={`${c.role} · ${c.company}`} status={c.status} action={c.agentAction} />)}
            {tab === "jobs" && JOBS.map((j, i) => <ExampleRow key={j.id} index={i} id={j.id} openId={openId} setOpenId={setOpenId} icon={Building2} title={j.role} subtitle={`${j.company} · ${j.location}`} status={j.status} action={j.deadline} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ExampleRow({ index, id, openId, setOpenId, icon: Icon, title, subtitle, status, action }: { index: number; id: string; openId: string | null; setOpenId: (id: string | null) => void; icon: typeof Users; title: string; subtitle: string; status: string; action: string }) {
  const style = STATUS_STYLE[status];
  const isOpen = openId === id;
  return <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.25, delay: index * 0.04 }}>
    <button type="button" onClick={() => setOpenId(isOpen ? null : id)} className="as-card-hover flex w-full items-center gap-3 rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3 text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/0.6)]"><Icon className="h-4 w-4 text-[oklch(0.82_0.13_210)]" /></div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-[var(--shield-text)]">{title}</span><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${style.border} ${style.bg} ${style.text}`}><span className={`h-1 w-1 rounded-full ${style.dot}`} />{style.label}</span></div><div className="mt-0.5 truncate text-xs text-[var(--shield-text-dim)]">{subtitle}</div></div>
      <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--shield-text-dim)]" />
    </button>
    <AnimatePresence>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-1 rounded-2xl border border-[oklch(0.8_0.15_80/0.25)] bg-[oklch(0.8_0.15_80/0.05)] p-4 text-sm text-[var(--shield-text-dim)]"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><span>{action}</span></div></div></motion.div>}</AnimatePresence>
  </motion.div>;
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return <div className="rounded-2xl border border-[var(--shield-border)] as-glass px-4 py-3"><div className="flex items-center gap-2 text-xs text-[var(--shield-text-dim)]"><Icon className="h-3.5 w-3.5" />{label}</div><div className="mt-1 text-2xl font-semibold text-[var(--shield-text)]">{value}</div></div>;
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Users; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition ${active ? "bg-[oklch(0.74_0.17_162)] text-[oklch(0.14_0.018_165)]" : "text-[var(--shield-text-dim)] hover:text-[var(--shield-text)]"}`}><Icon className="h-3.5 w-3.5" />{children}</button>;
}
