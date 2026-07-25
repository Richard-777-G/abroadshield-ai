"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

type View = "home" | "journey" | "agent" | "countries" | "network" | "connectors" | "pricing";

const VIEWS: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "journey", label: "Journey" },
  { id: "agent", label: "Agent" },
  { id: "countries", label: "Countries" },
  { id: "network", label: "Network" },
  { id: "connectors", label: "Connect" },
  { id: "pricing", label: "Pricing" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<View>("home");

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

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent">
      <SiteHeader
        activeView={activeView as string}
        onViewChange={(id) => setActiveView(id as View)}
        views={VIEWS}
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
                <Hero3D />
                <HomeShowcase />
              </>
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
