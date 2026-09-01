"use client";

import type { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { Activity, Bot, CalendarClock, ChevronRight, LayoutDashboard, LogOut, Mail, Menu, Plug, Shield, UserRound, X } from "lucide-react";
import { useState } from "react";

export type WorkspaceView = "dashboard" | "agent" | "journey" | "connectors" | "network";

const NAV: { id: WorkspaceView; label: string; description: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Overview", description: "Your journey at a glance", icon: LayoutDashboard },
  { id: "agent", label: "Agent", description: "Ask, plan and execute", icon: Bot },
  { id: "journey", label: "Journey", description: "Tasks and milestones", icon: CalendarClock },
  { id: "network", label: "Jobs & Network", description: "Career workspace", icon: Activity },
  { id: "connectors", label: "Connections", description: "Services the agent can use", icon: Plug },
];

export default function AppShell({ activeView, onNavigate, children }: { activeView: WorkspaceView; onNavigate: (view: WorkspaceView) => void; children: ReactNode }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "Student";
  const navigate = (view: WorkspaceView) => { onNavigate(view); setMobileOpen(false); };

  return <div className="min-h-screen bg-[var(--shield-ink)] text-[var(--shield-text)]">
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-[80] hidden w-64 border-r border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/0.97)] lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-[var(--shield-border)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[oklch(0.74_0.17_162/0.45)] bg-[oklch(0.74_0.17_162/0.1)]"><Shield className="h-4 w-4 text-[oklch(0.85_0.19_158)]" /></div>
          <div><div className="text-sm font-semibold">AbroadShield<span className="text-[oklch(0.74_0.17_162)]"> AI</span></div><div className="text-[9px] uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">Command center</div></div>
        </div>
        <div className="px-4 pt-5"><div className="rounded-xl border border-[var(--shield-border)] bg-[oklch(0.18_0.022_165/0.65)] p-3"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.74_0.17_162/0.12)] text-xs font-semibold text-[oklch(0.85_0.19_158)]">{firstName.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><div className="truncate text-xs font-semibold">{firstName}</div><div className="truncate text-[10px] text-[var(--shield-text-faint)]">{session?.user?.email || "Authenticated account"}</div></div></div></div></div>
        <nav className="flex-1 space-y-1 px-3 py-5"><div className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--shield-text-faint)]">Command center</div>{NAV.map(({ id, label, description, icon: Icon }) => { const active = activeView === id; return <button key={id} onClick={() => navigate(id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${active ? "bg-[oklch(0.74_0.17_162/0.12)] text-[var(--shield-text)]" : "text-[var(--shield-text-dim)] hover:bg-[oklch(0.22_0.025_165/0.45)] hover:text-[var(--shield-text)]"}`}><Icon className={`h-4 w-4 shrink-0 ${active ? "text-[oklch(0.85_0.19_158)]" : "text-[var(--shield-text-faint)]"}`} /><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">{label}</span><span className="block truncate text-[9px] text-[var(--shield-text-faint)]">{description}</span></span>{active && <ChevronRight className="h-3.5 w-3.5 text-[oklch(0.74_0.17_162)]" />}</button>; })}</nav>
        <div className="space-y-1 border-t border-[var(--shield-border)] p-3"><button onClick={() => navigate("agent")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-[var(--shield-text-dim)] hover:bg-[oklch(0.22_0.025_165/0.45)]"><Mail className="h-4 w-4" /><span>Message agent</span></button><button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-[var(--shield-text-dim)] hover:bg-[oklch(0.22_0.025_165/0.45)] hover:text-[var(--shield-text)]"><LogOut className="h-4 w-4" /><span>Sign out</span></button></div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 z-[90] lg:hidden"><button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" /><aside className="relative flex h-full w-[min(86vw,320px)] flex-col border-r border-[var(--shield-border)] bg-[oklch(0.12_0.016_165)] shadow-2xl"><div className="flex h-16 items-center justify-between border-b border-[var(--shield-border)] px-5"><div className="flex items-center gap-2.5"><Shield className="h-5 w-5 text-[oklch(0.85_0.19_158)]" /><span className="text-sm font-semibold">AbroadShield AI</span></div><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button></div><nav className="space-y-1 p-3 pt-5">{NAV.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${activeView === id ? "bg-[oklch(0.74_0.17_162/0.12)] text-[var(--shield-text)]" : "text-[var(--shield-text-dim)]"}`}><Icon className="h-4 w-4" />{label}</button>)}</nav></aside></div>}
      <div className="min-w-0 flex-1 lg:pl-64"><div className="sticky top-0 z-[60] flex h-14 items-center justify-between border-b border-[var(--shield-border)] bg-[oklch(0.12_0.016_165/0.86)] px-4 backdrop-blur-xl sm:px-6"><button onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="rounded-lg border border-[var(--shield-border)] p-2 lg:hidden"><Menu className="h-4 w-4" /></button><div className="hidden items-center gap-2 text-xs text-[var(--shield-text-faint)] sm:flex"><LayoutDashboard className="h-3.5 w-3.5" /> Command center / <span className="text-[var(--shield-text-dim)]">{NAV.find(n => n.id === activeView)?.label}</span></div><div className="ml-auto flex items-center gap-3"><span className="hidden items-center gap-1.5 text-[10px] text-[var(--shield-text-faint)] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.74_0.17_162)]" />Agent available</span><div className="flex items-center gap-2 rounded-full border border-[var(--shield-border)] px-2.5 py-1.5"><UserRound className="h-3.5 w-3.5 text-[var(--shield-text-faint)]" /><span className="text-[11px] font-medium">{firstName}</span></div></div></div><main className="min-h-[calc(100vh-3.5rem)]">{children}</main></div>
    </div>
  </div>;
}
