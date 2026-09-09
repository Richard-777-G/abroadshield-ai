"use client";

import {
  Activity,
  Bot,
  CalendarClock,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Plug,
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
    id: "dashboard",
    label: "Command Center",
    tag: "LIVE RADAR",
    description: "Mission priorities & next moves",
    icon: LayoutDashboard,
  },
  {
    id: "agent",
    label: "AI Co-Pilot",
    tag: "AUTONOMOUS",
    description: "Conversational task execution",
    icon: Bot,
  },
  {
    id: "journey",
    label: "Journey Vector",
    tag: "8-STAGE",
    description: "Blueprint, evidence & strategy",
    icon: Compass,
  },
  {
    id: "network",
    label: "Opportunities",
    tag: "VERIFIED",
    description: "France Travail jobs & internships",
    icon: Activity,
  },
  {
    id: "connectors",
    label: "Connected Services",
    tag: "GATEWAYS",
    description: "Authorized external tools",
    icon: Plug,
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
  return (
    <aside
      aria-label="Workspace command dock"
      className="fixed inset-y-0 left-0 z-[80] hidden w-64 border-r border-[var(--shield-border)] bg-[linear-gradient(180deg,oklch(0.12_0.015_255/0.98),oklch(0.09_0.012_255/0.99))] backdrop-blur-2xl lg:flex lg:flex-col"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--shield-border)] px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.76_0.18_160/0.45)] bg-[oklch(0.76_0.18_160/0.12)]">
          <Shield className="h-4 w-4 text-[var(--shield-emerald-bright)]" aria-hidden="true" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">
            AbroadShield<span className="text-[var(--shield-emerald-bright)]"> AI</span>
          </div>
          <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">
            Student OS v2.0
          </div>
        </div>
      </div>

      {/* Student Active Session Card */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-[var(--shield-border)] bg-[oklch(0.15_0.018_255/0.6)] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.76_0.18_160/0.15)] text-xs font-bold text-[var(--shield-emerald-bright)]">
              {firstName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-white">{firstName}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
              </div>
              <div className="truncate text-[10px] text-[var(--shield-text-faint)]">
                {email || "Student Account"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mental Model Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-5">
        <div className="px-3 pb-2 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--shield-text-faint)]">
          Navigation Vector
        </div>

        {NAV.map(({ id, label, tag, description, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                active
                  ? "border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.12)] text-white shadow-sm"
                  : "border border-transparent text-[var(--shield-text-dim)] hover:border-[var(--shield-border)] hover:bg-[oklch(0.18_0.02_255/0.45)] hover:text-white"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition ${
                  active
                    ? "border-[oklch(0.76_0.18_160/0.5)] bg-[oklch(0.76_0.18_160/0.2)] text-[var(--shield-emerald-bright)]"
                    : "border-[var(--shield-border)] bg-[var(--shield-ink-2)] text-[var(--shield-text-faint)] group-hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{label}</span>
                  <span
                    className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                      active
                        ? "text-[var(--shield-emerald-bright)]"
                        : "text-[var(--shield-text-faint)]"
                    }`}
                  >
                    {tag}
                  </span>
                </div>
                <span className="block truncate text-[10px] text-[var(--shield-text-faint)]">
                  {description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Command Triggers */}
      <div className="space-y-1 border-t border-[var(--shield-border)] p-3">
        <button
          type="button"
          onClick={() => onNavigate("agent")}
          className="flex w-full items-center gap-2.5 rounded-xl border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.08)] px-3 py-2 text-xs font-semibold text-[var(--shield-emerald-bright)] transition hover:bg-[oklch(0.76_0.18_160/0.16)]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask AI Co-Pilot</span>
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-[var(--shield-text-dim)] transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Sign out</span>
        </button>
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
        className="relative flex h-full w-[min(88vw,320px)] flex-col border-r border-[var(--shield-border)] bg-[oklch(0.11_0.015_255)] p-4 shadow-2xl"
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--shield-border)] pb-3">
          <div className="flex items-center gap-2.5">
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
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                activeView === id
                  ? "border border-[oklch(0.76_0.18_160/0.4)] bg-[oklch(0.76_0.18_160/0.15)] text-white"
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
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-[var(--shield-text-dim)] hover:text-white"
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
}: {
  activeView: WorkspaceView;
  firstName: string;
  onOpenMobile: () => void;
}) {
  const currentNav = NAV.find((n) => n.id === activeView);

  return (
    <header className="sticky top-0 z-[60] flex h-14 items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.11_0.015_255/0.88)] px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open navigation"
          className="rounded-xl border border-[var(--shield-border)] p-2 text-[var(--shield-text-dim)] lg:hidden hover:text-white"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[10px] text-[var(--shield-text-faint)]">WORKSPACE //</span>
          <span className="font-bold text-white">{currentNav?.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dynamic Context Pill */}
        <div className="hidden items-center gap-2 rounded-full border border-[oklch(0.76_0.18_160/0.3)] bg-[oklch(0.76_0.18_160/0.08)] px-3 py-1 text-[11px] font-mono text-[var(--shield-emerald-bright)] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-emerald-bright)] as-pulse" />
          <span>AUTONOMOUS ENGINE ACTIVE</span>
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2 rounded-full border border-[var(--shield-border)] bg-[var(--shield-ink-2)] px-3 py-1 text-xs">
          <UserRound className="h-3.5 w-3.5 text-[var(--shield-emerald-bright)]" aria-hidden="true" />
          <span className="font-semibold text-white">{firstName}</span>
        </div>
      </div>
    </header>
  );
}
