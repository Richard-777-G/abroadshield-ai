"use client";

import {
  Activity,
  Bot,
  CalendarClock,
  ChevronRight,
  Compass,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PanelRight,
  Plus,
  Plug,
  Scale,
  Shield,
  Sparkles,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { WorkspaceView } from "./workspace-types";

export const NAV: {
  id: WorkspaceView;
  label: string;
  tag: string;
  description: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    id: "agent",
    label: "AI Co-Pilot",
    tag: "LIVE CHAT",
    description: "Direct conversational co-pilot",
    icon: Bot,
  },
  {
    id: "network",
    label: "Target Opportunities",
    tag: "FRANCE TRAVAIL",
    description: "Verified jobs & saved dossier",
    icon: Activity,
  },
  {
    id: "dashboard",
    label: "Statutory Radar",
    tag: "L1 LIMITS",
    description: "Mission priorities & statutory limits",
    icon: LayoutDashboard,
  },
  {
    id: "journey",
    label: "Journey Vector",
    tag: "8-STAGE",
    description: "Architectural lifecycle blueprint",
    icon: Compass,
  },
  {
    id: "connectors",
    label: "Connected Services",
    tag: "GATEWAYS",
    description: "Official APIs & authorized tools",
    icon: Plug,
  },
];

const RECENT_MISSIONS = [
  {
    id: "m-1",
    title: "Paris MSc CS Internship Search",
    prompt: "Find internships in Paris related to my computer science masters compliant with student visa limits.",
  },
  {
    id: "m-2",
    title: "Statutory 964h Limit Audit",
    prompt: "Audit my student work authorization under French Article R5221-26 and check convention de stage rules.",
  },
  {
    id: "m-3",
    title: "European CV Dossier Tailoring",
    prompt: "Prepare an application plan with European CV formatting and student work authorization clauses.",
  },
  {
    id: "m-4",
    title: "Alumni Outreach Email Draft",
    prompt: "Draft a concise professional outreach email to an alumni in my target field in Paris. Stop at the draft for my approval.",
  },
];

type Props = {
  activeView: WorkspaceView;
  firstName: string;
  email?: string | null;
  mobileOpen: boolean;
  onNavigate: (view: WorkspaceView) => void;
  onCloseMobile: () => void;
};

export function WorkspaceSidebar({
  activeView,
  firstName,
  email,
  onNavigate,
}: Omit<Props, "mobileOpen" | "onCloseMobile">) {
  const startNewMission = () => {
    window.dispatchEvent(new CustomEvent("abroadshield:new-chat"));
    onNavigate("agent");
  };

  const selectRecent = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("abroadshield:prefill-chat", { detail: prompt }));
    onNavigate("agent");
  };

  return (
    <aside
      aria-label="Workspace AI navigation sidebar"
      className="fixed inset-y-0 left-0 z-[80] hidden w-64 border-r border-[var(--shield-border)] bg-[var(--shield-ink)] backdrop-blur-2xl lg:flex lg:flex-col"
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--shield-border)] px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[oklch(0.76_0.18_160/0.45)] bg-[oklch(0.76_0.18_160/0.12)]">
            <Shield className="h-4 w-4 text-[var(--shield-emerald-bright)]" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-white">
              AbroadShield<span className="text-[var(--shield-emerald-bright)]"> AI</span>
            </div>
            <div className="text-[9px] font-mono text-[var(--shield-text-faint)]">
              Co-Pilot Workstation
            </div>
          </div>
        </div>

        <span className="rounded-md border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--shield-text-faint)]">
          v2.0
        </span>
      </div>

      {/* New Mission / New Chat CTA (ChatGPT / Claude style) */}
      <div className="p-3">
        <button
          type="button"
          onClick={startNewMission}
          className="flex w-full items-center justify-between rounded-xl border border-[var(--shield-border-strong)] bg-[var(--shield-ink-2)] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:border-[var(--shield-emerald-bright)] hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[var(--shield-emerald-bright)]" />
            <span>New Mission</span>
          </div>
          <kbd className="rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-mono text-[var(--shield-text-faint)]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Tools & Workspaces */}
      <div className="px-3 pb-2 pt-1 text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">
        Co-Pilot Modes
      </div>
      <nav className="space-y-1 px-3">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(id)}
              className={`as-sidebar-item w-full ${active ? "active" : ""}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[var(--shield-emerald-bright)]" : ""}`} />
              <span className="flex-1 text-left font-medium">{label}</span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Recent Missions / Thread History (ChatGPT / Claude style) */}
      <div className="mt-4 flex-1 overflow-y-auto px-3">
        <div className="flex items-center gap-1.5 px-2 pb-2 text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">
          <History className="h-3 w-3" />
          <span>Recent Missions</span>
        </div>
        <div className="space-y-1">
          {RECENT_MISSIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => selectRecent(m.prompt)}
              className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-[var(--shield-text-dim)] transition hover:bg-white/5 hover:text-white"
            >
              <MessageSquare className="h-3 w-3 shrink-0 text-[var(--shield-text-faint)] group-hover:text-[var(--shield-emerald-bright)]" />
              <span className="truncate">{m.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Student Profile Dock at Bottom */}
      <div className="border-t border-[var(--shield-border)] bg-[var(--shield-ink-2)] p-3">
        <div className="flex items-center justify-between rounded-xl p-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.76_0.18_160/0.15)] text-xs font-bold text-[var(--shield-emerald-bright)] border border-[oklch(0.76_0.18_160/0.3)]">
              {firstName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="truncate text-xs font-semibold text-white">{firstName}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)]" />
              </div>
              <div className="text-[10px] text-[var(--shield-emerald-bright)] font-mono truncate">
                🇫🇷 France · Art. R5221-26
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--shield-text-faint)] transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function WorkspaceMobileNav({
  activeView,
  mobileOpen,
  onNavigate,
  onCloseMobile,
}: Pick<Props, "activeView" | "mobileOpen" | "onNavigate" | "onCloseMobile">) {
  if (!mobileOpen) return null;
  return (
    <div className="fixed inset-0 z-[95] lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onCloseMobile}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <aside
        aria-label="Mobile workspace navigation"
        className="relative flex h-full w-[min(88vw,300px)] flex-col border-r border-[var(--shield-border)] bg-[var(--shield-ink)] p-4 shadow-2xl"
      >
        <div className="flex h-12 items-center justify-between border-b border-[var(--shield-border)] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--shield-emerald-bright)]" aria-hidden="true" />
            <span className="text-sm font-bold text-white">AbroadShield AI</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="rounded-lg border border-[var(--shield-border)] p-1.5 text-[var(--shield-text-dim)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="space-y-1.5 pt-4">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              aria-current={activeView === id ? "page" : undefined}
              key={id}
              onClick={() => {
                onNavigate(id);
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                activeView === id
                  ? "border border-[var(--shield-border-strong)] bg-white/10 text-white"
                  : "text-[var(--shield-text-dim)] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-[var(--shield-border)] pt-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[var(--shield-text-dim)] hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export function WorkspaceHeader({
  activeView,
  firstName,
  onOpenMobile,
  onToggleArtifacts,
  artifactsOpen,
}: {
  activeView: WorkspaceView;
  firstName: string;
  onOpenMobile: () => void;
  onToggleArtifacts?: () => void;
  artifactsOpen?: boolean;
}) {
  const currentNav = NAV.find((n) => n.id === activeView);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--shield-border)] bg-[rgba(8,9,13,0.85)] px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="rounded-xl border border-[var(--shield-border)] p-1.5 text-[var(--shield-text-dim)] lg:hidden hover:text-white"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[10px] text-[var(--shield-text-faint)]">CO-PILOT //</span>
          <span className="font-bold text-white">{currentNav?.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Context Status */}
        <div className="hidden items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-[11px] font-mono text-[var(--shield-emerald-bright)] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
          <span>STATUTORY GUARD: ACTIVE</span>
        </div>

        {/* Artifact Inspector Toggle (Claude / Antigravity style) */}
        <button
          type="button"
          onClick={onToggleArtifacts}
          title="Toggle Artifact &amp; Dossier Inspector"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            artifactsOpen
              ? "border-[var(--shield-emerald-bright)] bg-[oklch(0.76_0.18_160/0.15)] text-[var(--shield-emerald-bright)]"
              : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text-dim)] hover:text-white"
          }`}
        >
          <PanelRight className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dossier Inspector</span>
        </button>
      </div>
    </header>
  );
}
