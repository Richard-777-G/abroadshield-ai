"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/abroadshield/SiteHeader";
import SiteFooter from "@/components/abroadshield/SiteFooter";
import Hero3D from "@/components/abroadshield/Hero3D";
import ViewHero from "@/components/abroadshield/ViewHero";
import HomeShowcase from "@/components/abroadshield/HomeShowcase";
import JourneyExplorer from "@/components/abroadshield/JourneyExplorer";
import AgentActivityPanel from "@/components/abroadshield/AgentActivityPanel";
import DeadlineTimeline from "@/components/abroadshield/DeadlineTimeline";
import MemoryVault from "@/components/abroadshield/MemoryVault";
import CountryRules from "@/components/abroadshield/CountryRules";
import Pillars from "@/components/abroadshield/Pillars";
import AgentChat from "@/components/abroadshield/AgentChat";
import ApprovalsHistory from "@/components/abroadshield/ApprovalsHistory";
import NetworkingJobs from "@/components/abroadshield/NetworkingJobs";
import Connectors from "@/components/abroadshield/Connectors";
import PricingTiers from "@/components/abroadshield/PricingTiers";
import VisionCTA from "@/components/abroadshield/VisionCTA";
import DashboardView from "@/components/abroadshield/DashboardView";
import AuthModal from "@/components/abroadshield/AuthModal";

// Onboarding wizard — client-only, heavy, load lazily
const OnboardingWizard = dynamic(
  () => import("@/components/abroadshield/OnboardingWizard"),
  { ssr: false }
);

type View =
  | "home"
  | "dashboard"
  | "journey"
  | "agent"
  | "countries"
  | "network"
  | "connectors"
  | "pricing";

const VIEWS: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "dashboard", label: "Dashboard" },
  { id: "journey", label: "Journey" },
  { id: "agent", label: "Agent" },
  { id: "countries", label: "Countries" },
  { id: "network", label: "Network" },
  { id: "connectors", label: "Connect" },
  { id: "pricing", label: "Pricing" },
];

export default function Home() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<View>("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthForDashboard, setShowAuthForDashboard] = useState(false);

  const navigateTo = useCallback((id: string) => {
    const view = id as View;
    setActiveView(view);
    window.location.hash = `#${view}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // sync with URL hash on mount + hash changes (deep linking)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as View;
      if (h && VIEWS.some((v) => v.id === h)) {
        setActiveView(h);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Listen for custom navigation events (dispatched by child components)
  useEffect(() => {
    const handler = (e: Event) => {
      const view = (e as CustomEvent<string>).detail;
      if (view && VIEWS.some((v) => v.id === view)) {
        navigateTo(view);
      }
    };
    window.addEventListener("abroadshield:navigate", handler);
    return () => window.removeEventListener("abroadshield:navigate", handler);
  }, [navigateTo]);

  // When session appears (login just happened), bounce to dashboard
  useEffect(() => {
    if (session && activeView === "home") {
      const hash = window.location.hash.replace("#", "");
      if (!hash || hash === "home") navigateTo("dashboard");
    }
  }, [session, activeView, navigateTo]);

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      {/* Auth modal shown when unauthenticated user tries to access dashboard */}
      <AuthModal
        open={showAuthForDashboard}
        onClose={() => setShowAuthForDashboard(false)}
        mode="signup"
      />

      {/* Onboarding wizard — shows when user clicks "Try the agent" if not yet onboarded */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard
            onComplete={() => {
              setShowOnboarding(false);
              navigateTo("dashboard");
            }}
          />
        )}
      </AnimatePresence>

      <SiteHeader
        activeView={activeView as string}
        onViewChange={(id) => navigateTo(id)}
        views={VIEWS}
        onTryAgent={() => setShowOnboarding(true)}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeView === "home" && (
              <>
                <Hero3D onNavigate={navigateTo} />
                <HomeShowcase onNavigate={navigateTo} />
              </>
            )}

            {activeView === "dashboard" && (
              session ? (
                <DashboardView onNavigate={navigateTo} />
              ) : (
                /* Gate: show sign-in prompt instead of blank dashboard */
                <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[oklch(0.74_0.17_162/0.4)] bg-[oklch(0.74_0.17_162/0.1)]">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--shield-text)]">Sign in to access your dashboard</h2>
                  <p className="mt-3 max-w-sm text-sm text-[var(--shield-text-dim)]">
                    Your agent, deadlines, documents and tasks are waiting. Any email + password works instantly.
                  </p>
                  <button
                    onClick={() => setShowAuthForDashboard(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[oklch(0.98_0.005_160)] px-6 py-3 text-sm font-semibold text-[oklch(0.14_0.018_165)] transition hover:bg-white"
                  >
                    Sign in / Create account
                  </button>
                </div>
              )
            )}

            {activeView === "journey" && (
              <>
                <ViewHero viewId="journey" />
                <JourneyExplorer />
                <DeadlineTimeline />
                <MemoryVault />
              </>
            )}

            {activeView === "agent" && (
              <>
                <ViewHero viewId="agent" />
                <AgentActivityPanel />
                <AgentChat />
                <ApprovalsHistory />
              </>
            )}

            {activeView === "countries" && (
              <>
                <ViewHero viewId="countries" />
                <CountryRules />
              </>
            )}

            {activeView === "network" && (
              <>
                <ViewHero viewId="network" />
                <NetworkingJobs />
              </>
            )}

            {activeView === "connectors" && (
              <>
                <ViewHero viewId="connectors" />
                <Connectors />
              </>
            )}

            {activeView === "pricing" && (
              <>
                <ViewHero viewId="pricing" />
                <Pillars />
                <PricingTiers />
                <VisionCTA />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}
