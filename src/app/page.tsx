"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/abroadshield/SiteHeader";
import SiteFooter from "@/components/abroadshield/SiteFooter";
import Hero3D from "@/components/abroadshield/Hero3D";
import HomeShowcase from "@/components/abroadshield/HomeShowcase";
import AuthModal from "@/components/abroadshield/AuthModal";
import AppShell, { type WorkspaceView } from "@/components/abroadshield/AppShell";
import { useProfileStore } from "@/components/abroadshield/profileStore";

const ViewHero = dynamic(() => import("@/components/abroadshield/ViewHero"));
const JourneyExplorer = dynamic(() => import("@/components/abroadshield/JourneyExplorer"));
const DeadlineTimeline = dynamic(() => import("@/components/abroadshield/DeadlineTimeline"));
const MemoryVault = dynamic(() => import("@/components/abroadshield/MemoryVault"));
const CountryRules = dynamic(() => import("@/components/abroadshield/CountryRules"));
const Pillars = dynamic(() => import("@/components/abroadshield/Pillars"));
const AgentChat = dynamic(() => import("@/components/abroadshield/AgentChat"), { loading: () => <FeatureLoading label="Loading agent…" /> });
const NetworkingJobs = dynamic(() => import("@/components/abroadshield/NetworkingJobs"));
const Connectors = dynamic(() => import("@/components/abroadshield/Connectors"));
const PricingTiers = dynamic(() => import("@/components/abroadshield/PricingTiers"));
const VisionCTA = dynamic(() => import("@/components/abroadshield/VisionCTA"));
const DashboardView = dynamic(() => import("@/components/abroadshield/DashboardView"), { loading: () => <FeatureLoading label="Loading workspace…" /> });
const StageWorkspace = dynamic(() => import("@/components/abroadshield/StageWorkspace"));
const OnboardingWizard = dynamic(() => import("@/components/abroadshield/OnboardingWizard"), { ssr: false });

type View = "home" | "dashboard" | "journey" | "agent" | "countries" | "network" | "connectors" | "pricing";
const VIEWS: { id: View; label: string }[] = [
  { id: "home", label: "Home" }, { id: "dashboard", label: "Dashboard" }, { id: "journey", label: "Journey" }, { id: "agent", label: "Agent" },
  { id: "countries", label: "Countries" }, { id: "network", label: "Jobs & Network" }, { id: "connectors", label: "Connections" }, { id: "pricing", label: "Pricing" },
];
const WORKSPACE_VIEWS: WorkspaceView[] = ["dashboard", "agent", "journey", "connectors", "network"];

export default function Home() {
  const { data: session, status } = useSession();
  const { profile, hydrateFromServer } = useProfileStore();
  const [activeView, setActiveView] = useState<View>("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthForDashboard, setShowAuthForDashboard] = useState(false);

  useEffect(() => { if (status === "authenticated") void hydrateFromServer(); }, [status, hydrateFromServer]);

  const navigateTo = useCallback((id: string) => {
    if (!VIEWS.some((v) => v.id === id)) return;
    const view = id as View;
    setActiveView(view);
    window.history.replaceState(null, "", `#${view}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const fromHash = () => { const h = window.location.hash.replace("#", "") as View; if (VIEWS.some((v) => v.id === h)) setActiveView(h); };
    fromHash(); window.addEventListener("hashchange", fromHash); return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { const view = (e as CustomEvent<string>).detail; if (view) navigateTo(view); };
    window.addEventListener("abroadshield:navigate", handler); return () => window.removeEventListener("abroadshield:navigate", handler);
  }, [navigateTo]);

  useEffect(() => { if (status === "authenticated" && activeView === "home" && !window.location.hash) navigateTo("dashboard"); }, [status, activeView, navigateTo]);

  const publicHome = activeView === "home";
  const content = <AnimatePresence mode="wait"><motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
    {publicHome && <LandingPage onNavigate={navigateTo} />}
    {activeView === "dashboard" && (session ? <DashboardView onNavigate={navigateTo} /> : <SignInPanel onSignIn={() => setShowAuthForDashboard(true)} />)}
    {activeView === "journey" && (session ? <><StageWorkspace onNavigate={navigateTo} /><JourneyExplorer /><DeadlineTimeline /><MemoryVault /></> : <SignInPanel onSignIn={() => setShowAuthForDashboard(true)} />)}
    {activeView === "agent" && (session ? <AgentChat /> : <SignInPanel onSignIn={() => setShowAuthForDashboard(true)} />)}
    {activeView === "countries" && <><ViewHero viewId="countries" /><CountryRules /></>}
    {activeView === "network" && <><ViewHero viewId="network" /><NetworkingJobs /></>}
    {activeView === "connectors" && <><ViewHero viewId="connectors" /><Connectors /></>}
    {activeView === "pricing" && <><ViewHero viewId="pricing" /><Pillars /><PricingTiers /><VisionCTA /></>}
  </motion.div></AnimatePresence>;

  const isWorkspace = status === "authenticated" && WORKSPACE_VIEWS.includes(activeView as WorkspaceView);
  return <div className="relative flex min-h-screen flex-col bg-transparent">
    <AuthModal open={showAuthForDashboard} onClose={() => setShowAuthForDashboard(false)} mode="signup" />
    <AnimatePresence>{showOnboarding && <OnboardingWizard onComplete={() => { setShowOnboarding(false); navigateTo("dashboard"); }} />}</AnimatePresence>
    {isWorkspace ? <AppShell activeView={activeView as WorkspaceView} onNavigate={navigateTo as (v: WorkspaceView) => void}>{content}</AppShell> : <><SiteHeader activeView={activeView} onViewChange={navigateTo} views={VIEWS} onTryAgent={() => { if (session) setShowOnboarding(!profile.onboarded); else setShowAuthForDashboard(true); }} /><main className="flex-1">{content}</main><SiteFooter /></>}
  </div>;
}

function LandingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return <>
    <Hero3D onNavigate={onNavigate} />
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="max-w-3xl"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">One connected journey</div><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">From choosing a country to building your career.</h2><p className="mt-5 text-base leading-7 text-[var(--shield-text-dim)]">AbroadShield keeps your profile, requirements, documents, deadlines and actions connected so the agent can help at the stage where you actually are.</p></div><div className="mt-10"><JourneyExplorer /></div></section>
    <section className="border-y border-[var(--shield-border)] bg-[var(--shield-ink-2)]"><div className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">The operating model</div><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">One profile. One agent. One execution rail.</h2><p className="mt-4 text-sm leading-6 text-[var(--shield-text-dim)]">The platform connects your journey to country rules, tasks and approved tools. It prepares work, asks for your approval when required, and records what happened.</p></div><div className="mt-10"><HomeShowcase onNavigate={onNavigate} /></div></div></section>
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="grid gap-6 lg:grid-cols-3"><div className="rounded-2xl border border-[var(--shield-border)] p-6"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">01 · Understand</div><h3 className="mt-3 text-xl font-semibold">Know what applies to you.</h3><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">Country, stage, course and profile data shape the requirements and decisions the agent works against.</p></div><div className="rounded-2xl border border-[var(--shield-border)] p-6"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">02 · Execute</div><h3 className="mt-3 text-xl font-semibold">Get the work done.</h3><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">Check documents, prepare emails, scan deadlines, search opportunities and build next actions through one agent workflow.</p></div><div className="rounded-2xl border border-[var(--shield-border)] p-6"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--shield-text-faint)]">03 · Control</div><h3 className="mt-3 text-xl font-semibold">Approve what leaves.</h3><p className="mt-3 text-sm leading-6 text-[var(--shield-text-dim)]">Outbound actions stay behind a human approval boundary, with execution and journey events recorded.</p></div></div></section>
    <section className="border-t border-[var(--shield-border)]"><div className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><CountryRules /></div></section>
    <section className="border-t border-[var(--shield-border)] bg-[var(--shield-ink-2)]"><div className="mx-auto max-w-6xl px-5 py-20 sm:px-8"><div className="max-w-2xl"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.74_0.17_162)]">Agent in action</div><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Tell it what needs doing.</h2><p className="mt-4 text-sm leading-6 text-[var(--shield-text-dim)]">The authenticated workspace is where the agent becomes operational: tasks, tools, approvals and journey state stay connected.</p></div><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => onNavigate("agent")} className="rounded-xl bg-[oklch(0.74_0.17_162)] px-5 py-3 text-sm font-semibold text-[oklch(0.12_0.016_165)]">Open the agent</button><button onClick={() => onNavigate("dashboard")} className="rounded-xl border border-[var(--shield-border)] px-5 py-3 text-sm font-semibold">See the workspace</button></div></div></section>
    <VisionCTA />
  </>;
}

function FeatureLoading({ label }: { label: string }) { return <div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--shield-text-dim)]">{label}</div>; }
function SignInPanel({ onSignIn }: { onSignIn: () => void }) { return <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"><div className="mb-6 text-4xl">🛡️</div><h2 className="text-2xl font-semibold">Sign in to access your workspace</h2><p className="mt-3 max-w-sm text-sm text-[var(--shield-text-dim)]">Your agent, journey, documents and tasks are private to your account.</p><button onClick={onSignIn} className="mt-6 rounded-full bg-[oklch(0.98_0.005_160)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Sign in / Create account</button></div>; }
