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
import JourneyWorkspace from "@/components/abroadshield/JourneyWorkspace";
import { useProfileStore, type StudentProfile } from "@/components/abroadshield/profileStore";

const PublicProduct = dynamic(() => import("@/components/abroadshield/PublicProduct"));
const CountryRules = dynamic(() => import("@/components/abroadshield/CountryRules"));
const AgentChat = dynamic(() => import("@/components/abroadshield/AgentChat"), { loading: () => <FeatureLoading label="Loading agent…" /> });
const NetworkingJobs = dynamic(() => import("@/components/abroadshield/NetworkingJobs"));
const Connectors = dynamic(() => import("@/components/abroadshield/Connectors"));
const PricingTiers = dynamic(() => import("@/components/abroadshield/PricingTiers"));
const VisionCTA = dynamic(() => import("@/components/abroadshield/VisionCTA"));
const DashboardView = dynamic(() => import("@/components/abroadshield/DashboardView"), { loading: () => <FeatureLoading label="Loading workspace…" /> });
const OnboardingWizard = dynamic(() => import("@/components/abroadshield/OnboardingWizard"), { ssr: false });

type PublicView = "home" | "journey" | "countries" | "pricing";
type Route = PublicView | "agent" | WorkspaceView;
type AuthMode = "login" | "signup";
const PUBLIC_VIEWS: { id: PublicView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "journey", label: "How it works" },
  { id: "countries", label: "Country intelligence" },
  { id: "pricing", label: "Pricing" },
];
const WORKSPACE_VIEWS: WorkspaceView[] = ["dashboard", "agent", "journey", "connectors", "network"];

function isValidRoute(value: string): value is Route {
  return PUBLIC_VIEWS.some((v) => v.id === value) || value === "agent" || WORKSPACE_VIEWS.includes(value as WorkspaceView);
}

export default function Home() {
  const { data: session, status } = useSession();
  const { profile, hydrated, hydrateFromServer, resetProfile } = useProfileStore();
  const [activeRoute, setActiveRoute] = useState<Route>("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  useEffect(() => {
    if (status === "authenticated") { resetProfile(); void hydrateFromServer(); }
    if (status === "unauthenticated") { resetProfile(); setShowOnboarding(false); setShowAuth(false); setActiveRoute("home"); if (window.location.hash) window.history.replaceState(null, "", "/"); }
  }, [status, hydrateFromServer, resetProfile]);

  const requestAuth = useCallback((mode: AuthMode = "signup") => { setAuthMode(mode); setShowAuth(true); }, []);
  const navigateTo = useCallback((id: string) => {
    const route = id as Route;
    if (!isValidRoute(route)) return;
    if ((route === "agent" || WORKSPACE_VIEWS.includes(route as WorkspaceView)) && status !== "authenticated") { if (status === "unauthenticated") requestAuth("login"); return; }
    if (route === activeRoute) return;
    setActiveRoute(route);
    window.history.pushState(null, "", route === "home" ? "/" : `#${route}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [requestAuth, status, activeRoute]);

  useEffect(() => {
    const syncFromLocation = () => {
      const hash = window.location.hash.slice(1) as Route;
      const route = hash || "home";
      if (!isValidRoute(route)) return;
      if ((route === "agent" || WORKSPACE_VIEWS.includes(route as WorkspaceView)) && status !== "authenticated") { if (status === "unauthenticated") { requestAuth("login"); window.history.replaceState(null, "", "/"); } return; }
      setActiveRoute((current) => current === route ? current : route);
    };
    syncFromLocation(); window.addEventListener("hashchange", syncFromLocation); window.addEventListener("popstate", syncFromLocation);
    return () => { window.removeEventListener("hashchange", syncFromLocation); window.removeEventListener("popstate", syncFromLocation); };
  }, [requestAuth, status]);

  useEffect(() => { const handler = (e: Event) => { const route = (e as CustomEvent<string>).detail; if (route) navigateTo(route); }; window.addEventListener("abroadshield:navigate", handler); return () => window.removeEventListener("abroadshield:navigate", handler); }, [navigateTo]);

  const isWorkspace = status === "authenticated" && WORKSPACE_VIEWS.includes(activeRoute as WorkspaceView);
  const workspaceContent = hydrated ? contentFor(activeRoute, status, session, profile, navigateTo, requestAuth) : <FeatureLoading label="Preparing your private workspace…" />;

  return <div className="relative flex min-h-screen flex-col bg-transparent">
    <AnimatePresence>{showOnboarding && <OnboardingWizard onComplete={() => { setShowOnboarding(false); navigateTo("dashboard"); }} />}</AnimatePresence>
    {isWorkspace ? <AppShell activeView={activeRoute as WorkspaceView} onNavigate={navigateTo as (v: WorkspaceView) => void}>{workspaceContent}</AppShell> : <><SiteHeader activeView={activeRoute} onViewChange={navigateTo} views={PUBLIC_VIEWS} onTryAgent={() => { if (status !== "authenticated") { requestAuth("login"); return; } if (profile.onboarded) navigateTo("agent"); else setShowOnboarding(true); }} onAuthRequest={requestAuth} /><main className="flex-1">{contentFor(activeRoute, status, session, profile, navigateTo, requestAuth)}</main><SiteFooter onNavigate={navigateTo} /></>}
    <AuthModal open={showAuth} onClose={() => setShowAuth(false)} mode={authMode} />
  </div>;
}

function contentFor(activeRoute: Route, status: string, session: ReturnType<typeof useSession>["data"], profile: StudentProfile, navigateTo: (view: string) => void, requestAuth: (mode?: AuthMode) => void) {
  return <AnimatePresence mode="wait"><motion.div key={activeRoute} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
    {activeRoute === "home" && <><Hero3D onNavigate={navigateTo} /><HomeShowcase onNavigate={navigateTo} /></>}
    {activeRoute === "journey" && (session ? <JourneyWorkspace onNavigate={navigateTo} /> : <PublicProduct onNavigate={navigateTo} />)}
    {activeRoute === "agent" && status === "authenticated" && <AgentChat />}
    {activeRoute === "countries" && <CountryRules />}
    {activeRoute === "pricing" && <><PricingTiers onStart={() => { if (status === "authenticated") navigateTo("agent"); else requestAuth("signup"); }} /><VisionCTA onNavigate={navigateTo} /></>}
    {activeRoute === "dashboard" && (status === "authenticated" ? <DashboardView onNavigate={navigateTo} /> : <SignInPanel onSignIn={() => requestAuth("login")} />)}
    {activeRoute === "network" && status === "authenticated" && <NetworkingJobs />}
    {activeRoute === "connectors" && status === "authenticated" && <Connectors />}
  </motion.div></AnimatePresence>;
}

function FeatureLoading({ label }: { label: string }) { return <div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-[var(--shield-text-dim)]">{label}</div>; }
function SignInPanel({ onSignIn }: { onSignIn: () => void }) { return <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"><div className="mb-6 text-4xl">🛡️</div><h2 className="text-2xl font-semibold">Sign in to access your workspace</h2><p className="mt-3 max-w-sm text-sm text-[var(--shield-text-dim)]">Your agent, journey, documents and tasks are private to your account.</p><button type="button" onClick={onSignIn} className="mt-6 rounded-full bg-[oklch(0.98_0.005_160)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)]">Sign in / Create account</button></div>; }
