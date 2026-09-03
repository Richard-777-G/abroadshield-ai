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

const PublicJourney = dynamic(() => import("@/components/abroadshield/PublicJourney"));
const CountryRules = dynamic(() => import("@/components/abroadshield/CountryRules"));
const AgentChat = dynamic(() => import("@/components/abroadshield/AgentChat"), { loading: () => <FeatureLoading label="Loading agent…" /> });
const NetworkingJobs = dynamic(() => import("@/components/abroadshield/NetworkingJobs"));
const Connectors = dynamic(() => import("@/components/abroadshield/Connectors"));
const PricingTiers = dynamic(() => import("@/components/abroadshield/PricingTiers"));
const VisionCTA = dynamic(() => import("@/components/abroadshield/VisionCTA"));
const DashboardView = dynamic(() => import("@/components/abroadshield/DashboardView"), { loading: () => <FeatureLoading label="Loading workspace…" /> });
const StageWorkspace = dynamic(() => import("@/components/abroadshield/StageWorkspace"));
const StageRequirements = dynamic(() => import("@/components/abroadshield/StageRequirements"));
const OnboardingWizard = dynamic(() => import("@/components/abroadshield/OnboardingWizard"), { ssr: false });

type PublicView = "home" | "journey" | "agent" | "countries" | "pricing";
type Route = PublicView | WorkspaceView;

const PUBLIC_VIEWS: { id: PublicView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "journey", label: "Journey" },
  { id: "agent", label: "Agent" },
  { id: "countries", label: "Countries" },
  { id: "pricing", label: "Pricing" },
];
const WORKSPACE_VIEWS: WorkspaceView[] = ["dashboard", "agent", "journey", "connectors", "network"];

export default function Home() {
  const { data: session, status } = useSession();
  const { profile, hydrateFromServer } = useProfileStore();
  const [activeRoute, setActiveRoute] = useState<Route>("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { if (status === "authenticated") void hydrateFromServer(); }, [status, hydrateFromServer]);

  const navigateTo = useCallback((id: string) => {
    const route = id as Route;
    const valid = PUBLIC_VIEWS.some(v => v.id === route) || WORKSPACE_VIEWS.includes(route as WorkspaceView);
    if (!valid) return;
    if ((route === "agent" || WORKSPACE_VIEWS.includes(route as WorkspaceView)) && !session) {
      setShowAuth(true);
      return;
    }
    setActiveRoute(route);
    window.history.replaceState(null, "", route === "home" ? "/" : `#${route}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [session]);

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1) as Route;
      const valid = PUBLIC_VIEWS.some(v => v.id === hash) || WORKSPACE_VIEWS.includes(hash as WorkspaceView);
      if (!valid) return;
      if ((hash === "agent" || WORKSPACE_VIEWS.includes(hash as WorkspaceView)) && !session) {
        setShowAuth(true);
        window.history.replaceState(null, "", "/");
        return;
      }
      setActiveRoute(hash);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [session]);

  useEffect(() => {
    const handler = (e: Event) => { const route = (e as CustomEvent<string>).detail; if (route) navigateTo(route); };
    window.addEventListener("abroadshield:navigate", handler);
    return () => window.removeEventListener("abroadshield:navigate", handler);
  }, [navigateTo]);

  const isWorkspace = status === "authenticated" && WORKSPACE_VIEWS.includes(activeRoute as WorkspaceView);

  const content = (
    <AnimatePresence mode="wait">
      <motion.div key={activeRoute} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
        {activeRoute === "home" && <><Hero3D onNavigate={navigateTo} /><HomeShowcase onNavigate={navigateTo} /></>}
        {activeRoute === "journey" && (session ? <><StageRequirements /><StageWorkspace onNavigate={navigateTo} /></> : <PublicJourney onNavigate={navigateTo} />)}
        {activeRoute === "agent" && <AgentChat />}
        {activeRoute === "countries" && <CountryRules />}
        {activeRoute === "pricing" && <><PricingTiers /><VisionCTA /></>}
        {activeRoute === "dashboard" && (session ? <DashboardView onNavigate={navigateTo} /> : <SignInPanel onSignIn={() => setShowAuth(true)} />)}
        {activeRoute === "network" && <NetworkingJobs />}
        {activeRoute === "connectors" && <Connectors />}
      </motion.div>
    </AnimatePresence>
  );

  return <div className="relative flex min-h-screen flex-col bg-transparent">
    <AuthModal open={showAuth} onClose={() => setShowAuth(false)} mode="signup" />
    <AnimatePresence>{showOnboarding && <OnboardingWizard onComplete={() => { setShowOnboarding(false); navigateTo("dashboard"); }} />}</AnimatePresence>
    {isWorkspace ? (
      <AppShell activeView={activeRoute as WorkspaceView} onNavigate={navigateTo as (v: WorkspaceView) => void}>{content}</AppShell>
    ) : (
      <>
        <SiteHeader activeView={activeRoute} onViewChange={navigateTo} views={PUBLIC_VIEWS} onTryAgent={() => { if (!session) { setShowAuth(true); return; } if (profile.onboarded) navigateTo("agent"); else setShowOnboarding(true); }} />
        <main className="flex-1">{content}</main>
        <SiteFooter />
      </>
    )}
  </div>;
}

function FeatureLoading({ label }: { label: string }) {
  return <div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--shield-text-dim)]">{label}</div>;
}

function SignInPanel({ onSignIn }: { onSignIn: () => void }) {
  return <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"><div className="mb-6 text-4xl">🛡️</div><h2 className="text-2xl font-semibold">Sign in to access your workspace</h2><p className="mt-3 max-w-sm text-sm text-[var(--shield-text-dim)]">Your agent, journey, documents and tasks are private to your account.</p><button onClick={onSignIn} className="mt-6 rounded-full bg-[oklch(0.98_0.005_160)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Sign in / Create account</button></div>;
}
