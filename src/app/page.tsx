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
const StageRequirements = dynamic(() => import("@/components/abroadshield/StageRequirements"));
const OnboardingWizard = dynamic(() => import("@/components/abroadshield/OnboardingWizard"), { ssr: false });

type View = "home" | "dashboard" | "journey" | "agent" | "countries" | "network" | "connectors" | "pricing";
const VIEWS: { id: View; label: string }[] = [
  { id: "home", label: "Home" }, { id: "dashboard", label: "Dashboard" }, { id: "journey", label: "Journey" }, { id: "agent", label: "Agent" },
  { id: "countries", label: "Countries" }, { id: "network", label: "Network" }, { id: "connectors", label: "Connect" }, { id: "pricing", label: "Pricing" },
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
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => { const view = (e as CustomEvent<string>).detail; if (view) navigateTo(view); };
    window.addEventListener("abroadshield:navigate", handler);
    return () => window.removeEventListener("abroadshield:navigate", handler);
  }, [navigateTo]);

  useEffect(() => {
    if (status === "authenticated" && activeView === "home" && !window.location.hash) navigateTo("dashboard");
  }, [status, activeView, navigateTo]);

  const isWorkspace = status === "authenticated" && WORKSPACE_VIEWS.includes(activeView as WorkspaceView);
  const content = (
    <AnimatePresence mode="wait">
      <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
        {activeView === "home" && <><Hero3D onNavigate={navigateTo} /><HomeShowcase onNavigate={navigateTo} /></>}
        {activeView === "dashboard" && (session ? <DashboardView onNavigate={navigateTo} /> : <SignInPanel onSignIn={() => setShowAuthForDashboard(true)} />)}
        {activeView === "journey" && <><StageRequirements /><StageWorkspace onNavigate={navigateTo} /><JourneyExplorer /><DeadlineTimeline /><MemoryVault /></>}
        {activeView === "agent" && <AgentChat />}
        {activeView === "countries" && <><ViewHero viewId="countries" /><CountryRules /></>}
        {activeView === "network" && <><ViewHero viewId="network" /><NetworkingJobs /></>}
        {activeView === "connectors" && <><ViewHero viewId="connectors" /><Connectors /></>}
        {activeView === "pricing" && <><ViewHero viewId="pricing" /><Pillars /><PricingTiers /><VisionCTA /></>}
      </motion.div>
    </AnimatePresence>
  );

  return <div className="relative flex min-h-screen flex-col bg-transparent">
    <AuthModal open={showAuthForDashboard} onClose={() => setShowAuthForDashboard(false)} mode="signup" />
    <AnimatePresence>{showOnboarding && <OnboardingWizard onComplete={() => { setShowOnboarding(false); navigateTo("dashboard"); }} />}</AnimatePresence>
    {isWorkspace ? <AppShell activeView={activeView as WorkspaceView} onNavigate={navigateTo as (v: WorkspaceView) => void}>{content}</AppShell> : <><SiteHeader activeView={activeView} onViewChange={navigateTo} views={VIEWS} onTryAgent={() => { if (session) setShowOnboarding(!profile.onboarded); else setShowAuthForDashboard(true); }} /><main className="flex-1">{content}</main><SiteFooter /></>}
  </div>;
}

function FeatureLoading({ label }: { label: string }) {
  return <div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--shield-text-dim)]">{label}</div>;
}

function SignInPanel({ onSignIn }: { onSignIn: () => void }) {
  return <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"><div className="mb-6 text-4xl">🛡️</div><h2 className="text-2xl font-semibold">Sign in to access your workspace</h2><p className="mt-3 max-w-sm text-sm text-[var(--shield-text-dim)]">Your agent, journey, documents and tasks are private to your account.</p><button onClick={onSignIn} className="mt-6 rounded-full bg-[oklch(0.98_0.005_160)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Sign in / Create account</button></div>;
}
